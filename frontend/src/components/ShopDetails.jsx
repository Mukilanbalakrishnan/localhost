// src/pages/ShopDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const ShopDetails = () => {
    const { shopName } = useParams();
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/shop-details?shopName=${shopName}`);
                const data = await response.json();
                setProducts(data);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };

        fetchProducts();
    }, [shopName]);

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4 text-indigo-800">Products in <span className="text-orange-600">{shopName}</span></h2>
            
            {products.length === 0 ? (
                <p>No products available.</p>
            ) : (
                <table className="w-full border border-gray-300 rounded-md overflow-hidden">
                    <thead className="bg-gray-200 text-left">
                        <tr>
                            <th className="p-3 border">Product Name</th>
                            <th className="p-3 border">Quantity</th>
                            <th className="p-3 border">Price</th>
                            <th className="p-3 border">Category</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product, index) => (
                            <tr key={index} className="text-indigo-800 font-semibold border-t">
                                <td className="p-3 border">{product.productName}</td>
                                <td className="p-3 border">{product.quantity}</td>
                                <td className="p-3 border">₹{product.price}</td>
                                <td className="p-3 border">{product.category}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <div className="mt-5">
                <Link to="/shoplist">
                    <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition">← Back to Shops</button>
                </Link>
            </div>
        </div>
    );
};

export default ShopDetails;
