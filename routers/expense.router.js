import { Router } from "express";
import { addExpense, getAllExpenses, deleteExpense } from "../controllers/expense.controller.js";
import authorise from "../controllers/auth.controller.js";

const router = Router();



router.post('/add', addExpense)
router.get('/all',authorise, getAllExpenses)
router.delete('/delete/:id', deleteExpense)

export default router;