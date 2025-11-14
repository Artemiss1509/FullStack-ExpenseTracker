import express from 'express';
import cors from 'cors';
import userRouter from './routers/user.router.js';
import db from './utils/DB-connection.js';
import expenseRouter from './routers/expense.router.js';
import SignedUpUsers from './models/user.model.js';
import Expense from './models/expense.model.js';
import Payment from './models/payment.model.js';
import paymentRouter from './routers/cashfree.router.js';


const app = express();

app.use(cors());
app.use(express.json());

app.use('/user',userRouter)
app.use('/expense',expenseRouter)
app.use('/payment', paymentRouter)

SignedUpUsers.hasMany(Expense)
Expense.belongsTo(SignedUpUsers)

SignedUpUsers.hasOne(Payment)
Payment.belongsTo(SignedUpUsers)

db.sync({alter:true}).then(() => {
  console.log('Database synced');
  app.listen(3000, () => {
    console.log('Server is running on port 3000');
    });
}).catch((error) => {
  console.error('Error syncing database:', error);
})
