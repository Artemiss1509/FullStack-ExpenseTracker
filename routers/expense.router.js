import { Router } from "express";
import { addExpense, getAllExpenses, deleteExpense } from "../controllers/expense.controller.js";

const router = Router();



router.post('/add', addExpense)
router.get('/all', getAllExpenses)
router.delete('/delete/:id', deleteExpense)

export default router;