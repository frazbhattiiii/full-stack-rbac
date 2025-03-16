import './config'
import express from 'express'
import "reflect-metadata";
import dataSource from './src/db/db-source';
import { authenticate } from './src/middlewares/auth/authenticate';
import userRouter from './src/routes/user.routes'
import authRouter from './src/routes/auth.routes'
import permissionRouter from './src/routes/permission.routes'
import roleRouter from './src/routes/role.routes'
import dashboardRouter from './src/routes/dashboard.routes'
import {setupSwagger} from './src/config/swagger.config';
import cors from 'cors'  // Add this import


const app = express()
const PORT = process.env.PORT || 3000;
app.use(express.json());

app.use(cors({
    origin: process.env.FRONTEND_URL || '*', // Allow your frontend URL or all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true // Enable credentials if your frontend sends cookies/authentication
  }));
  

setupSwagger(app);


app.get('/', (req, res) => {
    res.send('Server UP!');
});



app.use('/user',authenticate, userRouter);
app.use('/auth', authRouter);
app.use('/permission',authenticate, permissionRouter);
app.use('/role', authenticate,roleRouter);
app.use('/dashboard', authenticate, dashboardRouter);




app.use((req, res) => {
    res.status(404).send("Not Found!");
});

app.listen(PORT, () => {
    console.log(`App is running and Listening on port ${PORT}`);
    dataSource.initialize()
    console.log(new Date())
});

export default app;