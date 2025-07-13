import React from 'react';
import { useQuery } from 'react-query';
import { studentsAPI, subjectsAPI, examsAPI, marksAPI } from '../services/api';
import {
  Users,
  BookOpen,
  FileText,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  // Fetch data
  const { data: studentsData } = useQuery('students', () => studentsAPI.getAll({ limit: 1000 }));
  const { data: subjectsData } = useQuery('subjects', () => subjectsAPI.getAll());
  const { data: examsData } = useQuery('exams', () => examsAPI.getAll({ limit: 1000 }));
  const { data: marksData } = useQuery('marks', () => marksAPI.getAll({ limit: 1000 }));

  const students = studentsData?.students || [];
  const subjects = subjectsData?.subjects || [];
  const exams = examsData?.exams || [];
  const marks = marksData?.marks || [];

  // Calculate statistics
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.status === 'Active').length;
  const totalSubjects = subjects.length;
  const totalExams = exams.length;
  const totalMarks = marks.length;

  // Calculate average performance
  const averagePerformance = marks.length > 0 
    ? (marks.reduce((sum, mark) => sum + (mark.marks_obtained / mark.total_marks) * 100, 0) / marks.length).toFixed(1)
    : 0;

  // Performance by subject
  const performanceBySubject = subjects.map(subject => {
    const subjectMarks = marks.filter(mark => 
      exams.find(exam => exam.id === mark.exam_id)?.subject_id === subject.id
    );
    const avg = subjectMarks.length > 0
      ? (subjectMarks.reduce((sum, mark) => sum + (mark.marks_obtained / mark.total_marks) * 100, 0) / subjectMarks.length).toFixed(1)
      : 0;
    return {
      subject: subject.subject_name,
      average: parseFloat(avg),
      count: subjectMarks.length
    };
  }).filter(item => item.count > 0);

  // Grade distribution
  const gradeDistribution = marks.reduce((acc, mark) => {
    const grade = mark.grade || 'N/A';
    acc[grade] = (acc[grade] || 0) + 1;
    return acc;
  }, {});

  // Chart data
  const performanceChartData = {
    labels: performanceBySubject.map(item => item.subject),
    datasets: [
      {
        label: 'Average Performance (%)',
        data: performanceBySubject.map(item => item.average),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const gradeChartData = {
    labels: Object.keys(gradeDistribution),
    datasets: [
      {
        data: Object.values(gradeDistribution),
        backgroundColor: [
          '#22c55e', // A+
          '#16a34a', // A
          '#3b82f6', // B+
          '#2563eb', // B
          '#f59e0b', // C+
          '#d97706', // C
          '#ef4444', // F
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = 'primary' }) => (
    <div className="card">
      <div className="card-body">
        <div className="flex items-center">
          <div className={`flex-shrink-0 p-3 rounded-lg bg-${color}-100`}>
            <Icon className={`h-6 w-6 text-${color}-600`} />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            {trend && (
              <div className="flex items-center mt-1">
                {trend === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-success-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-danger-500" />
                )}
                <span className={`ml-1 text-sm ${
                  trend === 'up' ? 'text-success-600' : 'text-danger-600'
                }`}>
                  {trendValue}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of student performance and academic statistics
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value={totalStudents}
          icon={Users}
          color="primary"
        />
        <StatCard
          title="Active Students"
          value={activeStudents}
          icon={Activity}
          color="success"
        />
        <StatCard
          title="Total Subjects"
          value={totalSubjects}
          icon={BookOpen}
          color="warning"
        />
        <StatCard
          title="Total Exams"
          value={totalExams}
          icon={FileText}
          color="secondary"
        />
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Average Performance by Subject</h3>
          </div>
          <div className="card-body">
            {performanceBySubject.length > 0 ? (
              <Bar data={performanceChartData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No performance data available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Grade Distribution</h3>
          </div>
          <div className="card-body">
            {Object.keys(gradeDistribution).length > 0 ? (
              <Pie data={gradeChartData} options={pieOptions} />
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No grade data available</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-primary-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Students Registered</p>
                  <p className="text-sm text-gray-500">{totalStudents} total students</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{activeStudents} active</p>
                <p className="text-sm text-gray-500">
                  {((activeStudents / totalStudents) * 100).toFixed(1)}% active rate
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-success-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-success-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Marks Recorded</p>
                  <p className="text-sm text-gray-500">{totalMarks} total marks</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{averagePerformance}%</p>
                <p className="text-sm text-gray-500">average performance</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-warning-100 rounded-full flex items-center justify-center">
                  <FileText className="h-4 w-4 text-warning-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Exams Conducted</p>
                  <p className="text-sm text-gray-500">{totalExams} total exams</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{totalSubjects}</p>
                <p className="text-sm text-gray-500">subjects covered</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 