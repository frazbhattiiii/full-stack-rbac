import express from 'express';
import {login, createUser} from '../controller/user.controller';
import { validateUser } from '../middlewares/validation/user';

var router = express.Router();


/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate a user and return a token.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       401:
 *         description: Unauthorized - Invalid credentials
 */
router.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  login(email, password)
    .then(data => {
      res.status(201).send(data);
    })
    .catch(err => {
      res.status(401).send(err);
    })
});


/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: User registration
 *     description: Registers a new user with a default role of 'user'.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Email already exists
 *       500:
 *         description: Server error
 */
router.post('/register', validateUser, (req, res) => {
  createUser(req.body)
    .then(() => {
      res.status(201).send("User registered successfully!");
    })
    .catch(err => {
      console.error(err);
      res.status(500).send(err);
    });
});

export default router;

