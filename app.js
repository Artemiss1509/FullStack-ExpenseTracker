import express from 'express';
import cors from 'cors';
import userRouter from './routers/user.router.js';
import db from './utils/DB-connection.js';
import expenseRouter from './routers/expense.router.js';
import SignedUpUsers from './models/user.model.js';
import Expense from './models/expense.model.js';
import Payment from './models/payment.model.js';
import paymentRouter from './routers/cashfree.router.js';
import PasswordResetReq from './models/passwordReset.js';
import compression from 'compression';
import helmet from 'helmet';
import morgan from 'morgan';
import fs from 'fs'
import path from 'path'
import { arcjetMiddleware } from './services/arcjet.middleware.js';
import {PORT} from './utils/env.js'
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

const accessLogStream = fs.createWriteStream(path.join('access.log'),{flags:'a'})

app.use(express.static(__dirname));
app.use(helmet());
app.use(compression());
app.use(arcjetMiddleware)
//app.use(morgan('combined',{stream:accessLogStream}));

app.use(cors());
app.use(express.json());
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.use('/user',userRouter)
app.use('/expense',expenseRouter)
app.use('/payment', paymentRouter)

SignedUpUsers.hasMany(Expense)
Expense.belongsTo(SignedUpUsers)

SignedUpUsers.hasOne(Payment)
Payment.belongsTo(SignedUpUsers)

SignedUpUsers.hasMany(PasswordResetReq)
PasswordResetReq.belongsTo(SignedUpUsers)

db.sync().then(() => {
  console.log('Database synced');
  app.listen(PORT, () => {
    console.log('Server is running on port 3000');
    });
}).catch((error) => {
  console.error('Error syncing database:', error);
})
