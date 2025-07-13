import React from 'react';
import { useParams } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';

const StudentProgress = () => {
  const { studentId } = useParams();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Student Progress</h1>
        <p className="mt-1 text-sm text-gray-500">
          View detailed progress and performance analytics for student ID: {studentId}
        </p>
      </div>
      
      <div className="card">
        <div className="card-body text-center py-12">
          <TrendingUp className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Student Progress Analytics</h3>
          <p className="text-gray-500">This page will contain detailed student progress charts and analytics.</p>
        </div>
      </div>
    </div>
  );
};

export default StudentProgress; 