import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [shops, setShops] = useState([]);
    const [reportData, setReportData] = useState([]);
    const [showReport, setShowReport] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("userDetails"));
        if (storedUser) {
            setUser(storedUser);
            fetchUserDetails(storedUser.userID); // Fetch latest user data
        }
    }, []);

    // Function to fetch user details dynamically
    const fetchUserDetails = async (userID) => {
        try {
            const response = await fetch(`http://localhost:5000/api/user-details/${userID}`);

            const data = await response.json();
            if (response.ok) {
                setUser(data);
                localStorage.setItem("userDetails", JSON.stringify(data)); // Update local storage
            } else {
                console.error("Error fetching user details:", data.error);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };

    // Fetch user data periodically (every 5 seconds)
    useEffect(() => {
        const interval = setInterval(() => {
            if (user?.userID) {
                fetchUserDetails(user.userID);
            }
        }, 5000); // Adjust time as needed

        return () => clearInterval(interval);
    }, [user]);

    useEffect(() => {
        fetch("http://localhost:5000/api/shops")

            .then(res => res.json())
            .then(data => setShops(data))
            .catch(error => console.error("Error fetching shops:", error));
    }, []);

    const handleShopClick = (shopName) => {
        localStorage.setItem("shopName", shopName);
        navigate(`/dashboard/purchase/${shopName}`);
    };


    // 📝 Handle Report Generation
    const handleGenerateReport = async () => {
        if (!user?.userID) {
            alert("User not logged in!");
            return;
        }

        const month = prompt("Enter Month (MM):");
        const year = prompt("Enter Year (YYYY):");

        if (!month || !year) {
            alert("Please enter a valid month and year.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/report?userID=${user.userID}&month=${month}&year=${year}`);


            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            setReportData(data);
            setShowReport(true);
        } catch (error) {
            console.error("Error fetching report:", error);
            alert("Failed to fetch report. Please try again.");
        }
    };


    return (
        <div className="p-10">
            <h2 className="text-2xl font-bold text-indigo-800">Dashboard</h2>
            {user ? (
                <div>
                    <p className="text-2xl font-semibold text-indigo-500">Welcome, <span className="text-orange-400">{user.username}!</span></p>
                    <p className="text-2xl font-semibold text-indigo-500">Your Balance: <span className="text-orange-400">{user.coins} Rs.</span></p> {/* Dynamically updated */}
                </div>
            ) : (
                <p className="text-green-600">Loading...</p>
            )}

            <div className="mt-7">
                <h3 className="font-bold text-3xl text-indigo-800 mb-1">Shop List</h3>
                <ul className="mt-5">
                    {shops.map((shop) => (
                        <li className="mb-4 px-5" key={shop.shopName}>
                            <button className="block w-full outline p-3 rounded outline-indigo-800 text-indigo-800 text-3xl hover:bg-gray-100/70" onClick={() => handleShopClick(shop.shopName)}>
                                <span className="font-bold text-4xl">{shop.shopName}</span> <br /> <span className="font-semibold text-indigo-400">({shop.shopOwnerName})</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* <div className="space-x-10 mt-14"> */}
            <div className="grid">
                <Link to="/cart" className="grid">
                    <button className="bg-indigo-700 text-white p-3 rounded">Go to Cart 🛒</button>
                </Link>

                {/* 📌 Report Button */}
                <button className="bg-indigo-700 text-white p-3 rounded mt-5" onClick={handleGenerateReport}>
                    Generate Report 📊
                </button>
            </div>


            {/* Report Display */}
            {showReport && (
                <div style={{ marginTop: "20px" }}>
                    <h3>Report for Selected Month and Year</h3>
                    {reportData.length > 0 ? (
                        <table border="1">
                            <thead>
                                <tr>
                                    <th>Shop Name</th>
                                    <th>Product Name</th>
                                    <th>Quantity</th>
                                    <th>Price</th>
                                    <th>Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.map((order, index) => (
                                    <tr key={index}>
                                        <td>{order.shopName}</td>
                                        <td>{order.productName}</td>
                                        <td>{order.quantity}</td>
                                        <td>{order.totalAmount}</td>
                                        <td>{new Date(order.timestamp).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No orders found for this period.</p>
                    )}
                </div>
            )}

            <button
                onClick={() => {
                    localStorage.clear();
                    window.location.href = "/";
                }}
                className=" mt-10 font-semibold p-3 bg-red-700 text-white rounded-md w-32"
            >
                Logout
            </button>
        </div>
    );
};

export default Dashboard;
