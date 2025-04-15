const mongoose = require("mongoose");
const User = require("../models/userCoinsModel"); // Adjust path if needed
 // Adjust path if needed

mongoose.connect("mongodb://localhost:27017/yourDatabase", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const fixCoinsType = async () => {
    try {
        const users = await User.find({});

        for (let user of users) {
            if (typeof user.coins !== "number") {
                user.coins = Number(user.coins) || 0; // Convert to number
                await user.save();
                console.log(`Updated ${user.userId}: coins = ${user.coins}`);
            }
        }

        console.log("✅ All coin values have been fixed!");
        mongoose.connection.close();
    } catch (error) {
        console.error("Error fixing coin values:", error);
    }
};

fixCoinsType();
