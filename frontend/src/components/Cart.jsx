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
            setCart(JSON.parse(storedCart)); // Parse JSON to get array
        }
    }, []);

    // ✅ Remove item from cart
    const removeFromCart = (index) => {
        const updatedCart = cart.filter((_, i) => i !== index);
        setCart(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
    };

    // ✅ Handle buy
    const handleBuy = async () => {
        if (!user || cart.length === 0) {
            alert("User details or cart is empty!");
            return;
        }

        // ✅ Log the cart data before sending
        console.log("Cart before sending to API:", cart);
        console.log("Sending data to API:", {
            username: user?.username,
            shopName: localStorage.getItem("shopName"),
            cart,
        });
        

        try {
            const response = await fetch("http://localhost:5000/api/buy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: user.username,
                    shopName: localStorage.getItem("shopName"),
                    cart, // Send actual cart data
                }),
            });
        

            const data = await response.json();

            if (response.ok) {
                alert(`Purchase successful! 🎉 Your Order ID is: ${data.orderId}`);

                // ✅ Clear cart and shopName from localStorage
                localStorage.removeItem("cart");
                localStorage.removeItem("shopName");

                // ✅ Clear cart state
                setCart([]);

                // ✅ Redirect to dashboard after successful purchase
                navigate("/dashboard");
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
            <h2 className="text-2xl font-bold text-indigo-800">Shopping Cart</h2>
            {cart.length === 0 ? (
                <p className="text-2xl font-bold text-indigo-800">Your cart is <span className="text-red-600"> Empty.</span></p>
            ) : (
                <table className="table-auto mt-7">
                    <thead>
                        <tr className=''>
                            <th className=" text-orange-600 font-bold text-[20px]">Name</th>
                            <th className="pl-3 text-orange-600 font-bold text-[20px]">Quantity</th>
                            <th className="pl-3 text-orange-600 font-bold text-[20px]">Price</th>
                            <th className="pl-3 text-orange-600 font-bold text-[20px]">Total</th>
                            <th className="pl-3 text-orange-600 font-bold text-[20px]">Remove</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cart.map((item, index) => (
                            <tr key={index}>
                                <td className="pl-3 text-indigo-800 font-semibold">{item.productName}</td>
                                <td className="pl-10 text-indigo-800 font-semibold">{item.quantity}</td>
                                <td className="pl-5 text-indigo-800 font-semibold">Rs.{item.price}</td>
                                <td className="pl-5 text-indigo-800 font-semibold">Rs.{item.price * item.quantity}</td>
                                <td className="pl-5 text-indigo-800 font-semibold">
                                    <button className="p-1 rounded-sm outline-red-500 bg-red-500 text-white" onClick={() => removeFromCart(index)}>Remove</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <div className="space-x-9 mt-10">
                <Link to="/dashboard">
                    <button className="p-2 w-40 rounded bg-indigo-800 text-white outline-indigo-800">Back to Shopping</button>
                </Link>
                <button className="p-2 w-20 rounded bg-indigo-800 text-white outline-indigo-800" onClick={handleBuy}>Buy</button>
            </div>
        </div>
    );
};

export default Cart;
