import express from 'express';
import { validateRole } from '../middlewares/validation/role'; 
import { createRole } from '../controller/role.controller'; 
import { authorize } from '../middlewares/auth/authorize';

var router = express.Router();

/**
 * @swagger
 * /roles:
 *   post:
 *     summary: Create a new role
 *     description: Adds a new role to the system with associated permissions.
 *     tags:
 *       - Roles
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
 *                 example: "admin"
 *               permissionsId:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["uuid1", "uuid2"]
 *               usersId:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Role created successfully
 *       400:
 *         description: Bad request - Role already exists
 *       500:
 *         description: Server error
 */
router.post('/', validateRole, authorize("CREATE_admins"), async (req, res) => {
    try {
        await createRole(req.body);
        res.status(201).json({
            status: "success",
            message: "Role created successfully!"
        });
    } catch (err:any) {
        console.error(err);
        
        // Check for duplicate role error
        if (err.message && err.message.includes('already exists')) {
            return res.status(400).json({
                status: "error",
                message: err.message
            });
        }
        
        // Handle other errors
        res.status(500).json({
            status: "error",
            message: "Failed to create role"
        });
    }
});

export default router;