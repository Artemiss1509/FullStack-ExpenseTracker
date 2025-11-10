import e from "express";
import SignedUpUsers from "../models/user.model.js";

export const signUp = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const checkEmail = await SignedUpUsers.findOne({ where: { email } });

        if (checkEmail) {
            return  res.status(400).json({ message: "Email already exists. Please use a different email." });
        } 
        const newUser = await SignedUpUsers.create({
            name,
            email,
            password
        })

        res.status(201).json({ message: "User created successfully", user: newUser });

    } catch (error) {
        res.status(500).json({ message: "User not created. Sign-up error", error: error.message });
    }
}

export const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await SignedUpUsers.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: "User not found. Please sign up first." });
        }

        if (user.password !== password) {
            return res.status(401).json({ message: "Incorrect password. Please try again." });
        }

        res.status(200).json({ message: "Sign-in successful", user });
    } catch (error) {
        res.status(500).json({ message: "Sign-in error", error: error.message });
    }
}

