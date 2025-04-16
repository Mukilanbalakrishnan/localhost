const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.use(
    cors({
        origin: [
            "http://localhost:5173",                        // Vite dev server
            "http://localhost:3000",                        // CRA dev server
            "https://radiant-meerkat-5f7312.netlify.app"      // ✅ your actual Netlify domain
        ],
        credentials: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));




const uri = "mongodb+srv://visara1327:bp2ZiF4n9Ri7lyD7@mycluster.w0gv3.mongodb.net/myDatabase?retryWrites=true&w=majority";
const db = mongoose.connection;


mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('✅ MongoDB Connected to Atlas'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));




// ✅ Schema & Model
const userDetailsSchema = new mongoose.Schema({
    userID: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    password: { type: String },
    coins: { type: Number, default: 0 }
});

const UserDetails = mongoose.model("UserDetails", userDetailsSchema, "UserDetails");

// ✅ Define Shop Schema and Model inside index.js
const shopSchema = new mongoose.Schema({
    shopName: { type: String, required: true, unique: true },  // ✅ Prevent duplicates
    shopOwnerName: { type: String, required: true },
    password: { type: String, default: "" }
}, { collection: "ShopDetails" });

const ShopDetails = mongoose.model("ShopDetails", shopSchema, "ShopDetails");


const shopProductSchema = new mongoose.Schema({
    shopName: String,
    productName: String,
    price: Number,
    quantity: Number,
    category: String
});

const ShopProduct = mongoose.model("ShopProduct", shopProductSchema);

const userSchema = new mongoose.Schema({
    userID: String,
    username: String,
    coins: Number,
});

const User = mongoose.model("User", userSchema, "UserDetails");





const orderSchema = new mongoose.Schema({
    userID: String,
    shopName: String,
    productName: String,
    quantity: Number,
    price: Number,
    totalAmount: Number,
    orderId: Number,
    timestamp: { type: Date, default: Date.now },
    delivered: { type: Boolean, default: false }  // ✅ New field to track delivered orders
}, { collection: "OrderDetails" });

const OrderDetails = mongoose.model("OrderDetails", orderSchema);



// ✅ API to get all users with coins
app.get("/api/user-details", async (req, res) => {
    try {
        const users = await UserDetails.find({}, "userID username coins");
        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Error fetching users" });
    }
});

// ✅ API to check if user exists
app.post('/api/check-user-details', async (req, res) => {
    console.log("Incoming Request Body:", req.body); // Debugging

    const { userID } = req.body;

    if (!userID) {
        return res.status(400).json({ error: 'UserID is required' });
    }

    try {
        const user = await UserDetails.findOne({ userID });
        console.log("Found User:", user); // Debugging

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.status(200).json({
            message: user.password ? 'Password exists' : 'Set new password',
            hasPassword: !!user.password
        });

    } catch (error) {
        console.error('Error checking user:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ✅ Login API
app.post("/api/login-user-details", async (req, res) => {
    try {
        const { userID, password } = req.body;

        const user = await UserDetails.findOne({ userID });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (user.password !== password) {
            return res.status(401).json({ error: "Invalid password" });
        }

        // Include `coins` in the response
        res.json({
            message: "Login successful",
            userID: user.userID,
            username: user.username,
            coins: user.coins  // 🔥 Add this line
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


// ✅ Set Password API
app.post("/api/set-user-password", async (req, res) => {
    const { userID, newPassword, confirmPassword } = req.body;

    if (!userID || !newPassword || !confirmPassword) {
        return res.status(400).json({ error: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: "Passwords do not match" });
    }

    try {
        const user = await UserDetails.findOneAndUpdate(
            { userID },
            { password: newPassword },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ message: "Password set successfully" });
    } catch (error) {
        console.error("Set password error:", error);
        res.status(500).json({ error: "Failed to set password" });
    }
});

// ✅ API to Update Coins
app.post("/api/update-coins", async (req, res) => {
    const { userID, amount } = req.body;

    if (!userID || amount === undefined) {
        return res.status(400).json({ error: "Missing userID or amount" });
    }

    try {
        const user = await UserDetails.findOne({ userID });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        user.coins += amount;
        await user.save();

        res.json({ success: true, coins: user.coins });
    } catch (error) {
        console.error("Error updating coins:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ API to Get Coins for a Specific User
app.get("/api/user-details/:userID", async (req, res) => {
    try {
        const user = await UserDetails.findOne({ userID: req.params.userID });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(user);
    } catch (error) {
        console.error("Error fetching user coins:", error);
        res.status(500).json({ error: "Error fetching user coins" });
    }
});

// ✅ API to Register New User
app.post("/api/register", async (req, res) => {
    const { userID, username, password } = req.body;

    if (!userID || !username || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const existingUser = await UserDetails.findOne({ userID });

        if (existingUser) {
            return res.status(400).json({ error: "UserID already exists" });
        }

        const newUser = new UserDetails({ userID, username, password, coins: 0 });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ error: "Registration failed" });
    }
});




app.get("/api/shops", async (req, res) => {
    try {
        const shops = await ShopDetails.find({}, "shopName shopOwnerName");
        res.status(200).json(shops); // ✅ Ensure response is JSON
    } catch (error) {
        console.error("Error fetching shops:", error);
        res.status(500).json({ error: "Internal server error" }); // ✅ Return JSON instead of HTML
    }
});






// app.post("/api/add-shop", async (req, res) => {
//     try {
//         const { shopName, shopOwnerName } = req.body;

//         // Check if shop already exists in ShopDetails collection
//         const existingShop = await ShopDetails.findOne({ shopName });

//         if (existingShop) {
//             return res.status(400).json({ error: "Shop name already exists" });
//         }

//         // Add shop details to ShopDetails collection
//         const newShop = new ShopDetails({ shopName, shopOwnerName });
//         await newShop.save();

//         // Define a dynamic schema for the new shop's collection
//         const shopSchema = new mongoose.Schema({
//             productName: String,
//             quantity: Number,
//             price: Number,
//             category: String
//         });

//         // Create a new Mongoose model dynamically
//         const ShopModel = mongoose.model(shopName, shopSchema, shopName);

//         // Insert a dummy document to force collection creation
//         await ShopModel.create({
//             productName: "Sample Product",
//             quantity: 0,
//             price: 0,
//             category: "Sample Category"
//         });

//         res.status(201).json({ success: true, message: "Shop added successfully and collection created" });

//     } catch (error) {
//         console.error("Error adding shop:", error);
//         res.status(500).json({ error: "Internal server error" });
//     }
// });


app.post("/api/add-shop", async (req, res) => {
    try {
        const { shopName, shopOwnerName } = req.body;

        if (!shopName || !shopOwnerName) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const sanitizedShopName = shopName.replace(/\s+/g, '_').toLowerCase();

        const existingShop = await ShopDetails.findOne({ shopName });

        if (existingShop) {
            return res.status(400).json({ error: "Shop name already exists" });
        }

        const newShop = new ShopDetails({ shopName, shopOwnerName });
        await newShop.save();

        const shopSchema = new mongoose.Schema({
            productName: String,
            quantity: Number,
            price: Number,
            category: String
        }, { timestamps: true });

        const ShopModel = mongoose.models[sanitizedShopName] ||
            mongoose.model(sanitizedShopName, shopSchema, sanitizedShopName);

        await ShopModel.create({
            productName: "Sample Product",
            quantity: 0,
            price: 0,
            category: "Sample Category"
        });

        res.status(201).json({ success: true, message: "Shop added successfully and collection created" });

    } catch (error) {
        console.error("Error adding shop:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});




// API to validate shop password
app.post("/api/validate-shop", async (req, res) => {
    console.log("🔹 API /validate-shop called");

    // ✅ Debug: Log DB status
    console.log("🔹 DB Object:", db);

    if (!db) {
        console.error("❌ Database not connected!");
        return res.status(500).json({ success: false, message: "Database not connected" });
    }

    try {
        const { shopName, password } = req.body;
        console.log("🔹 Received:", shopName, password);

        const shop = await db.collection("ShopDetails").findOne({ shopName });
        console.log("🔹 Shop Found:", shop);

        if (!shop) {
            return res.status(404).json({ success: false, message: "Shop not found" });
        }
        if (shop.password !== password) {
            return res.status(401).json({ success: false, message: "Invalid password" });
        }

        res.json({ success: true, message: "Shop validated successfully" });
    } catch (error) {
        console.error("❌ Error in /api/validate-shop:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});



app.get("/api/check-shop", async (req, res) => {
    try {
        const { shopName } = req.query; // Getting shopName from query params
        const shop = await ShopDetails.findOne({ shopName });

        if (shop) {
            return res.json({ exists: true, message: "Shop exists" });
        } else {
            return res.json({ exists: false, message: "Shop not found" });
        }
    } catch (error) {
        console.error("Error checking shop:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});







app.post("/api/set-password", async (req, res) => {
    try {
        const { shopName, password } = req.body;

        const shop = await ShopDetails.findOne({ shopName });

        if (!shop) {
            return res.status(404).json({ error: "Shop not found" });
        }

        // Check if password already exists
        if (shop.password) {
            return res.json({ message: "Password already set", success: false });
        }

        // Update password
        shop.password = password;
        await shop.save();

        res.json({ message: "Password set successfully", success: true });
    } catch (error) {
        console.error("Error setting password:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});




app.get("/api/get-shop", async (req, res) => {
    try {
        const { shopName } = req.query;
        const shop = await ShopDetails.findOne({ shopName });

        if (shop) {
            return res.json({
                exists: true,
                shopName: shop.shopName,
                shopOwnerName: shop.shopOwnerName,
                passwordExists: !!shop.password // true if password is set
            });
        } else {
            return res.json({ exists: false, message: "Shop not found" });
        }
    } catch (error) {
        console.error("Error fetching shop:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});




app.get("/api/shop-details", async (req, res) => {
    const { shopName } = req.query;
    const products = await db.collection(shopName).find().toArray();

    res.json(products);
});




app.post("/api/add-product", async (req, res) => {
    const { shopName, productName, quantity, price, category } = req.body;

    if (!shopName || !productName || !quantity || !price || !category) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    try {
        await db.collection(shopName).insertOne({
            productName,
            quantity: parseInt(quantity),
            price: parseFloat(price),
            category
        });

        res.json({ success: true, message: "Product added successfully!" });
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({ success: false, message: "Error adding product" });
    }
});




app.get("/api/products/:shopName", async (req, res) => {
    try {
        const { shopName } = req.params;

        // ✅ Ensure the collection name is correct
        const ShopProducts = mongoose.model(shopName, shopProductSchema, shopName);
        const products = await ShopProducts.find({});

        res.status(200).json(products); // ✅ Return JSON
    } catch (error) {
        console.error(`Error fetching products for ${req.params.shopName}:`, error);
        res.status(500).json({ error: "Internal server error" }); // ✅ Return JSON
    }
});

app.get("/api/products/:shop", async (req, res) => {
    try {
        const products = await ShopProduct.find({ shopName: req.params.shop });
        res.json(products);
    } catch (error) {
        console.error(`Error fetching products for ${req.params.shop}:`, error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});




app.post("/api/buy", async (req, res) => {
    try {
        const { username, shopName, cart } = req.body;
        console.log("Received from client:", req.body);
        if (!username || !shopName || !cart || cart.length === 0) {
            return res.status(400).json({ message: "Invalid request data" });
        }

        // ✅ Find user by username
        const user = await UserDetails.findOne({ username });
        if (!user) return res.status(404).json({ message: "User not found" });

        const userID = user.userID; // ✅ Get userID
        const productCollection = mongoose.connection.collection(shopName);

        let totalCost = 0;

        // ✅ Check stock and calculate total cost
        for (let item of cart) {
            const product = await productCollection.findOne({ productName: item.productName });

            if (!product) {
                return res.status(404).json({ message: `Product ${item.productName} not found` });
            }
            if (product.quantity < item.quantity) {
                return res.status(400).json({ message: `Not enough stock for ${item.productName}` });
            }

            totalCost += item.price * item.quantity;
        }

        if (user.coins < totalCost) {
            return res.status(400).json({ message: "Not enough coins" });
        }

        // ✅ Deduct user coins
        user.coins -= totalCost;
        await user.save();

        // ✅ Deduct product quantity
        for (let item of cart) {
            await productCollection.updateOne(
                { productName: item.productName },
                { $inc: { quantity: -item.quantity } }
            );
        }

        // ✅ Generate Order ID
        const orderId = Math.floor(1000 + Math.random() * 9000);

        // ✅ Ensure all required fields are inserted
        const orders = cart.map(item => ({
            userID: user.userID,  // ✅ Store userID
            shopName,
            productName: item.productName,
            quantity: item.quantity,  // ✅ Store quantity
            price: item.price,  // ✅ Store price per unit
            totalAmount: item.quantity * item.price,  // ✅ Store totalAmount
            orderId,
            timestamp: new Date()
        }));

        // ✅ Insert into MongoDB
        await OrderDetails.insertMany(orders);

        res.json({
            message: "Purchase successful!",
            orderId,
            remainingCoins: user.coins,
            orders
        });

    } catch (error) {
        console.error("Error processing order:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});











// API to place an order (Saves to OrderDetails)
app.post("/api/orders", async (req, res) => {
    try {
        const { shopName, productName, username } = req.body;
        const orderId = Math.floor(1000 + Math.random() * 9000); // Generate order ID

        // ✅ 1. Find product by shop and name
        const product = await ShopProduct.findOne({ shopName, productName });

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // ✅ 2. Check stock
        if (product.quantity < 1) {
            return res.status(400).json({ success: false, message: "Out of stock" });
        }

        // ✅ 3. Atomically update stock (avoid race conditions)
        const updated = await ShopProduct.findOneAndUpdate(
            { _id: product._id, quantity: { $gte: 1 } },
            { $inc: { quantity: -1 } },
            { new: true }
        );

        if (!updated) {
            return res.status(409).json({ success: false, message: "Stock was taken by someone else just now" });
        }

        // ✅ 4. Save order
        const newOrder = new OrderDetails({ shopName, productName, username, orderId });
        await newOrder.save();

        res.json({ success: true, message: "✅ Order placed successfully!", orderId });
    } catch (error) {
        console.error("Error placing order:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});


// API to fetch orders for a shop (From OrderDetails)
app.get("/api/orders/:shopName", async (req, res) => {
    try {
        const orders = await OrderDetails.find({
            shopName: req.params.shopName,
            delivered: false // ✅ Fetch only non-delivered orders
        }).sort({ timestamp: -1 });

        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});




app.put("/api/orders/deliver/:orderId", async (req, res) => {
    try {
        const updatedOrder = await OrderDetails.findByIdAndUpdate(
            req.params.orderId,
            { delivered: true }, // ✅ Mark as delivered
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        res.json({ success: true, message: "Order delivered successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});




app.get("/api/delivered-orders/:shopName", async (req, res) => {
    try {
        const orders = await OrderDetails.find({
            shopName: req.params.shopName,
            delivered: true
        }).sort({ timestamp: -1 });

        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});





app.get('/api/report', async (req, res) => {
    const { userID, month, year } = req.query;

    if (!userID || !month || !year) {
        return res.status(400).json({ error: "User ID, Month, and Year are required" });
    }

    try {
        const startDate = new Date(`${year}-${month}-01`);
        const endDate = new Date(`${year}-${month}-31`);

        const orders = await OrderDetails.find({
            userID: userID,
            timestamp: { $gte: startDate, $lte: endDate }
        }).select("shopName productName quantity totalAmount timestamp"); // Use totalAmount

        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: "Error fetching orders" });
    }
});



app.get("/api/orders/report", async (req, res) => {
    const { shopName, month, year } = req.query;

    try {
        const orders = await OrderDetails.find({
            shopName,
            timestamp: {
                $gte: new Date(`${year}-${month}-01`),
                $lt: new Date(`${year}-${parseInt(month) + 1}-01`)
            }
        });

        res.json(orders);
    } catch (error) {
        console.error("Error fetching report:", error);
        res.status(500).json({ error: "Failed to fetch report" });
    }
});


// Example route in your Express backend
// app.delete("/api/orders/decline/:orderId", async (req, res) => {
//     const { orderId } = req.params;

//     try {
//         const order = await Order.findById(orderId);
//         if (!order) return res.status(404).json({ error: "Order not found" });

//         // Restore product quantity
//         await Product.updateOne(
//             { shopName: order.shopName, productName: order.productName },
//             { $inc: { quantity: order.quantity } }
//         );

//         // Restore user coins
//         await User.updateOne(
//             { userID: order.userID },
//             { $inc: { coins: order.totalAmount } }
//         );

//         // Delete order
//         await OrderDetails.deleteOne({ _id: orderId });

//         res.json({ success: true, message: "Order declined and inventory/coins restored." });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: "Server error during decline." });
//     }
// });


app.delete("/api/orders/decline/:orderId", async (req, res) => {
    try {
        const orderId = req.params.orderId;

        // Step 1: Find the order
        const order = await OrderDetails.findById(orderId);
        if (!order) {
            console.log("Order not found");
            return res.status(404).json({ message: "Order not found" });
        }

        console.log("Order found:", order);

        const { userID, productName, quantity, totalAmount, shopName } = order;

        // Step 2: Refund coins
        const user = await User.findOne({ userID: userID.trim() });

        if (!user) {
            console.log("All users:", await User.find({}));

            // console.log("User not found:", userID);
        } else {
            console.log("User before refund:", user);
            user.coins += totalAmount;
            await user.save();
            console.log("User after refund:", user);
        }

        // Step 3: Restore product quantity
        // Update product quantity from the specific shop collection
        const getShopProductModel = (shopName) => {
            return mongoose.model(shopName, shopProductSchema, shopName);
        };

        const ShopProduct = getShopProductModel(order.shopName);
        const product = await ShopProduct.findOne({ productName: order.productName });
        if (product) {
            product.quantity += order.quantity;
            await product.save();
            console.log("Product quantity restored.");
        } else {
            console.log("Product not found in", order.shopName);
        }

        // Step 4: Delete order
        await OrderDetails.findByIdAndDelete(orderId);
        console.log("Order deleted");

        res.status(200).json({ message: "Order declined and changes made" });
    } catch (error) {
        console.error("Error in decline route:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});














// ✅ Start the server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));