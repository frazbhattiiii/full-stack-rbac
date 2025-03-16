import express from 'express';
import { validatePermission } from '../middlewares/validation/permission'; 
import { createPermission } from '../controller/permission.controller'; 
import { authorize } from '../middlewares/auth/authorize';

var router = express.Router();

/**
 * @swagger
 * /permissions:
 *   post:
 *     summary: Create a new permission
 *     description: Adds a new permission to the system.
 *     tags:
 *       - Permissions
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "MANAGE_USERS"
 *     responses:
 *       201:
 *         description: Permission created successfully
 *       400:
 *         description: Bad request - Permission already exists
 *       500:
 *         description: Server error
 */
router.post('/', validatePermission, authorize("CREATE_admins"), async (req, res) => {
    try {
        await createPermission(req.body);
        res.status(201).json({
            status: "success",
            message: "Permission created successfully!"
        });
    } catch (err:any) {
        console.error(err);
        
        // Check for duplicate permission error
        if (err.message && err.message.includes('already exists')) {
            return res.status(400).json({
                status: "error",
                message: err.message
            });
        }
        
        // Handle other errors
        res.status(500).json({
            status: "error",
            message: "Failed to create permission"
        });
    }
});

export default router;