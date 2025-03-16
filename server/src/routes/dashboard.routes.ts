import express from 'express';
import { getDashboardStats } from '../controller/admin/dashboard.controller';
import { authorize } from '../middlewares/auth/authorize';

var router = express.Router();

/**
 * @swagger
 * /dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     description: Retrieves counts and statistics for the admin dashboard
 *     tags:
 *       - Dashboard
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/stats', authorize("READ_admins"), async (req, res) => {
    try {
        const stats = await getDashboardStats();
        res.status(200).json({
            status: 'success',
            data: stats
        });
    } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve dashboard statistics'
        });
    }
});

export default router;