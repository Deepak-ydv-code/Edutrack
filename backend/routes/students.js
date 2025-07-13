const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/students
// @desc    Get all students
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', class_filter = '', status = '' } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT s.*, 
                   COUNT(m.id) as total_exams,
                   AVG(m.marks_obtained) as average_marks
            FROM students s
            LEFT JOIN marks m ON s.id = m.student_id
        `;

        const whereConditions = [];
        const queryParams = [];

        if (search) {
            whereConditions.push(`(s.first_name LIKE ? OR s.last_name LIKE ? OR s.student_id LIKE ? OR s.email LIKE ?)`);
            const searchTerm = `%${search}%`;
            queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        if (class_filter) {
            whereConditions.push('s.class = ?');
            queryParams.push(class_filter);
        }

        if (status) {
            whereConditions.push('s.status = ?');
            queryParams.push(status);
        }

        if (whereConditions.length > 0) {
            query += ' WHERE ' + whereConditions.join(' AND ');
        }

        query += ' GROUP BY s.id ORDER BY s.created_at DESC LIMIT ? OFFSET ?';
        queryParams.push(parseInt(limit), offset);

        const [students] = await pool.execute(query, queryParams);

        // Get total count for pagination
        let countQuery = 'SELECT COUNT(*) as total FROM students s';
        if (whereConditions.length > 0) {
            countQuery += ' WHERE ' + whereConditions.join(' AND ');
        }
        const [countResult] = await pool.execute(countQuery, queryParams.slice(0, -2));
        const total = countResult[0].total;

        res.json({
            success: true,
            students,
            pagination: {
                current_page: parseInt(page),
                total_pages: Math.ceil(total / limit),
                total_records: total,
                limit: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/students/:id
// @desc    Get student by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const [students] = await pool.execute(
            'SELECT * FROM students WHERE id = ?',
            [req.params.id]
        );

        if (students.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        res.json({
            success: true,
            student: students[0]
        });

    } catch (error) {
        console.error('Get student error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/students
// @desc    Add new student
// @access  Private
router.post('/', [
    auth,
    body('student_id', 'Student ID is required').not().isEmpty(),
    body('first_name', 'First name is required').not().isEmpty(),
    body('last_name', 'Last name is required').not().isEmpty(),
    body('class', 'Class is required').not().isEmpty(),
    body('email').optional().isEmail().withMessage('Invalid email format'),
    body('parent_email').optional().isEmail().withMessage('Invalid parent email format')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors: errors.array()
            });
        }

        const {
            student_id, first_name, last_name, email, phone, date_of_birth,
            gender, class: studentClass, section, parent_name, parent_email,
            parent_phone, address, admission_date, status = 'Active'
        } = req.body;

        // Check if student_id already exists
        const [existingStudents] = await pool.execute(
            'SELECT id FROM students WHERE student_id = ?',
            [student_id]
        );

        if (existingStudents.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Student ID already exists'
            });
        }

        // Check if email already exists (if provided)
        if (email) {
            const [existingEmails] = await pool.execute(
                'SELECT id FROM students WHERE email = ?',
                [email]
            );

            if (existingEmails.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already exists'
                });
            }
        }

        const [result] = await pool.execute(`
            INSERT INTO students (
                student_id, first_name, last_name, email, phone, date_of_birth,
                gender, class, section, parent_name, parent_email, parent_phone,
                address, admission_date, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            student_id, first_name, last_name, email, phone, date_of_birth,
            gender, studentClass, section, parent_name, parent_email, parent_phone,
            address, admission_date, status
        ]);

        const [newStudent] = await pool.execute(
            'SELECT * FROM students WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'Student added successfully',
            student: newStudent[0]
        });

    } catch (error) {
        console.error('Add student error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PUT /api/students/:id
// @desc    Update student
// @access  Private
router.put('/:id', [
    auth,
    body('first_name', 'First name is required').not().isEmpty(),
    body('last_name', 'Last name is required').not().isEmpty(),
    body('class', 'Class is required').not().isEmpty(),
    body('email').optional().isEmail().withMessage('Invalid email format'),
    body('parent_email').optional().isEmail().withMessage('Invalid parent email format')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors: errors.array()
            });
        }

        const {
            first_name, last_name, email, phone, date_of_birth,
            gender, class: studentClass, section, parent_name, parent_email,
            parent_phone, address, admission_date, status
        } = req.body;

        // Check if student exists
        const [existingStudents] = await pool.execute(
            'SELECT id FROM students WHERE id = ?',
            [req.params.id]
        );

        if (existingStudents.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Check if email already exists (if provided and changed)
        if (email) {
            const [existingEmails] = await pool.execute(
                'SELECT id FROM students WHERE email = ? AND id != ?',
                [email, req.params.id]
            );

            if (existingEmails.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already exists'
                });
            }
        }

        await pool.execute(`
            UPDATE students SET
                first_name = ?, last_name = ?, email = ?, phone = ?, date_of_birth = ?,
                gender = ?, class = ?, section = ?, parent_name = ?, parent_email = ?,
                parent_phone = ?, address = ?, admission_date = ?, status = ?
            WHERE id = ?
        `, [
            first_name, last_name, email, phone, date_of_birth,
            gender, studentClass, section, parent_name, parent_email,
            parent_phone, address, admission_date, status, req.params.id
        ]);

        const [updatedStudent] = await pool.execute(
            'SELECT * FROM students WHERE id = ?',
            [req.params.id]
        );

        res.json({
            success: true,
            message: 'Student updated successfully',
            student: updatedStudent[0]
        });

    } catch (error) {
        console.error('Update student error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   DELETE /api/students/:id
// @desc    Delete student
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        // Check if student exists
        const [existingStudents] = await pool.execute(
            'SELECT id FROM students WHERE id = ?',
            [req.params.id]
        );

        if (existingStudents.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Delete student (marks will be deleted automatically due to CASCADE)
        await pool.execute(
            'DELETE FROM students WHERE id = ?',
            [req.params.id]
        );

        res.json({
            success: true,
            message: 'Student deleted successfully'
        });

    } catch (error) {
        console.error('Delete student error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/students/:id/progress
// @desc    Get student progress data for charts
// @access  Private
router.get('/:id/progress', auth, async (req, res) => {
    try {
        const [progress] = await pool.execute(`
            SELECT 
                e.exam_name,
                e.exam_type,
                e.exam_date,
                e.total_marks,
                m.marks_obtained,
                m.grade,
                sub.subject_name,
                ROUND((m.marks_obtained / e.total_marks) * 100, 2) as percentage
            FROM marks m
            JOIN exams e ON m.exam_id = e.id
            JOIN subjects sub ON e.subject_id = sub.id
            WHERE m.student_id = ?
            ORDER BY e.exam_date DESC
        `, [req.params.id]);

        // Calculate summary statistics
        const totalExams = progress.length;
        const averagePercentage = totalExams > 0 
            ? progress.reduce((sum, exam) => sum + exam.percentage, 0) / totalExams 
            : 0;

        // Group by subject for subject-wise performance
        const subjectPerformance = {};
        progress.forEach(exam => {
            if (!subjectPerformance[exam.subject_name]) {
                subjectPerformance[exam.subject_name] = [];
            }
            subjectPerformance[exam.subject_name].push(exam);
        });

        // Calculate subject averages
        const subjectAverages = Object.keys(subjectPerformance).map(subject => {
            const exams = subjectPerformance[subject];
            const avgPercentage = exams.reduce((sum, exam) => sum + exam.percentage, 0) / exams.length;
            return {
                subject: subject,
                average: Math.round(avgPercentage * 100) / 100,
                examCount: exams.length
            };
        });

        res.json({
            success: true,
            progress,
            summary: {
                totalExams,
                averagePercentage: Math.round(averagePercentage * 100) / 100,
                subjectAverages
            }
        });

    } catch (error) {
        console.error('Get student progress error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router; 