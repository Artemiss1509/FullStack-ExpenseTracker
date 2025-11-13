import { Router } from "express";
import { addExpense, getAllExpenses, deleteExpense, getLeaderBoard } from "../controllers/expense.controller.js";
import authorise from "../controllers/auth.controller.js";

const router = Router();



router.post('/add',authorise, addExpense)
router.get('/all',authorise, getAllExpenses)
router.delete('/delete/:id',authorise, deleteExpense)
router.get('/leaderboard',getLeaderBoard )

export default router;