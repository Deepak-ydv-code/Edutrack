const nodemailer = require('nodemailer');
const { pool } = require('../config/database');

// Create transporter
const createTransporter = () => {
    return nodemailer.createTransporter({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

// Send email notification
const sendEmail = async (to, subject, htmlContent) => {
    try {
        const transporter = createTransporter();
        
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: to,
            subject: subject,
            html: htmlContent
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Email sending failed:', error);
        return { success: false, error: error.message };
    }
};

// Send student results to parent
const sendResultsToParent = async (studentId, examId) => {
    try {
        // Get student and exam details
        const [students] = await pool.execute(`
            SELECT s.*, m.marks_obtained, m.grade, e.exam_name, e.total_marks, sub.subject_name
            FROM students s
            JOIN marks m ON s.id = m.student_id
            JOIN exams e ON m.exam_id = e.id
            JOIN subjects sub ON e.subject_id = sub.id
            WHERE s.id = ? AND m.exam_id = ?
        `, [studentId, examId]);

        if (students.length === 0) {
            throw new Error('Student or exam not found');
        }

        const student = students[0];
        
        if (!student.parent_email) {
            throw new Error('Parent email not available');
        }

        const percentage = ((student.marks_obtained / student.total_marks) * 100).toFixed(2);
        
        const subject = `EduTrack - ${student.exam_name} Results for ${student.first_name} ${student.last_name}`;
        
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
                    <h1 style="margin: 0;">EduTrack</h1>
                    <p style="margin: 10px 0 0 0;">Student Performance Dashboard</p>
                </div>
                
                <div style="padding: 20px; background: #f9f9f9;">
                    <h2 style="color: #333;">Dear ${student.parent_name || 'Parent'},</h2>
                    
                    <p>We are pleased to share the examination results for your child <strong>${student.first_name} ${student.last_name}</strong>.</p>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <h3 style="color: #667eea; margin-top: 0;">Exam Details</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Student:</strong></td>
                                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${student.first_name} ${student.last_name} (${student.student_id})</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Class:</strong></td>
                                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${student.class} - ${student.section}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Subject:</strong></td>
                                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${student.subject_name}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Exam:</strong></td>
                                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${student.exam_name}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Marks Obtained:</strong></td>
                                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${student.marks_obtained} / ${student.total_marks}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Percentage:</strong></td>
                                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${percentage}%</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0;"><strong>Grade:</strong></td>
                                <td style="padding: 8px 0;"><span style="background: #667eea; color: white; padding: 4px 8px; border-radius: 4px;">${student.grade}</span></td>
                            </tr>
                        </table>
                    </div>
                    
                    <p>Please feel free to contact us if you have any questions about your child's performance.</p>
                    
                    <p>Best regards,<br>
                    <strong>EduTrack Team</strong></p>
                </div>
                
                <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
                    <p style="margin: 0;">© 2024 EduTrack. All rights reserved.</p>
                </div>
            </div>
        `;

        const result = await sendEmail(student.parent_email, subject, htmlContent);
        
        // Log notification
        if (result.success) {
            await pool.execute(`
                INSERT INTO notifications (student_id, type, subject, message, recipient, status, sent_at)
                VALUES (?, 'Email', ?, ?, ?, 'Sent', NOW())
            `, [studentId, subject, htmlContent, student.parent_email]);
        }

        return result;
    } catch (error) {
        console.error('Send results to parent failed:', error);
        
        // Log failed notification
        try {
            await pool.execute(`
                INSERT INTO notifications (student_id, type, subject, message, recipient, status)
                VALUES (?, 'Email', ?, ?, ?, 'Failed')
            `, [studentId, 'Results Notification', error.message, 'parent@email.com']);
        } catch (logError) {
            console.error('Failed to log notification:', logError);
        }
        
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendEmail,
    sendResultsToParent
}; 