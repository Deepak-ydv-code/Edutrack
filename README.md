# EduTrack – Student Performance Dashboard

A comprehensive full-stack application for managing student performance, grades, and generating detailed reports with charts and PDF exports.

## 🎯 Features

- **Admin Authentication** - Secure JWT-based login system
- **Student Management** - Add, edit, and manage student records
- **Subject & Exam Management** - Organize subjects and create exams
- **Grade Assignment** - Assign marks and grades to students
- **Performance Analytics** - Interactive charts (Bar & Pie) using Chart.js
- **PDF Reports** - Export detailed student reports as PDF
- **Email Notifications** - Send results to parents via email
- **Responsive Design** - Modern UI with Tailwind CSS

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js** - Server framework
- **MySQL** - Database
- **JWT** - Authentication
- **Nodemailer** - Email notifications
- **bcryptjs** - Password hashing

### Frontend
- **React.js** - UI framework
- **Tailwind CSS** - Styling
- **Chart.js** - Data visualization
- **jsPDF** - PDF generation
- **Axios** - HTTP client

## 📁 Project Structure

```
edutrack/
├── backend/          # Node.js + Express server
├── frontend/         # React application
├── package.json      # Root package.json
└── README.md         # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm run install-all
   ```

2. **Setup Database:**
   - Create MySQL database named `edutrack`
   - Import the SQL schema from `backend/database/schema.sql`

3. **Configure Environment:**
   - Copy `backend/.env.example` to `backend/.env`
   - Update database credentials and email settings

4. **Start Development Servers:**
   ```bash
   npm run dev
   ```

### Default Admin Credentials
- **Username:** admin
- **Password:** admin123

## 📊 Database Schema

- **admins** - Admin users
- **students** - Student information
- **subjects** - Subject details
- **exams** - Exam information
- **marks** - Student marks/grades

## 🔧 Available Scripts

- `npm run dev` - Start both backend and frontend in development
- `npm run server` - Start backend server only
- `npm run client` - Start frontend only
- `npm run build` - Build frontend for production
- `npm start` - Start production server

## 📱 Screenshots

*Screenshots will be added after development*

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License. 