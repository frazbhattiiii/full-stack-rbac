import express from "express";
import {
  editUser,
  deleteUser,
  getUser,
  getUsers,
  updateUserProfile,
} from "../controller/user/user.controller";
import { authorize } from "../middlewares/auth/authorize";
import { authenticate } from "../middlewares/auth/authenticate";
import { User } from "../db/entities/User";

var router = express.Router();
/**
 * @swagger
 * /users:
 *   put:
 *     summary: Edit an existing user
 *     description: Update user details.
 *     tags:
 *       - Users
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
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: User edited successfully
 *       500:
 *         description: Server error
 */
router.put(
  "/",
  authenticate,
  authorize("READ_users"),
  async (req, res, next) => {
    try {
      const currentUser = await User.findOne({
        where: { name: res.locals.user.name, email: res.locals?.user.email },
        relations: ["roles", "roles.permissions"],
      });

      if (!currentUser) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      // Add the userId to the request body from the authenticated user
      const updatedData = {
        ...req.body,
        userId: currentUser.id, // Add userId from the authenticated user
      };

      await editUser(updatedData, currentUser);

      res.status(200).json({
        status: "success",
        message: "User edited successfully!",
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        status: "error",
        message: Array.isArray(err)
          ? err
          : "An error occurred while updating user",
      });
    }
  }
);

/**
 * @swagger
 * /user/profile:
 *   put:
 *     summary: Update user profile
 *     description: Updates the authenticated user's profile information including name and email
 *     tags:
 *       - User
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
 *                 description: User's full name
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: "john.doe@example.com"
 *             required:
 *               - name
 *               - email
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Profile updated successfully!"
 *       401:
 *         description: Unauthorized - User is not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Authentication required"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "An error occurred while updating profile"
 */
router.put("/profile", authenticate, async (req, res) => {
  try {
    // Get the current user from authentication
    const currentUser = await User.findOne({
      where: { id: res.locals.user.id },
    });

    if (!currentUser) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Extract update fields from request
    const { name, email } = req.body;

    // Update profile
    await updateUserProfile(currentUser.id, { name, email });

    res.status(200).json({
      status: "success",
      message: "Profile updated successfully!",
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: err.message || "An error occurred while updating profile",
    });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Fetch user details by their ID.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User found
 *       404:
 *         description: User not found
 */
router.get("/:id", authenticate, authorize("READ_users"), async (req, res) => {
  const id = req.params.id;
  getUser({ id })
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send(err);
    });
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Retrieve all users
 *     description: Fetch a list of all users.
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *       500:
 *         description: Server error
 */
router.get(
  "/",
  authenticate,
  authorize("READ_admins"),
  async (req, res, next) => {
    const payload = {
      page: req.query.page?.toString() || "1",
      pageSize: req.query.pageSize?.toString() || "10",
    };
    const currentUser =
      (await User.findOne({
        where: { name: res.locals.user.name, email: res.locals?.user.email },
        relations: ["roles", "roles.permissions"],
      })) || new User();
    getUsers(payload, currentUser)
      .then((data) => {
        res.send(data);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Something went wrong");
      });
  }
);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user
 *     description: Remove a user from the system.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       500:
 *         description: Server error
 */
router.delete(
  "/:id",
  authenticate,
  authorize("DELETE_user"),
  async (req, res) => {
    const id = req.params.id?.toString() || "";
    const currentUser =
      (await User.findOne({
        where: { name: res.locals.user.name, email: res.locals?.user.email },
        relations: ["roles", "roles.permissions"],
      })) || new User();
    deleteUser(id, currentUser)
      .then((data) => {
        res.send(data);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Something went wrong");
      });
  }
);

export default router;
