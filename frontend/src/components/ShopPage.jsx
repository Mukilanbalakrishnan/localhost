


import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ShopPage = () => {
    const [shopData, setShopData] = useState([]);
    const [productName, setProductName] = useState("");
    const [quantity, setQuantity] = useState("");
    const [price, setPrice] = useState("");
    const [message, setMessage] = useState("");
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [category, setCategory] = useState("");
    const [editIndex, setEditIndex] = useState(null);
    const [editedProduct, setEditedProduct] = useState({ quantity: "", price: "" });
    const [totalAmount, setTotalAmount] = useState(0);
    const [shopReportData, setShopReportData] = useState([]);
    const [showShopReport, setShowShopReport] = useState(false);

    const { shopName } = useParams();

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

    const fetchDeliveredOrders = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/delivered-orders/${shopName}`);
            const data = await response.json();
            setFilteredOrders(data);
            const total = data.reduce((sum, order) => sum + order.totalAmount, 0);
            setTotalAmount(total);
        } catch (error) {
            console.error("Failed to fetch delivered orders:", error);
        }
    };

    useEffect(() => {
        fetchOrders();
        fetchDeliveredOrders();

        const interval = setInterval(() => {
            fetchOrders();
            fetchDeliveredOrders();
        }, 3000);

        return () => clearInterval(interval);
    }, [shopName]);

    const handleDeliver = async (orderId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/orders/deliver/${orderId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
            });

            if (response.ok) {
                setOrders(orders.filter((order) => order._id !== orderId));
                fetchDeliveredOrders();
                fetchShopData();
            } else {
                console.error("Failed to mark order as delivered");
            }
        } catch (error) {
            console.error("Error delivering order:", error);
        }
    };

    const handleDecline = async (orderId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/orders/decline/${orderId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                const result = await response.json();
                console.log("Order declined:", result.message);
                fetchOrders();
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
                    price: Number(editedProduct.price),
                }),
            });

            if (!res.ok) throw new Error("Failed to update");

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

    const handleGroupedDeliver = async (orderIds) => {
        for (const orderId of orderIds) {
            await handleDeliver(orderId);
        }
    };

    const handleGroupedDecline = async (orderIds) => {
        try {
            const responses = await Promise.all(
                orderIds.map((orderId) =>
                    fetch(`http://localhost:5000/api/orders/decline/${orderId}`, {
                        method: "DELETE",
                    })
                )
            );

            const allSuccessful = responses.every((res) => res.ok);

            if (allSuccessful) {
                setOrders((prevOrders) =>
                    prevOrders.filter((group) => !orderIds.includes(group.products[0]._id))
                );
                setMessage("Order group declined successfully.");
            } else {
                console.error("One or more decline requests failed.");
            }
        } catch (error) {
            console.error("Error declining grouped orders:", error);
        }
    };

    useEffect(() => {
        const fetchTotalAmount = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/orders/total/${shopName}`);
                const data = await response.json();
                setTotalAmount(data.totalAmount);
            } catch (error) {
                console.error("Error fetching total amount:", error);
            }
        };

        fetchTotalAmount();
    }, [shopName]);

    const handleGenerateReport = async () => {
        if (!shopName) {
            alert("Login to shop");
            return;
        }

        const month = prompt("Enter Month (MM):");
        const year = prompt("Enter Year (YYYY):");

        if (!month || !year) {
            alert("Please Enter month and year");
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:5000/api/Shopreport?shopName=${shopName}&month=${month}&year=${year}`
            );

            if (!response.ok) {
                throw new Error(`Http Error: ${response.status}`);
            }

            const data = await response.json();
            setShopReportData(data);
            setShowShopReport(true);
        } catch (error) {
            console.error("Error fetching report:", error);
            alert("Failed to fetch report. Please try again.");
        }
    };

    return (
        <div className="mx-auto max-w-5xl p-6 bg-white shadow-lg rounded-lg mt-10">
            <h2 className="text-3xl font-bold text-indigo-800 mb-6">
                Welcome to <span className="text-orange-600">{shopName}</span>
            </h2>

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
                        className="w-full p-2 border border-gray-400 rounded-md"
                    />
                    <input
                        type="number"
                        placeholder="Quantity"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        required
                        className="w-full p-2 border border-gray-400 rounded-md"
                    />
                    <input
                        type="number"
                        placeholder="Price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                        className="w-full p-2 border border-gray-400 rounded-md"
                    />
                    <input
                        type="text"
                        placeholder="Category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                        className="w-full p-2 border border-gray-400 rounded-md"
                    />
                    <button
                        type="submit"
                        className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                    >
                        Add Product
                    </button>
                </form>
                {message && <p className="text-green-600 mt-2">{message}</p>}
            </div>

            {/* Continue with rest of the components like inventory, orders, reports */}
            <table className="min-w-full table-auto text-sm text-left text-gray-700">
                <thead>
                    <tr className="bg-indigo-200 text-indigo-900">
                        <th className="px-4 py-2">Product</th>
                        <th className="px-4 py-2">Category</th>
                        <th className="px-4 py-2">Quantity</th>
                        <th className="px-4 py-2">Price</th>
                        <th className="px-4 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {shopData.map((product, index) => (
                        <tr key={index} className="border-t">
                            <td className="px-4 py-2">{product.productName}</td>
                            <td className="px-4 py-2">{product.category}</td>
                            <td className="px-4 py-2">
                                {editIndex === index ? (
                                    <input
                                        type="number"
                                        value={editedProduct.quantity}
                                        onChange={(e) =>
                                            setEditedProduct({ ...editedProduct, quantity: e.target.value })
                                        }
                                        className="w-16 border px-2 py-1"
                                    />
                                ) : (
                                    product.quantity
                                )}
                            </td>
                            <td className="px-4 py-2">
                                {editIndex === index ? (
                                    <input
                                        type="number"
                                        value={editedProduct.price}
                                        onChange={(e) =>
                                            setEditedProduct({ ...editedProduct, price: e.target.value })
                                        }
                                        className="w-16 border px-2 py-1"
                                    />
                                ) : (
                                    product.price
                                )}
                            </td>
                            <td className="px-4 py-2">
                                {editIndex === index ? (
                                    <button
                                        onClick={() => handleSave(shopName, product.productName)}
                                        className="text-green-600 hover:underline mr-2"
                                    >
                                        Save
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setEditIndex(index);
                                            setEditedProduct({ quantity: product.quantity, price: product.price });
                                        }}
                                        className="text-blue-600 hover:underline"
                                    >
                                        Edit
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Order Section */}
            <div className="bg-gray-100 p-5 rounded-lg shadow-md mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Pending Orders</h3>
                {orders.length === 0 ? (
                    <p className="text-gray-600">No pending orders.</p>
                ) : (
                    orders.map((order) => (
                        <div key={order._id} className="border-b py-3">
                            <p><strong>Customer:</strong> {order.customerName}</p>
                            <p><strong>Products:</strong></p>
                            <ul className="list-disc ml-6">
                                {order.products.map((product, i) => (
                                    <li key={i}>
                                        {product.productName} - {product.quantity} pcs @ ₹{product.price}
                                    </li>
                                ))}
                            </ul>
                            <p><strong>Total:</strong> ₹{order.totalAmount}</p>
                            <div className="mt-2 space-x-2">
                                <button
                                    onClick={() => handleDeliver(order._id)}
                                    className="px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                                >
                                    Deliver
                                </button>
                                <button
                                    onClick={() => handleDecline(order._id)}
                                    className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                >
                                    Decline
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>


            {/* Delivered Orders Report */}
            <div className="bg-gray-100 p-5 rounded-lg shadow-md mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Delivered Orders Summary</h3>
                <p className="mb-2">Total Earned: ₹{totalAmount}</p>
                <button
                    onClick={handleGenerateReport}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                    Generate Monthly Report
                </button>

                {showShopReport && (
                    <div className="mt-4">
                        <h4 className="text-lg font-semibold mb-2">Monthly Report</h4>
                        {shopReportData.length === 0 ? (
                            <p>No data available for this period.</p>
                        ) : (
                            <table className="w-full table-auto text-sm text-left mt-2">
                                <thead className="bg-gray-300">
                                    <tr>
                                        <th className="px-4 py-2">Date</th>
                                        <th className="px-4 py-2">Customer</th>
                                        <th className="px-4 py-2">Products</th>
                                        <th className="px-4 py-2">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {shopReportData.map((report, idx) => (
                                        <tr key={idx} className="border-t">
                                            <td className="px-4 py-2">{report.date}</td>
                                            <td className="px-4 py-2">{report.customerName}</td>
                                            <td className="px-4 py-2">
                                                <ul className="list-disc ml-4">
                                                    {report.products.map((p, i) => (
                                                        <li key={i}>{p.productName} ({p.quantity})</li>
                                                    ))}
                                                </ul>
                                            </td>
                                            <td className="px-4 py-2">₹{report.totalAmount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShopPage;


