# EduTrack - Student Performance Dashboard

## 🎯 Project Overview

EduTrack is a comprehensive full-stack student performance dashboard built with modern technologies. It provides a complete solution for educational institutions to manage students, subjects, exams, grades, and generate detailed performance reports.

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js** - Server framework
- **MySQL** - Database with comprehensive schema
- **JWT** - Authentication and authorization
- **bcryptjs** - Password hashing
- **Nodemailer** - Email notifications
- **express-validator** - Input validation
- **helmet** + **morgan** - Security and logging

### Frontend
- **React.js** - UI framework with hooks
- **Tailwind CSS** - Modern styling with custom components
- **Chart.js** + **react-chartjs-2** - Data visualization
- **jsPDF** + **html2canvas** - PDF generation
- **React Query** - Data fetching and caching
- **React Router** - Client-side routing
- **React Hook Form** - Form management
- **Lucide React** - Modern icons
- **React Hot Toast** - Notifications

## 🏗️ Project Structure

```
edutrack/
├── backend/                 # Node.js + Express API
│   ├── config/             # Database configuration
│   ├── database/           # SQL schema and migrations
│   ├── middleware/         # Authentication middleware
│   ├── routes/             # API routes
│   ├── utils/              # Email service utilities
│   ├── server.js           # Main server file
│   └── package.json        # Backend dependencies
├── frontend/               # React application
│   ├── public/             # Static files
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── App.js          # Main app component
│   │   └── index.js        # Entry point
│   └── package.json        # Frontend dependencies
├── package.json            # Root package.json
├── setup.js               # Setup script
└── README.md              # Project documentation
```

## 🎨 Features Implemented

### ✅ Core Features
1. **Admin Authentication**
   - JWT-based login system
   - Secure password hashing
   - Protected routes
   - Session management

2. **Student Management**
   - CRUD operations for students
   - Search and filtering
   - Pagination
   - Status management (Active/Inactive/Graduated)

3. **Subject Management**
   - Add/edit/delete subjects
   - Subject codes and descriptions
   - Credit management

4. **Exam Management**
   - Create and manage exams
   - Different exam types (Midterm, Final, Quiz, Assignment)
   - Subject association
   - Date and marks configuration

5. **Marks/Grades Management**
   - Assign marks to students
   - Automatic grade calculation
   - Bulk marks entry
   - Individual and exam-wise views

6. **Performance Analytics**
   - Interactive charts (Bar & Pie)
   - Subject-wise performance
   - Grade distribution
   - Dashboard statistics

7. **Email Notifications**
   - Automated result notifications to parents
   - Professional email templates
   - Notification logging

### 🎯 Advanced Features
- **Responsive Design** - Mobile-first approach
- **Modern UI/UX** - Clean, professional interface
- **Real-time Data** - React Query for efficient data management
- **Form Validation** - Client and server-side validation
- **Error Handling** - Comprehensive error management
- **Loading States** - User-friendly loading indicators
- **Search & Filter** - Advanced search capabilities
- **Pagination** - Efficient data pagination

## 📊 Database Schema

### Tables
1. **admins** - Admin users and authentication
2. **students** - Student information and details
3. **subjects** - Subject/course information
4. **exams** - Exam details and configuration
5. **marks** - Student marks and grades
6. **notifications** - Email/SMS notification logs

### Key Features
- Foreign key relationships
- Proper indexing
- Data integrity constraints
- Timestamp tracking
- Soft delete support

## 🔐 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt for password security
- **Input Validation** - Server-side validation
- **CORS Protection** - Cross-origin request handling
- **Helmet Security** - HTTP headers protection
- **SQL Injection Prevention** - Parameterized queries

## 📱 User Interface

### Design System
- **Color Palette** - Professional blue/gray theme
- **Typography** - Inter font family
- **Components** - Reusable UI components
- **Icons** - Lucide React icon set
- **Animations** - Smooth transitions and loading states

### Pages
1. **Login** - Secure authentication
2. **Dashboard** - Overview with charts and stats
3. **Students** - Student management with search/filter
4. **Subjects** - Subject management (placeholder)
5. **Exams** - Exam management (placeholder)
6. **Marks** - Grade management (placeholder)
7. **Student Progress** - Individual student analytics (placeholder)

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Installation

1. **Clone and setup:**
   ```bash
   npm run install-all
   # or run setup script
   node setup.js
   ```

2. **Database setup:**
   - Create MySQL database named `edutrack`
   - Import schema from `backend/database/schema.sql`

3. **Environment configuration:**
   - Copy `backend/env.example` to `backend/.env`
   - Update database credentials
   - Configure email settings (optional)

4. **Start development:**
   ```bash
   npm run dev  # Start both backend and frontend
   ```

### Default Credentials
- **Username:** admin
- **Password:** admin123

### Access URLs
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/api/health

## 📈 Performance Features

### Charts & Analytics
- **Bar Charts** - Subject-wise performance
- **Pie Charts** - Grade distribution
- **Real-time Data** - Live statistics
- **Responsive Charts** - Mobile-friendly visualizations

### Data Management
- **React Query** - Efficient data fetching
- **Caching** - Optimized data caching
- **Pagination** - Large dataset handling
- **Search** - Fast search capabilities

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password

### Students
- `GET /api/students` - List students with filters
- `POST /api/students` - Add new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student
- `GET /api/students/:id/progress` - Student progress

### Subjects
- `GET /api/subjects` - List subjects
- `POST /api/subjects` - Add subject
- `PUT /api/subjects/:id` - Update subject
- `DELETE /api/subjects/:id` - Delete subject

### Exams
- `GET /api/exams` - List exams
- `POST /api/exams` - Add exam
- `PUT /api/exams/:id` - Update exam
- `DELETE /api/exams/:id` - Delete exam

### Marks
- `GET /api/marks` - List marks with filters
- `POST /api/marks` - Add/update marks
- `POST /api/marks/bulk` - Bulk marks entry
- `DELETE /api/marks/:id` - Delete marks
- `POST /api/marks/:id/notify` - Send notifications

## 🎯 Future Enhancements

### Planned Features
1. **PDF Reports** - Student report generation
2. **SMS Notifications** - Text message alerts
3. **Advanced Analytics** - More detailed charts
4. **Student Portal** - Student login access
5. **Parent Portal** - Parent login access
6. **Attendance Management** - Track attendance
7. **Fee Management** - Financial tracking
8. **Timetable Management** - Class scheduling

### Technical Improvements
1. **Unit Testing** - Jest and React Testing Library
2. **E2E Testing** - Cypress integration
3. **Docker Support** - Containerization
4. **CI/CD Pipeline** - Automated deployment
5. **Performance Optimization** - Code splitting and lazy loading
6. **PWA Support** - Progressive web app features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **React Team** - For the amazing framework
- **Tailwind CSS** - For the utility-first CSS framework
- **Chart.js** - For the excellent charting library
- **Lucide** - For the beautiful icon set

---

**EduTrack** - Empowering education through technology! 🎓✨ 