import { Router } from "express";
import { addExpense, getAllExpenses, deleteExpense, getLeaderBoard, getExpensesPaged } from "../controllers/expense.controller.js";
import authorise from "../controllers/auth.controller.js";

const router = Router();



router.post('/add',authorise, addExpense)
router.get('/all',authorise, getAllExpenses)
router.delete('/delete/:id',authorise, deleteExpense)
router.get('/leaderboard',getLeaderBoard )

// router.get('/dailyExpense',authorise, getDailyExpense)
// router.get('/weeklyExpense',authorise, getWeeklyExpense)
// router.get('/monthlyExpesne',authorise, getMonthlyExpense)
router.get('/:period', authorise, getExpensesPaged);
export default router;