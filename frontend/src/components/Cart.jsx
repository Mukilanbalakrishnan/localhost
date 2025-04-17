import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Cart = () => {
    const [cart, setCart] = useState([]);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    // ✅ Fetch user details
    useEffect(() => {
        const storedUser = localStorage.getItem("userDetails");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    // ✅ Fetch cart items
    useEffect(() => {
        const storedCart = localStorage.getItem("cart");
        if (storedCart) {
            const cartData = JSON.parse(storedCart);
            console.log("Loaded cart from localStorage:", cartData);
            setCart(cartData); // Parse JSON to get array
        }
    }, []);

    // ✅ Remove item from cart
    const removeFromCart = (product) => {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
    
        // Remove the item that matches both _id and shopName
        const updatedCart = cart.filter(
            (item) => !(item._id === product._id && item.shopName === product.shopName)
        );
    
        // Update the cart in localStorage
        localStorage.setItem("cart", JSON.stringify(updatedCart));
    
        // Update the cart state
        setCart(updatedCart);
    };

    // 🛒 Group cart by shopName
    const groupedCart = cart.reduce((groups, item) => {
        if (!groups[item.shopName]) {
            groups[item.shopName] = [];
        }
        groups[item.shopName].push(item);
        return groups;
    }, {});

    // ✅ Handle buy
    const handleBuy = async () => {
        if (!user || cart.length === 0) {
            alert("User details or cart is empty!");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/buy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: user.username,
                    cart,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert(`Purchase successful! 🎉 Your Order ID is: ${data.orderId}`);

                localStorage.removeItem("cart");
                setCart([]);

                navigate("/dashboard", {
                    state: {
                        orderDetails: {
                            orderId: data.orderId,
                            cart: cart,
                            status: "Pending",
                        },
                    },
                });
            } else {
                alert(data.message || "Purchase failed");
            }
        } catch (error) {
            console.error("Error purchasing product:", error);
            alert("An error occurred. Please try again.");
        }
    };


    return (
        <div className="p-10">
            <h2 className="text-3xl font-bold text-indigo-800 mb-6">🛒 Your Shopping Cart</h2>

            {cart.length === 0 ? (
                <p className="text-xl font-semibold text-red-600">Your cart is empty.</p>
            ) : (
                Object.entries(groupedCart).map(([shopName, items]) => (
                    <div key={shopName} className="mb-10 border border-gray-300 rounded p-4">
                      <table className="table-auto mt-7">
                        <thead>
                          <tr>
                            <th className="text-orange-600 font-bold text-[20px]">Shop Name</th>
                            <th className="pl-3 text-orange-600 font-bold text-[20px]">Name</th>
                            <th className="pl-3 text-orange-600 font-bold text-[20px]">Quantity</th>
                            <th className="pl-3 text-orange-600 font-bold text-[20px]">Price</th>
                            <th className="pl-3 text-orange-600 font-bold text-[20px]">Total</th>
                            <th className="pl-3 text-orange-600 font-bold text-[20px]">Remove</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item, index) => ( // ✅ Only render this shop's items
                            <tr key={index}>
                              <td className="pl-3 text-indigo-800 font-semibold">{item.shopName}</td>
                              <td className="pl-3 text-indigo-800 font-semibold">{item.productName}</td>
                              <td className="pl-10 text-indigo-800 font-semibold">{item.quantity}</td>
                              <td className="pl-5 text-indigo-800 font-semibold">Rs.{item.price}</td>
                              <td className="pl-5 text-indigo-800 font-semibold">Rs.{item.price * item.quantity}</td>
                              <td className="pl-5 text-indigo-800 font-semibold">
                                <button
                                  className="p-1 rounded-sm outline-red-500 bg-red-500 text-white"
                                  onClick={() => removeFromCart(item)}
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      
                  


</table>

                    </div>
                ))
            )}

            <div className="space-x-6 mt-6">
                <Link to="/dashboard">
                    <button className="px-6 py-2 bg-gray-700 text-white rounded hover:bg-gray-800">
                        Back to Shopping
                    </button>
                </Link>
                {cart.length > 0 && (
                    <button
                        onClick={handleBuy}
                        className="px-6 py-2 bg-indigo-800 text-white rounded hover:bg-indigo-900"
                    >
                        Buy
                    </button>
                )}
            </div>
        </div>
    );
};

export default Cart;
