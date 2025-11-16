import Expenses from "../models/expense.model.js";
import SignedUpUsers from "../models/user.model.js";
import { GoogleGenAI } from "@google/genai";
import { GOOGLE_API } from "../utils/env.js";
import sequelize from "../utils/DB-connection.js";
import { Op } from "sequelize";
import {dayRange, lastNDaysRange, currentMonthRange }  from "../utils/day.range.js";

export const addExpense = async (req, res) => {
  const { amount, description, Notes } = req.body;
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
      UserId: req.user.id,
      Notes
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


// export const getDailyExpense = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { start, end } = dayRange(new Date());
//     const expenses = await Expenses.findAll({
//       attributes: ['amount', 'description', 'category'],
//       where: { UserId: userId, createdAt: { [Op.between]: [start, end] } },
//       order: [['createdAt', 'DESC']]
//     });
//     return res.json({ expenses });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Error getting daily expenses", error: error.message });
//   }
// };

// export const getWeeklyExpense = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { start, end } = lastNDaysRange(7);
//     const expenses = await Expenses.findAll({
//       attributes: ['amount', 'description', 'category'],
//       where: { UserId: userId, createdAt: { [Op.between]: [start, end] } },
//       order: [['createdAt', 'DESC']]
//     });
//     return res.json({ expenses });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Error getting daily expenses", error: error.message });
//   }
// };

// export const getMonthlyExpense = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { start, end } = currentMonthRange();
//     const expenses = await Expenses.findAll({
//       attributes: ['amount', 'description', 'category'],
//       where: { UserId: userId, createdAt: { [Op.between]: [start, end] } },
//       order: [['createdAt', 'DESC']]
//     });
//     return res.json({ expenses });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Error getting daily expenses", error: error.message });
//   }
// };

export const getExpensesPaged = async (req, res) => {
  try {
    const userId = req.user.id; // from authenticator
    const { period } = req.params;
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const pageSize = Math.max(parseInt(req.query.pageSize || '3', 10), 1);

    // figure range if needed
    let where = { UserId: userId };
    if (period === 'daily') {
      const { start, end } = dayRange(new Date());
      where.createdAt = { [Op.between]: [start, end] };
    } else if (period === 'weekly') {
      const { start, end } = lastNDaysRange(7);
      where.createdAt = { [Op.between]: [start, end] };
    } else if (period === 'monthly') {
      const { start, end } = currentMonthRange();
      where.createdAt = { [Op.between]: [start, end] };
    } else if (period !== 'all') {
      return res.status(400).json({ message: "Invalid period. Use 'all'|'daily'|'weekly'|'monthly'." });
    }

    const offset = (page - 1) * pageSize;
    // only return needed fields
    const attributes = ['id','amount','description','category','createdAt'];

    const { count, rows } = await Expenses.findAndCountAll({
      where,
      attributes,
      order: [['createdAt','DESC']],
      limit: pageSize,
      offset
    });

    const total = count;
    const totalPages = Math.ceil(total / pageSize);

    return res.status(200).json({
      expenses: rows,
      total,
      page,
      pageSize,
      totalPages
    });
  } catch (error) {
    console.error("getExpensesPaged error:", error);
    return res.status(500).json({ message: "Error fetching expenses", error: error.message });
  }
};