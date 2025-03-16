import './config'
import express from 'express'
import "reflect-metadata";
import dataSource from './src/db/db-source';
import { authenticate } from './src/middlewares/auth/authenticate';
import userRouter from './src/routes/user.routes'
import authRouter from './src/routes/auth.routes'
import permissionRouter from './src/routes/permission.routes'
import roleRouter from './src/routes/role.routes'
import {setupSwagger} from './src/config/swagger.config';

const app = express()
const PORT = 3000;
app.use(express.json());

setupSwagger(app);


app.get('/', (req, res) => {
    res.send('Server UP!');
});



app.use('/user',authenticate, userRouter);
app.use('/auth', authRouter);
app.use('/permission',authenticate, permissionRouter);
app.use('/role', authenticate,roleRouter);


app.use((req, res) => {
    res.status(404).send("Not Found!");
});

app.listen(PORT, () => {
    console.log(`App is running and Listening on port ${PORT}`);
    dataSource.initialize()
    console.log(new Date())
});

export default app;