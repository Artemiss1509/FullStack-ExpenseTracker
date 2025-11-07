import SignedUpUsers from "../models/user.model.js";

export const signUp = async (req, res) => {
    try {
        const { name, email, password } = req.body;
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

