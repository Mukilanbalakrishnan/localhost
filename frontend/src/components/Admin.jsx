import React, { useEffect, useState } from "react";

const Admin = () => {
    const [users, setUsers] = useState([]);
    const [coinInputs, setCoinInputs] = useState({}); // Store input values for each user
    const [shopName, setShopName] = useState("");
    const [shopOwnerName, setShopOwnerName] = useState("");

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/user-details"); // Updated API endpoint
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setUsers(data);
        } catch (err) {
            console.error("Error fetching users:", err);
        }
    };



    const updateCoins = async (userID, isAdding) => {
        const amount = coinInputs[userID] ? parseInt(coinInputs[userID]) : 0;
        if (isNaN(amount) || amount <= 0) {
            alert("Please enter a valid number greater than 0");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/update-coins", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userID, amount: isAdding ? amount : -amount }) // Add or remove coins
            });
        
            const data = await response.json();
        
            if (response.ok) {
                alert("Coins updated!");
                await fetchUsers(); // Refresh data after update
                setCoinInputs((prev) => ({ ...prev, [userID]: "" })); // Reset input field
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error("Error updating coins:", error);
        }
        
    };



    const handleSubmit = async (event) => {
        event.preventDefault();

        const newShop = { shopName, shopOwnerName };

        try {
            const response = await fetch("http://localhost:5000/api/add-shop", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newShop),
            });
        

            const data = await response.json();
            console.log("Response:", data);

            if (data.success) {
                alert("Shop added successfully!");
                setShopName("");
                setShopOwnerName("");
            } else {
                alert("Error adding shop.");
            }
        } catch (error) {
            console.error("Error submitting shop details:", error);
        }
    };

    

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
                {/* User Coins Data */}
                <div className="w-full md:w-2/3 p-4 bg-white shadow-md rounded-lg">
                    <h2 className="text-xl font-bold mb-4">User Balance Data</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-gray-800 text-white text-left">
                                    <th className="p-3 border border-gray-300">User ID</th>
                                    <th className="p-3 border border-gray-300">Username</th>
                                    <th className="p-3 border border-gray-300">Balance</th>
                                    <th className="p-3 border border-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length > 0 ? (
                                    users.map((user) => (
                                        <tr key={user.userID} className="border border-gray-300">
                                            <td className="p-3 border border-gray-300">{user.userID}</td>
                                            <td className="p-3 border border-gray-300">{user.username}</td>
                                            <td className="p-3 border border-gray-300">{user.coins ?? "N/A"}</td>
                                            <td className="p-3 border border-gray-300 flex gap-2">
                                                <input
                                                    type="number"
                                                    value={coinInputs[user.userID] || ""}
                                                    onChange={(e) =>
                                                        setCoinInputs({ ...coinInputs, [user.userID]: e.target.value })
                                                    }
                                                    placeholder="Enter Rupees"
                                                    className="border border-gray-300 rounded p-1 w-20"
                                                />
                                                <button
                                                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                                    onClick={() => updateCoins(user.userID, true)}
                                                >
                                                    Add
                                                </button>
                                                <button
                                                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                                    onClick={() => updateCoins(user.userID, false)}
                                                    disabled={(user.coins ?? 0) < (coinInputs[user.userID] || 0)}
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center p-4">No users found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Admin - Add Shop (Static on Right Side) */}
                <div className="w-full lg:w-1/4 lg:fixed right-20 top-20 ">
                    <h2 className="text-2xl font-bold mb-4">Admin - Add Shop</h2>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <input
                            type="text"
                            placeholder="Shop Name"
                            value={shopName}
                            onChange={(e) => setShopName(e.target.value)}
                            required
                            className="border p-2"
                        />
                        <input
                            type="text"
                            placeholder="Shop Owner Name"
                            value={shopOwnerName}
                            onChange={(e) => setShopOwnerName(e.target.value)}
                            required
                            className="border p-2"
                        />
                        <button type="submit" className="bg-blue-500 text-white px-4 py-2">Add Shop</button>
                    </form>
                </div>
            </div>
        </div>
    );

};

// Styles
const tableHeaderStyle = { padding: "10px", borderBottom: "2px solid #ddd" };
const tableCellStyle = { padding: "10px", borderBottom: "1px solid #ddd" };
const tableRowStyle = { backgroundColor: "#000" };
const inputStyle = { padding: "5px", width: "80px", marginRight: "5px" };
const buttonStyle = { padding: "5px 10px", marginLeft: "5px", border: "none", borderRadius: "4px", cursor: "pointer", backgroundColor: "#5cb85c", color: "#fff" };

export default Admin;
