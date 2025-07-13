import React from 'react';
import { BarChart3 } from 'lucide-react';

const Marks = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Marks</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage student marks and grades
        </p>
      </div>
      
      <div className="card">
        <div className="card-body text-center py-12">
          <BarChart3 className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Marks Management</h3>
          <p className="text-gray-500">This page will contain marks and grades management functionality.</p>
        </div>
      </div>
    </div>
  );
};

export default Marks; 