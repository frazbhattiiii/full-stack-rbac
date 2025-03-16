import express from "express";
import { validateRole } from "../middlewares/validation/role";
import {
  createRole,
  getAllRoles,
  deleteRole,
} from "../controller/role.controller";
import { authorize } from "../middlewares/auth/authorize";

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
router.post("/", validateRole, authorize("CREATE_admins"), async (req, res) => {
  try {
    await createRole(req.body);
    res.status(201).json({
      status: "success",
      message: "Role created successfully!",
    });
  } catch (err: any) {
    console.error(err);

    // Check for duplicate role error
    if (err.message && err.message.includes("already exists")) {
      return res.status(400).json({
        status: "error",
        message: err.message,
      });
    }

    // Handle other errors
    res.status(500).json({
      status: "error",
      message: "Failed to create role",
    });
  }
});
/**
 * @swagger
 * /roles:
 *   get:
 *     summary: Get all roles
 *     description: Retrieves a list of all roles with their associated permissions.
 *     tags:
 *       - Roles
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of roles retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                         example: admin
 *                       permissions:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               format: uuid
 *                             name:
 *                               type: string
 *                               example: READ_users
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *       403:
 *         description: Forbidden - User does not have permission to access this resource
 *       500:
 *         description: Server error
 */
router.get("/", authorize("READ_admins"), async (req, res) => {
  try {
    const roles = await getAllRoles();

    res.status(200).json({
      status: "success",
      data: roles,
    });
  } catch (err) {
    console.error("Error fetching roles:", err);

    res.status(500).json({
      status: "error",
      message: "Failed to retrieve roles",
    });
  }
});

/**
 * @swagger
 * /roles/{id}:
 *   delete:
 *     summary: Delete a role
 *     description: Deletes a role by its ID. Cannot delete roles that are assigned to users.
 *     tags:
 *       - Roles
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The role ID
 *     responses:
 *       200:
 *         description: Role deleted successfully
 *       400:
 *         description: Role cannot be deleted because it's assigned to users
 *       404:
 *         description: Role not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", authorize("DELETE_admins"), async (req, res) => {
  try {
    const result = await deleteRole(req.params.id);
    res.status(200).json({
      status: "success",
      message: result.message,
    });
  } catch (err: any) {
    console.error("Error deleting role:", err);

    if (err.message && err.message.includes("not found")) {
      return res.status(404).json({
        status: "error",
        message: err.message,
      });
    }

    if (err.message && err.message.includes("Cannot delete role")) {
      return res.status(400).json({
        status: "error",
        message: err.message,
      });
    }

    res.status(500).json({
      status: "error",
      message: "Failed to delete role",
    });
  }
});

export default router;
