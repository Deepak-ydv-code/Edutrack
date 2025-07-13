import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { studentsAPI } from '../services/api';
import { Users, Search, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Students = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    class_filter: '',
    status: '',
  });

  const { data, isLoading, error } = useQuery(
    ['students', currentPage, searchTerm, filters],
    () => studentsAPI.getAll({
      page: currentPage,
      limit: 10,
      search: searchTerm,
      ...filters,
    })
  );

  const students = data?.students || [];
  const pagination = data?.pagination || {};

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner h-8 w-8"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-danger-600">Error loading students: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage student information and records
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/students/add"
            className="btn-primary inline-flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Student
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                  Search
                </label>
                <div className="mt-1 relative">
                  <input
                    type="text"
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-10"
                    placeholder="Search by name, ID, or email..."
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
              <div>
                <label htmlFor="class" className="block text-sm font-medium text-gray-700">
                  Class
                </label>
                <select
                  id="class"
                  value={filters.class_filter}
                  onChange={(e) => handleFilterChange('class_filter', e.target.value)}
                  className="input"
                >
                  <option value="">All Classes</option>
                  <option value="9th">9th</option>
                  <option value="10th">10th</option>
                  <option value="11th">11th</option>
                  <option value="12th">12th</option>
                </select>
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  id="status"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="input"
                >
                  <option value="">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Graduated">Graduated</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" className="btn-primary">
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Students Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">
            Students ({pagination.total_records || 0})
          </h3>
        </div>
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Student ID</th>
                  <th className="table-header-cell">Name</th>
                  <th className="table-header-cell">Class</th>
                  <th className="table-header-cell">Email</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell">Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {students.map((student) => (
                  <tr key={student.id}>
                    <td className="table-cell font-medium">{student.student_id}</td>
                    <td className="table-cell">
                      {student.first_name} {student.last_name}
                    </td>
                    <td className="table-cell">
                      {student.class} - {student.section}
                    </td>
                    <td className="table-cell">{student.email || '-'}</td>
                    <td className="table-cell">
                      <span className={`badge ${
                        student.status === 'Active' ? 'badge-success' :
                        student.status === 'Inactive' ? 'badge-warning' :
                        'badge-info'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/progress/${student.id}`}
                          className="text-primary-600 hover:text-primary-900"
                          title="View Progress"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/students/edit/${student.id}`}
                          className="text-warning-600 hover:text-warning-900"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          className="text-danger-600 hover:text-danger-900"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {students.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No students found</p>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((pagination.current_page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.current_page * pagination.limit, pagination.total_records)} of{' '}
            {pagination.total_records} results
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={pagination.current_page === 1}
              className="btn-outline px-3 py-2 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {pagination.current_page} of {pagination.total_pages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(pagination.total_pages, prev + 1))}
              disabled={pagination.current_page === pagination.total_pages}
              className="btn-outline px-3 py-2 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students; 