require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');
const bcrypt = require('bcryptjs');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Project.deleteMany();
    await Task.deleteMany();
    await ActivityLog.deleteMany();

    console.log('Cleared existing data.');

    // Create Users
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const memberPassword = await bcrypt.hash('user123', salt);

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@sprinthub.com',
      password: 'admin123',
      role: 'admin',
    });

    const member = await User.create({
      name: 'Team Member',
      email: 'user@sprinthub.com',
      password: 'user123',
      role: 'member',
    });

    console.log('Created Users.');

    // Create Projects
    const project1 = await Project.create({
      title: 'SprintHub Redesign',
      description: 'Complete overhaul of the user interface with modern aesthetics and dark mode support.',
      admin: admin._id,
      members: [admin._id, member._id],
      progress: 65,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    });

    const project2 = await Project.create({
      title: 'API Integration',
      description: 'Refactor backend services to support real-time updates using Socket.IO.',
      admin: admin._id,
      members: [admin._id],
      progress: 30,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    });

    console.log('Created Projects.');

    // Create Tasks
    await Task.create([
      {
        title: 'Design Login UI',
        description: 'Create a stunning login page with glassmorphism and smooth animations.',
        priority: 'high',
        status: 'completed',
        assignedTo: member._id,
        project: project1._id,
        createdBy: admin._id,
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Implement JWT Auth',
        description: 'Secure all API routes with JSON Web Tokens and bcrypt hashing.',
        priority: 'high',
        status: 'in-progress',
        assignedTo: admin._id,
        project: project1._id,
        createdBy: admin._id,
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Setup MongoDB Schema',
        description: 'Define Mongoose models for Users, Projects, and Tasks.',
        priority: 'medium',
        status: 'completed',
        assignedTo: admin._id,
        project: project2._id,
        createdBy: admin._id,
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Kanban Board D&D',
        description: 'Add drag and drop functionality to the task columns.',
        priority: 'medium',
        status: 'todo',
        assignedTo: member._id,
        project: project1._id,
        createdBy: admin._id,
        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      }
    ]);

    console.log('Created Tasks.');
    console.log('Seeding completed successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error during seeding: ${error.message}`);
    process.exit(1);
  }
};

seedData();
