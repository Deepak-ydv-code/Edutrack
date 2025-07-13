const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const auth = require('../middleware/auth');
const { sendResultsToParent } = require('../utils/emailService');

const router = express.Router();

// Helper function to calculate grade
const calculateGrade = (marksObtained, totalMarks) => {
    const percentage = (marksObtained / totalMarks) * 100;
    
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C+';
    if (percentage >= 40) return 'C';
    return 'F';
};

// @route   GET /api/marks
// @desc    Get all marks with filters
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const { student_id = '', exam_id = '', subject_id = '' } = req.query;

        let query = `
            SELECT m.*, 
                   s.first_name, s.last_name, s.student_id as student_code, s.class, s.section,
                   e.exam_name, e.exam_type, e.total_marks, e.passing_marks,
                   sub.subject_name, sub.subject_code
            FROM marks m
            JOIN students s ON m.student_id = s.id
            JOIN exams e ON m.exam_id = e.id
            JOIN subjects sub ON e.subject_id = sub.id
        `;
        const queryParams = [];
        const whereConditions = [];

        if (student_id) {
            whereConditions.push('m.student_id = ?');
            queryParams.push(student_id);
        }

        if (exam_id) {
            whereConditions.push('m.exam_id = ?');
            queryParams.push(exam_id);
        }

        if (subject_id) {
            whereConditions.push('e.subject_id = ?');
            queryParams.push(subject_id);
        }

        if (whereConditions.length > 0) {
            query += ' WHERE ' + whereConditions.join(' AND ');
        }

        query += ' ORDER BY e.exam_date DESC, s.first_name ASC';

        const [marks] = await pool.execute(query, queryParams);

        res.json({
            success: true,
            marks
        });

    } catch (error) {
        console.error('Get marks error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/marks/exam/:examId
// @desc    Get all marks for a specific exam
// @access  Private
router.get('/exam/:examId', auth, async (req, res) => {
    try {
        const [marks] = await pool.execute(`
            SELECT m.*, 
                   s.first_name, s.last_name, s.student_id as student_code, s.class, s.section,
                   e.exam_name, e.exam_type, e.total_marks, e.passing_marks,
                   sub.subject_name, sub.subject_code
            FROM marks m
            JOIN students s ON m.student_id = s.id
            JOIN exams e ON m.exam_id = e.id
            JOIN subjects sub ON e.subject_id = sub.id
            WHERE m.exam_id = ?
            ORDER BY s.first_name ASC
        `, [req.params.examId]);

        res.json({
            success: true,
            marks
        });

    } catch (error) {
        console.error('Get exam marks error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/marks
// @desc    Add/Update marks for a student
// @access  Private
router.post('/', [
    auth,
    body('student_id', 'Student ID is required').isInt(),
    body('exam_id', 'Exam ID is required').isInt(),
    body('marks_obtained', 'Marks obtained is required').isFloat({ min: 0 }),
    body('remarks').optional().isString()
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

        const { student_id, exam_id, marks_obtained, remarks } = req.body;

        // Check if student exists
        const [students] = await pool.execute(
            'SELECT id FROM students WHERE id = ?',
            [student_id]
        );

        if (students.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Check if exam exists and get exam details
        const [exams] = await pool.execute(
            'SELECT * FROM exams WHERE id = ?',
            [exam_id]
        );

        if (exams.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Exam not found'
            });
        }

        const exam = exams[0];

        // Validate marks
        if (marks_obtained > exam.total_marks) {
            return res.status(400).json({
                success: false,
                message: 'Marks obtained cannot be greater than total marks'
            });
        }

        // Calculate grade
        const grade = calculateGrade(marks_obtained, exam.total_marks);

        // Check if marks already exist for this student and exam
        const [existingMarks] = await pool.execute(
            'SELECT id FROM marks WHERE student_id = ? AND exam_id = ?',
            [student_id, exam_id]
        );

        let result;
        if (existingMarks.length > 0) {
            // Update existing marks
            await pool.execute(`
                UPDATE marks SET marks_obtained = ?, grade = ?, remarks = ?
                WHERE student_id = ? AND exam_id = ?
            `, [marks_obtained, grade, remarks, student_id, exam_id]);
            
            result = { insertId: existingMarks[0].id };
        } else {
            // Insert new marks
            [result] = await pool.execute(`
                INSERT INTO marks (student_id, exam_id, marks_obtained, grade, remarks)
                VALUES (?, ?, ?, ?, ?)
            `, [student_id, exam_id, marks_obtained, grade, remarks]);
        }

        const [newMarks] = await pool.execute(`
            SELECT m.*, 
                   s.first_name, s.last_name, s.student_id as student_code,
                   e.exam_name, e.total_marks,
                   sub.subject_name
            FROM marks m
            JOIN students s ON m.student_id = s.id
            JOIN exams e ON m.exam_id = e.id
            JOIN subjects sub ON e.subject_id = sub.id
            WHERE m.id = ?
        `, [result.insertId]);

        res.status(201).json({
            success: true,
            message: existingMarks.length > 0 ? 'Marks updated successfully' : 'Marks added successfully',
            marks: newMarks[0]
        });

    } catch (error) {
        console.error('Add marks error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/marks/bulk
// @desc    Add marks for multiple students in an exam
// @access  Private
router.post('/bulk', [
    auth,
    body('exam_id', 'Exam ID is required').isInt(),
    body('marks_data', 'Marks data is required').isArray({ min: 1 })
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

        const { exam_id, marks_data } = req.body;

        // Check if exam exists and get exam details
        const [exams] = await pool.execute(
            'SELECT * FROM exams WHERE id = ?',
            [exam_id]
        );

        if (exams.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Exam not found'
            });
        }

        const exam = exams[0];
        const results = [];

        for (const markData of marks_data) {
            const { student_id, marks_obtained, remarks } = markData;

            // Validate required fields
            if (!student_id || marks_obtained === undefined) {
                results.push({
                    student_id,
                    success: false,
                    message: 'Student ID and marks are required'
                });
                continue;
            }

            // Check if student exists
            const [students] = await pool.execute(
                'SELECT id FROM students WHERE id = ?',
                [student_id]
            );

            if (students.length === 0) {
                results.push({
                    student_id,
                    success: false,
                    message: 'Student not found'
                });
                continue;
            }

            // Validate marks
            if (marks_obtained > exam.total_marks) {
                results.push({
                    student_id,
                    success: false,
                    message: 'Marks obtained cannot be greater than total marks'
                });
                continue;
            }

            // Calculate grade
            const grade = calculateGrade(marks_obtained, exam.total_marks);

            try {
                // Check if marks already exist
                const [existingMarks] = await pool.execute(
                    'SELECT id FROM marks WHERE student_id = ? AND exam_id = ?',
                    [student_id, exam_id]
                );

                if (existingMarks.length > 0) {
                    // Update existing marks
                    await pool.execute(`
                        UPDATE marks SET marks_obtained = ?, grade = ?, remarks = ?
                        WHERE student_id = ? AND exam_id = ?
                    `, [marks_obtained, grade, remarks, student_id, exam_id]);
                } else {
                    // Insert new marks
                    await pool.execute(`
                        INSERT INTO marks (student_id, exam_id, marks_obtained, grade, remarks)
                        VALUES (?, ?, ?, ?, ?)
                    `, [student_id, exam_id, marks_obtained, grade, remarks]);
                }

                results.push({
                    student_id,
                    success: true,
                    message: 'Marks saved successfully'
                });
            } catch (error) {
                results.push({
                    student_id,
                    success: false,
                    message: 'Failed to save marks'
                });
            }
        }

        res.json({
            success: true,
            message: 'Bulk marks operation completed',
            results
        });

    } catch (error) {
        console.error('Bulk marks error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   DELETE /api/marks/:id
// @desc    Delete marks
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        // Check if marks exist
        const [existingMarks] = await pool.execute(
            'SELECT id FROM marks WHERE id = ?',
            [req.params.id]
        );

        if (existingMarks.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Marks not found'
            });
        }

        await pool.execute(
            'DELETE FROM marks WHERE id = ?',
            [req.params.id]
        );

        res.json({
            success: true,
            message: 'Marks deleted successfully'
        });

    } catch (error) {
        console.error('Delete marks error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/marks/:id/notify
// @desc    Send results notification to parent
// @access  Private
router.post('/:id/notify', auth, async (req, res) => {
    try {
        // Get marks details
        const [marks] = await pool.execute(`
            SELECT m.*, s.parent_email, s.first_name, s.last_name
            FROM marks m
            JOIN students s ON m.student_id = s.id
            WHERE m.id = ?
        `, [req.params.id]);

        if (marks.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Marks not found'
            });
        }

        const mark = marks[0];

        if (!mark.parent_email) {
            return res.status(400).json({
                success: false,
                message: 'Parent email not available for this student'
            });
        }

        // Send email notification
        const result = await sendResultsToParent(mark.student_id, mark.exam_id);

        if (result.success) {
            res.json({
                success: true,
                message: 'Results notification sent successfully'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to send notification',
                error: result.error
            });
        }

    } catch (error) {
        console.error('Send notification error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router; 