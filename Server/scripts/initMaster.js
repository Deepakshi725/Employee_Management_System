import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Users } from '../models/User.js';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the server directory
dotenv.config({ path: join(__dirname, '..', '.env') });

const initializeMasterAdmin = async () => {
  try {
    if (!process.env.database_URI) {
      throw new Error('database_URI is not defined in environment variables');
    }

    await mongoose.connect(process.env.database_URI);
    console.log('Connected to database');

    // Check if master admin already exists
    const existingMaster = await Users.findOne({ email: 'masteradmin@gmail.com' });
    if (existingMaster) {
      console.log('Master admin already exists');
      process.exit(0);
    }

    // Create master admin
    const hashedPassword = await bcrypt.hash('masteradmin', 10);
    const masterAdmin = new Users({
      firstName: 'Master',
      lastName: 'Admin',
      email: 'masteradmin@gmail.com',
      password: hashedPassword,
      phoneNum: '0000000000',
      role: 'master',
      status: 'active'
    });

    await masterAdmin.save();
    console.log('Master admin created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

initializeMasterAdmin(); 