import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import  axios from "axios";

const ShopPage = () => {
    const { shopName } = useParams();
    const [shopData, setShopData] = useState([]);
    const [productName, setProductName] = useState("");
    const [quantity, setQuantity] = useState("");
    const [price, setPrice] = useState("");
    const [message, setMessage] = useState("");
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]); // Store report data
    const [category, setCategory] = useState("");
    const [editIndex, setEditIndex] = useState(null);
    const [editedProduct, setEditedProduct] = useState({ quantity: '', price: '' });
    const [totalAmount,setTotalAmount] = useState(0);




    // Fetch shop data
    useEffect(() => {
        fetchShopData();
    }, [shopName]);

    const fetchShopData = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/shop-details?shopName=${shopName}`);

            const data = await response.json();
            setShopData(data);
        } catch (error) {
            console.error("Error fetching shop details:", error);
        }
    };

    // Handle adding a new product
    const handleAddProduct = async (e) => {
        e.preventDefault();
        if (!productName || !quantity || !price || !category) {
            setMessage("All fields are required!");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/add-product", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ shopName, productName, quantity, price, category }),

            });



            const data = await response.json();
            setMessage(data.message);

            // Refresh the shop data to show the new product
            if (data.success) {
                fetchShopData();
                setProductName("");
                setQuantity("");
                setPrice("");
                setCategory("");
            }
        } catch (error) {
            console.error("Error adding product:", error);
        }
    };

    const fetchOrders = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/orders/${shopName}`);

            const data = await response.json();
            setOrders(data);
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    };

    useEffect(() => {
        fetchOrders(); // Fetch orders when component loads
        fetchDeliveredOrders();
        // Polling: Fetch new orders every 3 seconds
        const interval = setInterval(() => {
            fetchOrders();
            fetchDeliveredOrders();
        }, 3000);
        return () => clearInterval(interval); // Cleanup on unmount
    }, [shopName]);



    const handleDeliver = async (orderId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/orders/deliver/${orderId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" }
            });

            if (response.ok) {
                // Remove from UI since it is now marked as delivered in DB
                setOrders(orders.filter(order => order._id !== orderId));
                fetchDeliveredOrders();
            } else {
                console.error("Failed to mark order as delivered");
            }
        } catch (error) {
            console.error("Error delivering order:", error);
        }
    };

    const fetchDeliveredOrders = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/delivered-orders/${shopName}`);
            const data = await response.json();
            setFilteredOrders(data);
        } catch (error) {
            console.error("Failed to fetch delivered orders:", error);
        }
    };


    const handleDecline = async (orderId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/orders/decline/${orderId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setOrders(prev => prev.filter(order => order._id !== orderId));
                setMessage("Order declined successfully.");
            } else {
                console.error("Failed to decline the order");
            }
        } catch (error) {
            console.error("Error declining the order:", error);
        }
    };

    const handleSave = async (shopName, productName) => {
        try {
            const res = await fetch("http://localhost:5000/api/products/update", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    shopName,
                    productName,
                    quantity: Number(editedProduct.quantity),
                    price: Number(editedProduct.price)
                }),
            });

            if (!res.ok) throw new Error("Failed to update");

            const updatedProduct = await res.json();

            const updatedData = [...shopData];
            updatedData[editIndex] = {
                ...updatedData[editIndex],
                quantity: editedProduct.quantity,
                price: editedProduct.price,
            };

            setShopData(updatedData);
            setEditIndex(null);
            setEditedProduct({ quantity: "", price: "" });
        } catch (err) {
            console.error("Failed to update product", err);
        }
    };

    useEffect(() => {
        axios.get("http://localhost:5000/api/total-amount")
        .then((response) => {
            setTotalAmount(response.data.totalAmount);
        })
        .catch((error) => {
            console.error("Error fetching total amount:", error);
        })
    })








    return (
        <div className="mx-auto max-w-5xl p-6 bg-white shadow-lg rounded-lg mt-10">
            <h2 className="text-3xl font-bold text-indigo-800 mb-6">Welcome to <span className="text-orange-600">{shopName}</span></h2>

            {/* Add Product Form */}
            <div className="bg-gray-100 p-5 rounded-lg shadow-md mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Add a Product</h3>
                <form onSubmit={handleAddProduct} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Product Name"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        required
                        className="w-full p-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                        type="number"
                        placeholder="Quantity"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        required
                        className="w-full p-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                        type="number"
                        placeholder="Price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                        className="w-full p-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                        type="text"
                        placeholder="Category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                        className="w-full p-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                        type="submit"
                        className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
                    >
                        Add Product
                    </button>
                </form>
                {message && <p className="text-green-600 mt-2">{message}</p>}
            </div>

            {/* Shop Inventory */}
            <div className="bg-gray-100 p-5 rounded-lg shadow-md mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Shop Inventory</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300">
                        <thead className="bg-gray-200">

                            <tr>

                                <th className="p-3 border">Product Name</th>
                                <th className="p-3 border">Quantity</th>
                                <th className="p-3 border">Price</th>
                                <th className="p-3 border">Category</th>
                                <th className="p-3 border">Action</th>

                            </tr>

                        </thead>
                        <tbody>
                            {shopData.map((item, index) => (
                                <tr key={index} className="border-b border-gray-300">
                                    <td className="p-3 text-center">{item.productName}</td>
                                    <td className="p-3 text-center">
                                        {editIndex === index ? (
                                            <input
                                                type="number"
                                                value={editedProduct.quantity}
                                                onChange={(e) =>
                                                    setEditedProduct({ ...editedProduct, quantity: e.target.value })
                                                }
                                                className="w-20 p-1 border rounded"
                                            />
                                        ) : (
                                            item.quantity
                                        )}
                                    </td>
                                    <td className="p-3 text-center">
                                        {editIndex === index ? (
                                            <input
                                                type="number"
                                                value={editedProduct.price}
                                                onChange={(e) =>
                                                    setEditedProduct({ ...editedProduct, price: e.target.value })
                                                }
                                                className="w-20 p-1 border rounded"
                                            />
                                        ) : (
                                            item.price
                                        )}
                                    </td>

                                    <td className="p-3 text-center">{item.category}</td>
                                    <td className="p-3 border">
                                        {editIndex === index ? (
                                            <button
                                                className="px-4 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
                                                onClick={() => handleSave(shopName, item.productName)}
                                            >
                                                Save
                                            </button>
                                        ) : (
                                            <button
                                                className="px-4 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                                                onClick={() => {
                                                    setEditIndex(index);
                                                    setEditedProduct({ quantity: item.quantity, price: item.price });
                                                }}
                                            >
                                                Update
                                            </button>
                                        )}
                                    </td>

                                </tr>
                            ))}

                        </tbody>
                    </table>
                </div>
            </div>

            {/* Shop Orders */}
            <div className="bg-gray-100 p-5 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Shop Orders</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="p-3 border">Order ID</th>
                                <th className="p-3 border">UserID</th>
                                <th className="p-3 border">Product Name</th>
                                <th className="p-3 border">Quantity</th>
                                <th className="p-3 border">Total Amount</th>
                                <th className="p-3 border">Timestamp</th>
                                <th className="p-3 border">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order._id} className="text-center border-b">
                                    <td className="p-3 border">{order.orderId}</td>
                                    <td className="p-3 border">{order.userID}</td>
                                    <td className="p-3 border">{order.productName}</td>
                                    <td className="p-3 border">{order.quantity}</td>
                                    <td className="p-3 border">₹{order.totalAmount}</td>
                                    <td className="p-3 border">{new Date(order.timestamp).toLocaleString()}</td>
                                    <td className="p-3 border">
                                        <button
                                            onClick={() => handleDeliver(order._id)}
                                            className="px-4 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                                        >
                                            Deliver
                                        </button>
                                    </td>
                                    <td className="p-3 border">

                                        <button
                                            onClick={() => handleDecline(order._id)}
                                            className="px-4 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                                        >
                                            Decline
                                        </button>
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>



            <div className="bg-gray-100 p-5 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Report for {shopName}</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="p-3 border">Order ID</th>
                                <th className="p-3 border">UserID</th>
                                <th className="p-3 border">Product Name</th>
                                <th className="p-3 border">Quantity</th>
                                <th className="p-3 border">Total Amount</th>
                                <th className="p-3 border">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map(order => (
                                <tr key={order._id} className="text-center border-b">
                                    <td className="p-3 border">{order.orderId}</td>
                                    <td className="p-3 border">{order.userID || order.username}</td>
                                    <td className="p-3 border">{order.productName}</td>
                                    <td className="p-3 border">{order.quantity}</td>
                                    <td className="p-3 border">₹{order.totalAmount}</td>
                                    <td className="p-3 border">{new Date(order.timestamp).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div>
                        {totalAmount}
                    </div>
                </div>
            </div>



        </div>
    );

};

export default ShopPage;
