import mongoose from 'mongoose';

// User Schema
const userSchema = new mongoose.Schema({
    userID: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

// User Model
const User = mongoose.model('User', userSchema);

export default User;
