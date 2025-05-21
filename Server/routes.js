import express from "express";
const router = express.Router();
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Users } from "./models/User.js";
import { Notification } from "./models/Notification.js";
import { auth } from "./middleware/auth.js";
import mongoose from 'mongoose'; // Import mongoose for aggregation

// Helper function to check role hierarchy
const canManageRole = (currentUserRole, targetRole) => {
  const roleHierarchy = {
    master: 4,
    admin: 3,
    manager: 2,
    tl: 1,
    user: 0
  };
  return roleHierarchy[currentUserRole] > roleHierarchy[targetRole];
};

router.post("/SignUp", async (req, res) => {
    try {
      const { firstName, lastName, email, password, phoneNum } = req.body;
      if (!firstName || !lastName || !email || !password || !phoneNum) {
        return res.status(400).json({ message: "All fields are required" });
      }
  
      const existingUser = await Users.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new Users({
        firstName,
        lastName,
        email,
        phoneNum,
        password: hashedPassword,
      });
  
      await newUser.save();
      const token = jwt.sign({ email: newUser.email }, process.env.JWT_SECRET, {
        expiresIn: "1h", // token expiration
      });
  
      res.status(201).json({
        message: "User signed up successfully",
        token,
        user: {
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email
        }
      });
    } catch (error) {
      console.error("SignUp Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Login Route
  router.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await Users.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
  
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid password" });
      }
  
      const token = jwt.sign(
        { 
          email: user.email,
          role: user.role,
          id: user._id 
        }, 
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
  
      res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          department: user.department,
          position: user.position,
          status: user.status
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get current user info
  router.get("/me", auth, async (req, res) => {
    try {
      const user = await Users.findById(req.user.id).select('-password');
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all users (with role-based filtering)
  router.get("/users", auth, async (req, res) => {
    try {
      const currentUser = await Users.findById(req.user.id);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }

      let query = {};
      // Filter based on role hierarchy
      if (currentUser.role !== 'master') {
        if (currentUser.role === 'admin') {
          query = { role: { $in: ['manager', 'tl', 'user'] } };
        } else if (currentUser.role === 'manager') {
          query = { 
            $or: [
              { managerId: currentUser._id },
              { tlId: { $in: await Users.find({ managerId: currentUser._id }).select('_id') } }
            ]
          };
        } else if (currentUser.role === 'tl') {
          query = { tlId: currentUser._id };
        }
      }

      const users = await Users.find(query).select('-password');
      res.json({ users });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create new user
  router.post("/users", auth, async (req, res) => {
    try {
      console.log("Create user request body:", req.body);
      const currentUser = await Users.findById(req.user.id);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const { firstName, lastName, email, password, phoneNum, role, department, position, tlId, managerId } = req.body;

      // Check if user has permission to create this role
      if (!canManageRole(currentUser.role, role)) {
        return res.status(403).json({ message: "You don't have permission to create users with this role" });
      }

      // Validate hierarchy
      if (role === 'user' && !tlId) {
        return res.status(400).json({ message: "Users must have a Team Leader" });
      }
      if ((role === 'user' || role === 'tl') && !managerId) {
        return res.status(400).json({ message: "Users and Team Leaders must have a Manager" });
      }

      const existingUser = await Users.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new Users({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phoneNum,
        role,
        department,
        position,
        tlId,
        managerId
      });

      await newUser.save();
      res.status(201).json({
        message: "User created successfully",
        user: {
          id: newUser._id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          role: newUser.role,
          department: newUser.department,
          position: newUser.position
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update user
  router.put("/users/:id", auth, async (req, res) => {
    try {
      const currentUser = await Users.findById(req.user.id);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const userToUpdate = await Users.findById(req.params.id);
      if (!userToUpdate) {
        return res.status(404).json({ message: "User to update not found" });
      }

      // Check if user has permission to update this user, unless they are updating their own profile
      if (currentUser._id.toString() !== req.params.id && !canManageRole(currentUser.role, userToUpdate.role)) {
        return res.status(403).json({ message: "You don't have permission to update this user" });
      }

      const { firstName, lastName, email, phoneNum, role, department, position, tlId, managerId, status } = req.body;

      // Validate hierarchy changes *only if* the role is being changed AND it's not a self-update
      if (role && role !== userToUpdate.role && currentUser._id.toString() !== req.params.id) {
         if (!canManageRole(currentUser.role, role)) {
           return res.status(403).json({ message: "You don't have permission to assign this role" });
         }
      }

      const updates = {
        firstName,
        lastName,
        email,
        phoneNum,
        role,
        department,
        position,
        tlId,
        managerId,
        status
      };

      // Remove undefined fields
      Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);

      const updatedUser = await Users.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { new: true }
      ).select('-password');

      res.json({
        message: "User updated successfully",
        user: updatedUser
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete user
  router.delete("/users/:id", auth, async (req, res) => {
    try {
      const currentUser = await Users.findById(req.user.id);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const userToDelete = await Users.findById(req.params.id);
      if (!userToDelete) {
        return res.status(404).json({ message: "User to delete not found" });
      }

      // Check if user has permission to delete this user
      if (!canManageRole(currentUser.role, userToDelete.role)) {
        return res.status(403).json({ message: "You don't have permission to delete this user" });
      }

      // Check if user has subordinates
      const hasSubordinates = await Users.findOne({
        $or: [
          { tlId: req.params.id },
          { managerId: req.params.id }
        ]
      });

      if (hasSubordinates) {
        return res.status(400).json({ message: "Cannot delete user with subordinates. Reassign subordinates first." });
      }

      await Users.findByIdAndDelete(req.params.id);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get notifications for authenticated user
  router.get("/notifications", auth, async (req, res) => {
    try {
      const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
      res.json({ notifications });
    } catch (error) {
      console.error("Fetch notifications error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Mark a notification as read
  router.put("/notifications/:id/mark-read", auth, async (req, res) => {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, user: req.user.id },
        { $set: { read: true } },
        { new: true }
      );

      if (!notification) {
        return res.status(404).json({ message: "Notification not found or does not belong to user" });
      }

      res.json({ message: "Notification marked as read", notification });
    } catch (error) {
      console.error("Mark notification as read error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Mark all notifications as read
  router.put("/notifications/mark-all-read", auth, async (req, res) => {
    try {
      await Notification.updateMany(
        { user: req.user.id, read: false },
        { $set: { read: true } }
      );

      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      console.error("Mark all notifications as read error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get dashboard statistics for authenticated user
  router.get("/dashboard/stats", auth, async (req, res) => {
    try {
      console.log("Dashboard stats request received");
      console.log("User from token:", req.user);
      
      const currentUser = await Users.findById(req.user.id);
      if (!currentUser) {
        console.log("User not found in database");
        return res.status(404).json({ message: "User not found" });
      }
      console.log("Current user role:", currentUser.role);

      let stats = {};

      // Get total counts based on user role
      if (currentUser.role === 'master') {
        // Master can see all counts
        const [totalEmployees, admins, managers, teamLeaders, users] = await Promise.all([
          Users.countDocuments(),
          Users.countDocuments({ role: 'admin' }),
          Users.countDocuments({ role: 'manager' }),
          Users.countDocuments({ role: 'tl' }),
          Users.countDocuments({ role: 'user' })
        ]);

        stats = {
          totalEmployees,
          admins,
          managers,
          teamLeaders,
          users
        };
        console.log("Master stats:", stats);
      } else if (currentUser.role === 'admin') {
        // Admin can see managers, TLs, and users
        const [managers, teamLeaders, users] = await Promise.all([
          Users.countDocuments({ role: 'manager' }),
          Users.countDocuments({ role: 'tl' }),
          Users.countDocuments({ role: 'user' })
        ]);

        stats = {
          managers,
          teamLeaders,
          users
        };
        console.log("Admin stats:", stats);
      } else if (currentUser.role === 'manager') {
        // Manager can see their TLs and team members
        const [managerTeamLeaders, managerTeamMembers] = await Promise.all([
          Users.countDocuments({ managerId: currentUser._id, role: 'tl' }),
          Users.countDocuments({ 
            $or: [
              { managerId: currentUser._id, role: 'user' },
              { tlId: { $in: await Users.find({ managerId: currentUser._id, role: 'tl' }).select('_id') } }
            ]
          })
        ]);

        stats = {
          managerTeamLeaders,
          managerTeamMembers
        };
        console.log("Manager stats:", stats);
      } else if (currentUser.role === 'tl') {
        // Team Leader can see their team members
        const tlTeamMembers = await Users.countDocuments({ tlId: currentUser._id, role: 'user' });
        stats = {
          tlTeamMembers
        };
        console.log("TL stats:", stats);
      }

      res.json({ stats });
    } catch (error) {
      console.error("Dashboard stats error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

// Add a new endpoint to get a single user by ID
router.get("/users/:id", auth, async (req, res) => {
  try {
    console.log("Fetch user by ID request received for ID:", req.params.id);
    const user = await Users.findById(req.params.id).select('-password');
    if (!user) {
      console.log("User not found for ID:", req.params.id);
      return res.status(404).json({ message: "User not found" });
    }
    console.log("User found:", user);
    res.json({ user });
  } catch (error) {
    console.error("Fetch user by ID error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;