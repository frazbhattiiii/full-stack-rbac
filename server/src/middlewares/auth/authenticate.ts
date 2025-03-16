import express from 'express';
import jwt from 'jsonwebtoken';

const authenticate = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const token = authHeader.split(' ')[1];  let tokenIsValid;
  try {
    tokenIsValid = jwt.verify(token, process.env.SECRET_KEY || '');
  } catch (error) { }

  if (tokenIsValid) {
    const decoded = jwt.decode(token);``
    res.locals.user = decoded;
    next();
  } else {
    res.status(401).send("You are Unauthorized!");
  }
}

export {
  authenticate
}