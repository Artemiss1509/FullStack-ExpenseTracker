import Expenses from "../models/expense.model.js";
import SignedUpUsers from "../models/user.model.js";
import { GoogleGenAI } from "@google/genai";
import { GOOGLE_API } from "../utils/env.js";
import sequelize from "../utils/DB-connection.js";


export const addExpense = async (req, res) => {
  const { amount, description } = req.body;
  const ai = new GoogleGenAI({apiKey:GOOGLE_API})
  const transact = await sequelize.transaction()
  try {
    
    const response = await ai.models.generateContent({
      model:"gemini-2.5-flash",
      contents:`Categorise the following description into ONE category: ${description}` 
    })

    const newExpense = await Expenses.create({
      amount,
      description,
      category:response.text,
      UserId: req.user.id
    },
    {
      transaction:transact
    }
  );
    await SignedUpUsers.increment(
      { totalExpense: amount },
      { where: { id: req.user.id } },
      { transaction:transact}
    )
    res.status(201).json({ message: "Expense added successfully", expense: newExpense });
    await transact.commit()
  } catch (error) {
    await transact.rollback()
    res.status(500).json({ message: "Error adding expense", error: error.message });
  }
}
export const getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expenses.findAll({ where: { userId: req.user.id } });
    res.status(200).json({ expenses });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving expenses", error: error.message });
  }
}
export const deleteExpense = async (req, res) => {
  const { id } = req.params;
  const transact = await sequelize.transaction()
  try {
    const amount = await Expenses.findOne({ where: { id } },{Transaction:transact})
    const deleted = await Expenses.destroy({ where: { id } },{Transaction:transact});
    await SignedUpUsers.decrement({
      totalExpense: amount.amount
    }, {
      where: { id: req.user.id }, transaction:transact
    })
    if (deleted) {
      await transact.commit()
      res.status(200).json({ message: "Expense deleted successfully" });
    } else {
      await transact.rollback()
      res.status(404).json({ message: "Expense not found" });
    }
  } catch (error) {
    await transact.rollback()
    res.status(500).json({ message: "Error deleting expense", error: error.message });
  }
}

export const getLeaderBoard = async (req, res) => {
  try {
    const leaderboard = await SignedUpUsers.findAll({
      order: [
        ['totalExpense', 'DESC']
      ]
    })

    res.status(200).json({ leaderboard });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving leaderboard", error: error.message });
  }
}