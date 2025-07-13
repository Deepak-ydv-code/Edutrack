const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/exams
// @desc    Get all exams
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const { subject_id = '', status = '', exam_type = '' } = req.query;

        let query = `
            SELECT e.*, s.subject_name, s.subject_code
            FROM exams e
            JOIN subjects s ON e.subject_id = s.id
        `;
        const queryParams = [];
        const whereConditions = [];

        if (subject_id) {
            whereConditions.push('e.subject_id = ?');
            queryParams.push(subject_id);
        }

        if (status) {
            whereConditions.push('e.status = ?');
            queryParams.push(status);
        }

        if (exam_type) {
            whereConditions.push('e.exam_type = ?');
            queryParams.push(exam_type);
        }

        if (whereConditions.length > 0) {
            query += ' WHERE ' + whereConditions.join(' AND ');
        }

        query += ' ORDER BY e.exam_date DESC';

        const [exams] = await pool.execute(query, queryParams);

        res.json({
            success: true,
            exams
        });

    } catch (error) {
        console.error('Get exams error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/exams/:id
// @desc    Get exam by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const [exams] = await pool.execute(`
            SELECT e.*, s.subject_name, s.subject_code
            FROM exams e
            JOIN subjects s ON e.subject_id = s.id
            WHERE e.id = ?
        `, [req.params.id]);

        if (exams.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found'
            });
        }

        res.json({
            success: true,
            exam: exams[0]
        });

    } catch (error) {
        console.error('Get exam error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/exams
// @desc    Add new exam
// @access  Private
router.post('/', [
    auth,
    body('exam_name', 'Exam name is required').not().isEmpty(),
    body('subject_id', 'Subject is required').isInt(),
    body('exam_type', 'Exam type is required').isIn(['Midterm', 'Final', 'Quiz', 'Assignment']),
    body('exam_date', 'Exam date is required').isISO8601(),
    body('total_marks', 'Total marks is required').isInt({ min: 1 }),
    body('passing_marks', 'Passing marks is required').isInt({ min: 1 })
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
            exam_name, subject_id, exam_type, exam_date, total_marks,
            passing_marks, description, status = 'Scheduled'
        } = req.body;

        // Check if subject exists
        const [subjects] = await pool.execute(
            'SELECT id FROM subjects WHERE id = ?',
            [subject_id]
        );

        if (subjects.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Subject not found'
            });
        }

        // Validate passing marks
        if (passing_marks > total_marks) {
            return res.status(400).json({
                success: false,
                message: 'Passing marks cannot be greater than total marks'
            });
        }

        const [result] = await pool.execute(`
            INSERT INTO exams (exam_name, subject_id, exam_type, exam_date, total_marks, passing_marks, description, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [exam_name, subject_id, exam_type, exam_date, total_marks, passing_marks, description, status]);

        const [newExam] = await pool.execute(`
            SELECT e.*, s.subject_name, s.subject_code
            FROM exams e
            JOIN subjects s ON e.subject_id = s.id
            WHERE e.id = ?
        `, [result.insertId]);

        res.status(201).json({
            success: true,
            message: 'Exam added successfully',
            exam: newExam[0]
        });

    } catch (error) {
        console.error('Add exam error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PUT /api/exams/:id
// @desc    Update exam
// @access  Private
router.put('/:id', [
    auth,
    body('exam_name', 'Exam name is required').not().isEmpty(),
    body('subject_id', 'Subject is required').isInt(),
    body('exam_type', 'Exam type is required').isIn(['Midterm', 'Final', 'Quiz', 'Assignment']),
    body('exam_date', 'Exam date is required').isISO8601(),
    body('total_marks', 'Total marks is required').isInt({ min: 1 }),
    body('passing_marks', 'Passing marks is required').isInt({ min: 1 })
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
            exam_name, subject_id, exam_type, exam_date, total_marks,
            passing_marks, description, status
        } = req.body;

        // Check if exam exists
        const [existingExams] = await pool.execute(
            'SELECT id FROM exams WHERE id = ?',
            [req.params.id]
        );

        if (existingExams.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found'
            });
        }

        // Check if subject exists
        const [subjects] = await pool.execute(
            'SELECT id FROM subjects WHERE id = ?',
            [subject_id]
        );

        if (subjects.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Subject not found'
            });
        }

        // Validate passing marks
        if (passing_marks > total_marks) {
            return res.status(400).json({
                success: false,
                message: 'Passing marks cannot be greater than total marks'
            });
        }

        await pool.execute(`
            UPDATE exams SET
                exam_name = ?, subject_id = ?, exam_type = ?, exam_date = ?,
                total_marks = ?, passing_marks = ?, description = ?, status = ?
            WHERE id = ?
        `, [exam_name, subject_id, exam_type, exam_date, total_marks, passing_marks, description, status, req.params.id]);

        const [updatedExam] = await pool.execute(`
            SELECT e.*, s.subject_name, s.subject_code
            FROM exams e
            JOIN subjects s ON e.subject_id = s.id
            WHERE e.id = ?
        `, [req.params.id]);

        res.json({
            success: true,
            message: 'Exam updated successfully',
            exam: updatedExam[0]
        });

    } catch (error) {
        console.error('Update exam error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   DELETE /api/exams/:id
// @desc    Delete exam
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        // Check if exam exists
        const [existingExams] = await pool.execute(
            'SELECT id FROM exams WHERE id = ?',
            [req.params.id]
        );

        if (existingExams.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found'
            });
        }

        // Check if exam has marks assigned
        const [marks] = await pool.execute(
            'SELECT id FROM marks WHERE exam_id = ?',
            [req.params.id]
        );

        if (marks.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete exam. It has marks assigned to students.'
            });
        }

        await pool.execute(
            'DELETE FROM exams WHERE id = ?',
            [req.params.id]
        );

        res.json({
            success: true,
            message: 'Exam deleted successfully'
        });

    } catch (error) {
        console.error('Delete exam error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router; 