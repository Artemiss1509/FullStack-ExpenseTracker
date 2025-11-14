import Expenses from "../models/expense.model.js";
import SignedUpUsers from "../models/user.model.js";
import { GoogleGenAI } from "@google/genai";
import { GOOGLE_API } from "../utils/env.js";
import sequelize from "../utils/DB-connection.js";

export const addExpense = async (req, res) => {
  const { amount, description } = req.body;
  const ai = new GoogleGenAI({ apiKey: GOOGLE_API });
  let category;
  try {
    const aiResp = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Categorise the following description into ONLY ONE category: ${description}.`
    });
    category = aiResp.text
  } catch (err) {
    category = "Uncategorized";
  }

  const transaction = await sequelize.transaction();
  try {
    const newExpense = await Expenses.create({
      amount,
      description,
      category,
      UserId: req.user.id
    }, { transaction });

    await SignedUpUsers.increment(
      { totalExpense: amount },
      { where: { id: req.user.id }, transaction }
    );

    await transaction.commit();

    res.status(201).json({ message: "Expense added successfully", expense: newExpense });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: "Error adding expense", error: error.message });
  }
};


export const getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expenses.findAll({ where: { UserId: req.user.id } });
    res.status(200).json({ expenses });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving expenses", error: error.message });
  }
};


export const deleteExpense = async (req, res) => {
  const { id } = req.params;
  const transaction = await sequelize.transaction();
  try {
    const expense = await Expenses.findOne({ where: { id }, transaction });

    if (!expense) {
      await transaction.rollback();
      return res.status(404).json({ message: "Expense not found" });
    }

    const deleted = await Expenses.destroy({ where: { id }, transaction });
    await SignedUpUsers.decrement(
      { totalExpense: expense.amount },
      { where: { id: req.user.id }, transaction }
    );

    await transaction.commit();
    return res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: "Error deleting expense", error: error.message });
  }
};


export const getLeaderBoard = async (req, res) => {
  try {
    const leaderboard = await SignedUpUsers.findAll({
      order: [['totalExpense', 'DESC']]
    });
    res.status(200).json({ leaderboard });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving leaderboard", error: error.message });
  }
};
