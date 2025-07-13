#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 EduTrack Setup Script');
console.log('========================\n');

// Check if Node.js is installed
try {
  const nodeVersion = process.version;
  console.log(`✅ Node.js version: ${nodeVersion}`);
} catch (error) {
  console.error('❌ Node.js is not installed. Please install Node.js first.');
  process.exit(1);
}

// Check if npm is available
try {
  const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
  console.log(`✅ npm version: ${npmVersion}`);
} catch (error) {
  console.error('❌ npm is not available. Please install npm first.');
  process.exit(1);
}

console.log('\n📦 Installing dependencies...\n');

// Install root dependencies
try {
  console.log('Installing root dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Root dependencies installed successfully');
} catch (error) {
  console.error('❌ Failed to install root dependencies');
  process.exit(1);
}

// Install backend dependencies
try {
  console.log('\nInstalling backend dependencies...');
  execSync('cd backend && npm install', { stdio: 'inherit' });
  console.log('✅ Backend dependencies installed successfully');
} catch (error) {
  console.error('❌ Failed to install backend dependencies');
  process.exit(1);
}

// Install frontend dependencies
try {
  console.log('\nInstalling frontend dependencies...');
  execSync('cd frontend && npm install', { stdio: 'inherit' });
  console.log('✅ Frontend dependencies installed successfully');
} catch (error) {
  console.error('❌ Failed to install frontend dependencies');
  process.exit(1);
}

console.log('\n🔧 Setting up environment...\n');

// Create backend .env file if it doesn't exist
const backendEnvPath = path.join(__dirname, 'backend', '.env');
const backendEnvExamplePath = path.join(__dirname, 'backend', 'env.example');

if (!fs.existsSync(backendEnvPath) && fs.existsSync(backendEnvExamplePath)) {
  try {
    fs.copyFileSync(backendEnvExamplePath, backendEnvPath);
    console.log('✅ Backend .env file created from template');
  } catch (error) {
    console.error('❌ Failed to create backend .env file');
  }
}

console.log('\n📊 Database Setup Instructions:');
console.log('1. Create a MySQL database named "edutrack"');
console.log('2. Import the schema from backend/database/schema.sql');
console.log('3. Update database credentials in backend/.env');
console.log('4. Configure email settings in backend/.env (optional)');

console.log('\n🚀 Starting the application:');
console.log('1. Start both backend and frontend: npm run dev');
console.log('2. Start backend only: npm run server');
console.log('3. Start frontend only: npm run client');

console.log('\n🔑 Default Admin Credentials:');
console.log('Username: admin');
console.log('Password: admin123');

console.log('\n📱 Access URLs:');
console.log('Frontend: http://localhost:3000');
console.log('Backend API: http://localhost:5000');
console.log('API Health Check: http://localhost:5000/api/health');

console.log('\n✅ Setup completed successfully!');
console.log('\nHappy coding! 🎉'); 