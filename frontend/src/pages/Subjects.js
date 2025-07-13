import React from 'react';
import { BookOpen } from 'lucide-react';

const Subjects = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage subjects and course information
        </p>
      </div>
      
      <div className="card">
        <div className="card-body text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Subjects Management</h3>
          <p className="text-gray-500">This page will contain subject management functionality.</p>
        </div>
      </div>
    </div>
  );
};

export default Subjects; 