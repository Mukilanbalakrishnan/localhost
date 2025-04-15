import express from 'express';
import User from '../models/UserModel.js';

const router = express.Router();

// ➤ Create User
router.post('/add-user', async (req, res) => {
    const { userID, username, password } = req.body;

    // Check for missing fields
    if (!userID || !username || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const newUser = new User({ userID, username, password });
        await newUser.save();
        res.status(201).json({ message: 'User added successfully', user: newUser });
    } catch (error) {
        res.status(500).json({ error: 'Error adding user', details: error.message });
    }
});

// ➤ Get All Users
router.get('/get-users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching users' });
    }
});

export default router;
