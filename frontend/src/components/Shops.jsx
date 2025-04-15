import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Shops = () => {
    const [shops, setShops] = useState([]);
    const [selectedShop, setSelectedShop] = useState(null);
    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();  // Navigation Hook

    // Fetch shop data from backend
    useEffect(() => {
        fetch("http://localhost:5000/api/shops")

            .then((response) => response.json())
            .then((data) => setShops(data))
            .catch((error) => console.error("Error fetching shops:", error));
    }, []);

    // Handle when a shop is clicked
    const handleShopClick = async (shopName) => {
        try {
            const response = await fetch(`http://localhost:5000/api/get-shop?shopName=${shopName}`);

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const data = await response.json();
            if (data.exists) {
                setSelectedShop({
                    shopName: data.shopName,
                    shopOwnerName: data.shopOwnerName,
                    passwordExists: data.passwordExists
                });
            } else {
                alert("Shop not found");
            }
        } catch (error) {
            console.error("Error checking shop:", error);
        }
    };

    // Handle password submission (Login)
    const handleLogin = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/validate-shop", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ shopName: selectedShop.shopName, password }),
            });
            
         

            const data = await response.json();
            if (data.success) {
                alert("Login Successful!");
                navigate(`/shop/${selectedShop.shopName}`);  // Redirect to ShopPage
            } else {
                setError("Invalid password!");
            }
        } catch (error) {
            console.error("Error validating shop:", error);
        }
    };

    // Handle setting a new password
    const handleSetPassword = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/set-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ shopName: selectedShop.shopName, password: newPassword }),
            });
            
           

            const data = await response.json();
            alert(data.message);
        } catch (error) {
            console.error("Error setting password:", error);
        }
    };
    return (
        <div className="mx-auto max-w-3xl p-6 bg-white shadow-lg rounded-lg mt-10">
            <h2 className="text-3xl font-bold text-indigo-800 mb-6">Shops List</h2>

            <ul className="space-y-3 font-bold text-[20px]">
                {shops.map((shop, index) => (
                    <li
                        key={index}
                        onClick={() => handleShopClick(shop.shopName)}
                        className="cursor-pointer text-blue-600 hover:text-blue-800 font-semibold border-b border-gray-200 pb-2"
                    >
                        <strong>{shop.shopName || "No Name"}</strong> - Owned by{" "}
                        <span className="text-orange-700">{shop.shopOwnerName || "Unknown Owner"}</span>
                    </li>
                ))}
            </ul>

            {selectedShop && (
                <div className="mt-6 p-4 border border-gray-300 rounded-lg bg-gray-50 shadow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Enter password for <span className="text-indigo-800 font-bold text-2xl">{selectedShop.shopName}</span>
                    </h3>

                    <input
                        type="password"
                        placeholder="Enter Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-indigo-800"
                    />
                    <button
                        onClick={handleLogin}
                        className="mt-4 w-full px-4 py-2 bg-indigo-700 text-white rounded-md hover:bg-indigo-800 transition"
                    >
                        Submit
                    </button>

                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

                    {!selectedShop.passwordExists && (
                        <div className="mt-4">
                            <input
                                type="password"
                                placeholder="Set New Password"
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full p-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                            <button
                                onClick={handleSetPassword}
                                className="mt-3 w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
                            >
                                Set Password
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

};

export default Shops;
