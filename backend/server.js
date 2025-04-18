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
    delivered: { type: Boolean, default: false },
    status: { type: String, default: "Pending" },  // ✅ Existing

    viewed: { type: Boolean, default: false } // 👈 NEW
    // ✅ New
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
        const { username, cart } = req.body;
        const shopName = cart[0]?.shopName;

        console.log("Received from client:", req.body);

        if (!username || !cart || cart.length === 0) {
            return res.status(400).json({ message: "Invalid request data" });
        }

        const user = await UserDetails.findOne({ username });
        if (!user) return res.status(404).json({ message: "User not found" });

        const userID = user.userID;
        const productCollection = mongoose.connection.collection(shopName);

        let totalCost = 0;

        for (let item of cart) {
            const product = await productCollection.findOne({ productName: item.productName });

            if (!product) {
                return res.status(404).json(`{ message: Product ${item.productName} not found }`);
            }
            if (product.quantity < item.quantity) {
                return res.status(400).json(`{ message: Not enough stock for ${item.productName} }`);
            }

            totalCost += item.price * item.quantity;
        }

        if (user.coins < totalCost) {
            return res.status(400).json({ message: "Not enough coins" });
        }

        user.coins -= totalCost;
        await user.save();

        for (let item of cart) {
            await productCollection.updateOne(
                { productName: item.productName },
                { $inc: { quantity: -item.quantity } }
            );
        }

        const orderId = Math.floor(1000 + Math.random() * 9000);

        const orders = cart.map(item => ({
            userID: user.userID,
            shopName,
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
            totalAmount: item.quantity * item.price,
            orderId,
            timestamp: new Date()
        }));

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





app.get("/api/orders/:shopName", async (req, res) => {
    try {
        const orders = await OrderDetails.find({
            shopName: req.params.shopName,
            delivered: false,
            status: { $ne: "Rejected" } // ⛔ Exclude Rejected orders
        }).sort({ timestamp: -1 });


        // Group by orderId
        const grouped = {};

        orders.forEach(order => {
            const id = order.orderId;
            if (!grouped[id]) {
                grouped[id] = {
                    orderId: order.orderId,
                    userID: order.userID,
                    shopName: order.shopName,
                    timestamp: order.timestamp,
                    products: []
                };
            }

            grouped[id].products.push({
                _id: order._id,
                productName: order.productName,
                quantity: order.quantity,
                totalAmount: order.totalAmount
            });
        });

        res.json(Object.values(grouped)); // send grouped orders
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});








app.put("/api/orders/deliver/:orderId", async (req, res) => {
    try {
        const updatedOrder = await OrderDetails.findByIdAndUpdate(
            req.params.orderId,
            {
                delivered: true,
                status: "Success" // ✅ update this too
            },
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
            delivered: true, // ✅ Only include delivered orders
            timestamp: { $gte: startDate, $lte: endDate }
        }).select("shopName productName quantity totalAmount timestamp");

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





app.delete("/api/orders/decline/:orderId", async (req, res) => {
    try {
        const orderId = req.params.orderId;

        // Step 1: Find the order
        const order = await OrderDetails.findById(orderId);
        if (!order) {
            console.log("Order not found");
            return res.status(404).json({ message: "Order not found" });
        }

        const { userID, productName, quantity, totalAmount, shopName } = order;

        // ✅ Step 2: Save rejected copy BEFORE modifying anything
        const rejectedOrder = {
            ...order.toObject(),
            _id: undefined, // avoid duplicate key error
            delivered: false,
            status: "Rejected",
            viewed: false,
        };
        await OrderDetails.create(rejectedOrder);

        // ✅ Step 3: Restore coins
        const user = await User.findOne({ userID: userID.trim() });
        if (user) {
            user.coins += totalAmount;
            await user.save();
        }

        // ✅ Step 4: Restore product quantity
        const getShopProductModel = (shopName) => {
            return mongoose.model(shopName, shopProductSchema, shopName);
        };
        const ShopProduct = getShopProductModel(shopName);
        const product = await ShopProduct.findOne({ productName });
        if (product) {
            product.quantity += quantity;
            await product.save();
        }

        // ✅ Step 5: Delete the original pending order
        await OrderDetails.findByIdAndDelete(orderId);

        res.status(200).json({ message: "Order declined and stored as rejected" });
    } catch (error) {
        console.error("Error in decline route:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});





// PUT /api/products/update
app.put("/api/products/update", async (req, res) => {
    const { shopName, productName, quantity, price } = req.body;

    try {
        const ShopModel = mongoose.model(shopName, shopProductSchema, shopName); // dynamic model by collection
        const updated = await ShopModel.findOneAndUpdate(
            { productName },
            { $set: { quantity, price } },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ message: 'Product updated successfully', updated });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Server error' });
    }
});









app.get("/api/orders/user/:userID", async (req, res) => {
    try {
        const orders = await OrderDetails.aggregate([
            { $match: { userID: req.params.userID, viewed: false } },
            {
                $group: {
                    _id: "$orderId",
                    orderId: { $first: "$orderId" },
                    shopName: { $first: "$shopName" },
                    status: { $first: "$status" },
                    products: {
                        $push: {
                            productName: "$productName",
                            quantity: "$quantity",
                            price: "$price"
                        }
                    },
                    totalAmount: { $first: "$totalAmount" }, // 👈 Fixed here
                    timestamp: { $first: "$timestamp" }
                }
            },
            { $sort: { timestamp: -1 } }
        ]);

        res.json(orders);
    } catch (error) {
        console.error("Error fetching user's unviewed orders:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});






// Mark orders as seen for a user
app.put("/api/orders/mark-seen/:userID", async (req, res) => {
    try {
        const { userID } = req.params;

        await OrderDetails.updateMany(
            { userID, seen: false, status: { $in: ["Success", "Rejected"] } },
            { $set: { seen: true } }
        );

        res.json({ message: "Orders marked as seen" });
    } catch (err) {
        console.error("Error updating orders:", err);
        res.status(500).json({ error: "Failed to mark as seen" });
    }
});


// PUT /api/orders/viewed/:id
app.put("/api/orders/viewed/:orderId", async (req, res) => {
    try {
        await OrderDetails.updateMany(
            { orderId: req.params.orderId },
            { $set: { viewed: true } }
        );
        res.json({ message: "Order marked as viewed" });
    } catch (error) {
        console.error("Error updating viewed status:", error);
        res.status(500).json({ error: "Failed to update viewed status" });
    }
});






app.get("/api/orders/total/:shopName", async (req, res) => {
    try {
        // Aggregating total amount for orders by shopName
        const totalAmount = await OrderDetails.aggregate([
            { $match: { shopName: req.params.shopName } },
            { $group: { _id: "$shopName", totalAmount: { $sum: "$totalAmount" } } }
        ]);

        if (totalAmount.length > 0) {
            res.json(totalAmount[0]); // Send total amount for the shop
        } else {
            res.json({ totalAmount: 0 }); // If no orders, return 0
        }
    } catch (error) {
        console.error("Error fetching total amount for shop:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});




app.get('/api/Shopreport', async (req, res) => {
    const {shopName, month, year} = req.query;
    console.log(shopName);
    

    if (!shopName || !month || !year) {
        return res.status(400).json({error: "Month And year are required"});
    }

    try {
        const startDate = new Date(`${year}-${month}-01`);
        const endDate = new Date(`${year}-${month}-31`);

        const orders = await OrderDetails.find({
            shopName: shopName,
            timestamp: {$gte: startDate, $lte: endDate}
        }).select("shopName productName quantity totalAmount timestamp");

        res.json(orders);
    } catch (error) {
        res.status(500).json({error: "Error fetching Orders"})
    }
});









// ✅ Start the server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));