// src/pages/ShopList.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const ShopList = () => {
    const [shops, setShops] = useState([]);

    useEffect(() => {
        const fetchShops = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/shops");
                const data = await res.json();
                setShops(data);
            } catch (err) {
                console.error("Error fetching shops", err);
            }
        };

        fetchShops();
    }, []);

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-indigo-800 mb-4">All Shops</h2>
            <ul className="space-y-2">
            {shops.map((shop) => (
    <li key={shop.shopName}>
        <Link to={`/shop-details/${encodeURIComponent(shop.shopName)}`}>
            <button className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600">
                {shop.shopName}
            </button>
        </Link>
    </li>
))}
            </ul>
            
        </div>
    );
};

export default ShopList;
