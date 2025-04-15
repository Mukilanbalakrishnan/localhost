const mongoose = require("mongoose");

const userCoinsSchema = new mongoose.Schema({
    userID: String,
    username: String,
    coins: Number // Ensure it's a Number
});

const UserCoins = mongoose.model("UserCoins", userCoinsSchema);
module.exports = UserCoins;
