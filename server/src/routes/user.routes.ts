import express from "express";
import { validateUser } from "../middlewares/validation/user";
import {
  createUser,
  editUser,
  deleteUser,
  getUser,
  getUsers,
  login,
} from "../controller/user.controller";
import { validateEditUser } from "../middlewares/validation/editUser";
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
  authorize("EDIT_user"),
  validateEditUser,
  async (req, res, next) => {
    const currentUser =
      (await User.findOne({
        where: { name: res.locals.user.name, email: res.locals?.user.email },
        relations: ["roles", "roles.permissions"],
      })) || new User();
    editUser(req.body, currentUser)
      .then(() => {
        res.status(201).send("User edited successfully!!");
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send(err);
      });
  }
);

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
router.get("/:id", authenticate, authorize("GET_user"), async (req, res) => {
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
  authorize("READ_user"),
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
