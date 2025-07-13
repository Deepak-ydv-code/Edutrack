const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/subjects
// @desc    Get all subjects
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const { status = '' } = req.query;

        let query = 'SELECT * FROM subjects';
        const queryParams = [];

        if (status) {
            query += ' WHERE status = ?';
            queryParams.push(status);
        }

        query += ' ORDER BY subject_name ASC';

        const [subjects] = await pool.execute(query, queryParams);

        res.json({
            success: true,
            subjects
        });

    } catch (error) {
        console.error('Get subjects error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/subjects/:id
// @desc    Get subject by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const [subjects] = await pool.execute(
            'SELECT * FROM subjects WHERE id = ?',
            [req.params.id]
        );

        if (subjects.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Subject not found'
            });
        }

        res.json({
            success: true,
            subject: subjects[0]
        });

    } catch (error) {
        console.error('Get subject error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/subjects
// @desc    Add new subject
// @access  Private
router.post('/', [
    auth,
    body('subject_code', 'Subject code is required').not().isEmpty(),
    body('subject_name', 'Subject name is required').not().isEmpty(),
    body('credits').optional().isInt({ min: 1 }).withMessage('Credits must be a positive integer')
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

        const { subject_code, subject_name, description, credits = 1, status = 'Active' } = req.body;

        // Check if subject_code already exists
        const [existingSubjects] = await pool.execute(
            'SELECT id FROM subjects WHERE subject_code = ?',
            [subject_code]
        );

        if (existingSubjects.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Subject code already exists'
            });
        }

        const [result] = await pool.execute(`
            INSERT INTO subjects (subject_code, subject_name, description, credits, status)
            VALUES (?, ?, ?, ?, ?)
        `, [subject_code, subject_name, description, credits, status]);

        const [newSubject] = await pool.execute(
            'SELECT * FROM subjects WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'Subject added successfully',
            subject: newSubject[0]
        });

    } catch (error) {
        console.error('Add subject error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PUT /api/subjects/:id
// @desc    Update subject
// @access  Private
router.put('/:id', [
    auth,
    body('subject_name', 'Subject name is required').not().isEmpty(),
    body('credits').optional().isInt({ min: 1 }).withMessage('Credits must be a positive integer')
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

        const { subject_name, description, credits, status } = req.body;

        // Check if subject exists
        const [existingSubjects] = await pool.execute(
            'SELECT id FROM subjects WHERE id = ?',
            [req.params.id]
        );

        if (existingSubjects.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Subject not found'
            });
        }

        await pool.execute(`
            UPDATE subjects SET
                subject_name = ?, description = ?, credits = ?, status = ?
            WHERE id = ?
        `, [subject_name, description, credits, status, req.params.id]);

        const [updatedSubject] = await pool.execute(
            'SELECT * FROM subjects WHERE id = ?',
            [req.params.id]
        );

        res.json({
            success: true,
            message: 'Subject updated successfully',
            subject: updatedSubject[0]
        });

    } catch (error) {
        console.error('Update subject error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   DELETE /api/subjects/:id
// @desc    Delete subject
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        // Check if subject exists
        const [existingSubjects] = await pool.execute(
            'SELECT id FROM subjects WHERE id = ?',
            [req.params.id]
        );

        if (existingSubjects.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Subject not found'
            });
        }

        // Check if subject is used in exams
        const [exams] = await pool.execute(
            'SELECT id FROM exams WHERE subject_id = ?',
            [req.params.id]
        );

        if (exams.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete subject. It is associated with exams.'
            });
        }

        await pool.execute(
            'DELETE FROM subjects WHERE id = ?',
            [req.params.id]
        );

        res.json({
            success: true,
            message: 'Subject deleted successfully'
        });

    } catch (error) {
        console.error('Delete subject error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router; 