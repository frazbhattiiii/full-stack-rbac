import express from "express";
import { validatePermission } from "../middlewares/validation/permission";
import {
  createPermission,
  getAllPermissions,
  getPermissionById,
  deletePermission
} from "../controller/permission.controller";
import { authorize } from "../middlewares/auth/authorize";

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
router.post(
  "/",
  validatePermission,
  authorize("CREATE_admins"),
  async (req, res) => {
    try {
      await createPermission(req.body);
      res.status(201).json({
        status: "success",
        message: "Permission created successfully!",
      });
    } catch (err: any) {
      console.error(err);

      // Check for duplicate permission error
      if (err.message && err.message.includes("already exists")) {
        return res.status(400).json({
          status: "error",
          message: err.message,
        });
      }

      // Handle other errors
      res.status(500).json({
        status: "error",
        message: "Failed to create permission",
      });
    }
  }
);

/**
 * @swagger
 * /permissions:
 *   get:
 *     summary: Get all permissions
 *     description: Retrieves a list of all permissions in the system.
 *     tags:
 *       - Permissions
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of permissions retrieved successfully
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
 *                         example: READ_users
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
    const permissions = await getAllPermissions();

    res.status(200).json({
      status: "success",
      data: permissions,
    });
  } catch (err) {
    console.error("Error fetching permissions:", err);

    res.status(500).json({
      status: "error",
      message: "Failed to retrieve permissions",
    });
  }
});

/**
 * @swagger
 * /permissions/{id}:
 *   get:
 *     summary: Get permission details
 *     description: Retrieves details of a specific permission by ID
 *     tags:
 *       - Permissions
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The permission ID
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Permission details retrieved successfully
 *       404:
 *         description: Permission not found
 *       500:
 *         description: Server error
 */
router.get("/:id", authorize("READ_admins"), async (req, res) => {
  try {
    const permission = await getPermissionById(req.params.id);
    res.status(200).json({
      status: "success",
      data: permission,
    });
  } catch (err: any) {
    console.error("Error fetching permission:", err);

    if (err.message && err.message.includes("not found")) {
      return res.status(404).json({
        status: "error",
        message: err.message,
      });
    }

    res.status(500).json({
      status: "error",
      message: "Failed to retrieve permission details",
    });
  }
});

/**
 * @swagger
 * /permissions/{id}:
 *   delete:
 *     summary: Delete a permission
 *     description: Deletes a specific permission by ID
 *     tags:
 *       - Permissions
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The permission ID
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Permission deleted successfully
 *       404:
 *         description: Permission not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", authorize("DELETE_admins"), async (req, res) => {
  try {
    const result = await deletePermission(req.params.id);

    res.status(200).json({
      status: "success",
      message: result.message,
      affectedRoles: result.affectedRoles,
    });
  } catch (err: any) {
    console.error("Error deleting permission:", err);

    if (err.message && err.message.includes("not found")) {
      return res.status(404).json({
        status: "error",
        message: err.message,
      });
    }

    res.status(500).json({
      status: "error",
      message: "Failed to delete permission",
    });
  }
});
export default router;
