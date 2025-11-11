import express from 'express';
import cors from 'cors';
import userRouter from './routers/user.router.js';
import SignedUpUsers from './models/user.model.js';
import db from './utils/DB-connection.js';
import expenseRouter from './routers/expense.router.js';


const app = express();

app.use(cors());
app.use(express.json());

app.use('/user',userRouter)
app.use('/expense',expenseRouter)

db.sync({ alter: true }).then(() => {
  console.log('Database synced');
  app.listen(3000, () => {
    console.log('Server is running on port 3000');
    });
}).catch((error) => {
  console.error('Error syncing database:', error);
})
