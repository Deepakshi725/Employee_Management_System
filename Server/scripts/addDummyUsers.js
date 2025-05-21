import mongoose from "mongoose";
import dotenv from "dotenv";
import { Users } from "../models/User.js";
import bcrypt from "bcrypt";

dotenv.config();

const dummyUsers = [
  { email: "masteradmin@gmail.com", password: "masteradmin", firstName: "Master", lastName: "Admin", role: "master", phoneNum: "1111111111" },
  { email: "admin1@example.com", password: "password", firstName: "Admin", lastName: "One", role: "admin", phoneNum: "2222222222" },
  { email: "manager1@example.com", password: "password", firstName: "Manager", lastName: "One", role: "manager", phoneNum: "3333333333", managerEmail: "admin1@example.com" },
  { email: "manager2@example.com", password: "password", firstName: "Manager", lastName: "Two", role: "manager", phoneNum: "4444444444", managerEmail: "admin1@example.com" },
  { email: "tl1@example.com", password: "password", firstName: "Team Leader", lastName: "One", role: "tl", phoneNum: "5555555555", managerEmail: "manager1@example.com" },
  { email: "tl2@example.com", password: "password", firstName: "Team Leader", lastName: "Two", role: "tl", phoneNum: "6666666666", managerEmail: "manager1@example.com" },
  { email: "tl3@example.com", password: "password", firstName: "Team Leader", lastName: "Three", role: "tl", phoneNum: "7777777777", managerEmail: "manager2@example.com" },
  { email: "user1@example.com", password: "password", firstName: "User", lastName: "One", role: "user", phoneNum: "8888888888", managerEmail: "manager1@example.com", tlEmail: "tl1@example.com" },
  { email: "user2@example.com", password: "password", firstName: "User", lastName: "Two", role: "user", phoneNum: "9999999999", managerEmail: "manager1@example.com", tlEmail: "tl1@example.com" },
  { email: "user3@example.com", password: "password", firstName: "User", lastName: "Three", role: "user", phoneNum: "1010101010", managerEmail: "manager1@example.com", tlEmail: "tl2@example.com" },
  { email: "user4@example.com", password: "password", firstName: "User", lastName: "Four", role: "user", phoneNum: "1212121212", managerEmail: "manager2@example.com", tlEmail: "tl3@example.com" },
];

const addDummyUsers = async () => {
  try {
    await mongoose.connect(process.env.database_URI);
    console.log("Database connected.");

    for (const userData of dummyUsers) {
      const existingUser = await Users.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`User with email ${userData.email} already exists. Skipping.`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const newUser = new Users({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: hashedPassword,
        phoneNum: userData.phoneNum,
        role: userData.role,
        // managerId and tlId will be set in a second pass
      });

      await newUser.save();
      console.log(`Added user: ${newUser.email}`);
    }

    console.log("Setting up reporting hierarchy...");
    for (const userData of dummyUsers) {
      const currentUser = await Users.findOne({ email: userData.email });
      if (!currentUser) continue; // Should not happen if users were added

      if (userData.managerEmail) {
        const manager = await Users.findOne({ email: userData.managerEmail });
        if (manager) {
          currentUser.managerId = manager._id;
        } else {
          console.warn(`Manager with email ${userData.managerEmail} not found for user ${userData.email}`);
        }
      }

      if (userData.tlEmail) {
        const teamLeader = await Users.findOne({ email: userData.tlEmail });
        if (teamLeader) {
          currentUser.tlId = teamLeader._id;
        } else {
           console.warn(`Team Leader with email ${userData.tlEmail} not found for user ${userData.email}`);
        }
      }

      await currentUser.save();
    }

    console.log("Dummy users added and hierarchy set up successfully.");

  } catch (error) {
    console.error("Error adding dummy users:", error);
  } finally {
    mongoose.connection.close();
    console.log("Database connection closed.");
  }
};

addDummyUsers();
