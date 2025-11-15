import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import SignedUpUsers from "../models/user.model.js";
import { JWT_EXPIRY, JWT_SECRET } from "../utils/env.js";
import { sendResetEmail } from "../services/send.email.js";
import PasswordResetReq from "../models/passwordReset.js";

export const signUp = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const checkEmail = await SignedUpUsers.findOne({ where: { email } });

        if (checkEmail) {
            return res.status(400).json({ message: "Email already exists. Please use a different email." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await SignedUpUsers.create({
            name,
            email,
            password: hashedPassword,
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

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid password. Please try again." });
        }
        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRY });

        res.status(200).json({ message: "Sign-in successful", user, token });
    } catch (error) {
        res.status(500).json({ message: "Sign-in error", error: error.message });
    }
}

export const resetPass = async (req, res) => {
    try {
        const { email } = req.body
        const user = await SignedUpUsers.findOne({ where: { email } })
        
        const newUuid = await PasswordResetReq.create({
            UserId: user.dataValues.id
        })
        if (!user) {
            return res.status(404).json({ message: false })
        } else {
            await sendResetEmail(email, user.dataValues.name, `http://localhost:3000/user/password-rest/${newUuid.dataValues.id}`)
            return res.status(200).json({ message: true })
        }
    } catch (error) {
        res.status(500).json({ message: 'Reset Controller error', error: error.message })
    }
}

export const passwordReset = async (req, res) => {
  try {
    const { id } = req.params;
    const resetReq = await PasswordResetReq.findOne({ where: { id, isActive: true } });

    if (!resetReq) {
      return res.status(400).send("Invalid or expired password reset link.");
    }

    return res.redirect(`http://127.0.0.1:5500/resetPassword.html?token=${id}`);
  } catch (error) {
    console.error("passwordReset error:", error);
    return res.status(500).json({ message: "Password reset link clicked error", error: error.message });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const token = req.params.token || req.query.token;
    const { password } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Missing or invalid reset token" });
    }
    const resetReq = await PasswordResetReq.findOne({ where: { id: token, isActive: true } });

    if (!resetReq) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }
    const user = await SignedUpUsers.findByPk(resetReq.UserId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    await user.save();

    resetReq.isActive = false;
    await resetReq.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("updatePassword error:", error);
    res.status(500).json({ message: "Password not updated", error: error.message });
  }
};

