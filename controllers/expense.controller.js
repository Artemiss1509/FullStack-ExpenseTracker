import Expenses from "../models/expense.model.js";


export const addExpense = async (req, res) => {
    const { amount, description, category } = req.body;
    try {
        const newExpense = await Expenses.create({
            amount,
            description,
            category,
            UserId: req.user.id
        });
        res.status(201).json({ message: "Expense added successfully", expense: newExpense });
    } catch (error) {
        res.status(500).json({ message: "Error adding expense", error: error.message });
    }
}
export const getAllExpenses = async (req, res) => {
    try {
        const expenses = await Expenses.findAll({where: {userId: req.user.id}});
        res.status(200).json({ expenses });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving expenses", error: error.message });
    }
}
export const deleteExpense = async (req, res) => {
    const { id } = req.params;
    try {
        const deleted = await Expenses.destroy({ where: { id } });
        if (deleted) {
            res.status(200).json({ message: "Expense deleted successfully" });
        } else {
            res.status(404).json({ message: "Expense not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error deleting expense", error: error.message });
    }
}