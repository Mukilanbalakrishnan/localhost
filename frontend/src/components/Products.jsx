import React, { useState, useEffect } from "react";

const Products = ({ shopName }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!shopName) return;

    const fetchProducts = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/products/${shopName}`);

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [shopName]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-3">Products for {shopName}</h2>

      {loading && <p>Loading products...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      <ul className="space-y-3">
        {products.length > 0 ? (
          products.map((product) => (
            <li key={product._id} className="border p-3 rounded-lg shadow-sm">
              <p><strong>Name:</strong> {product.productName}</p>
              <p><strong>Price:</strong> ${product.price}</p>
              <p><strong>Quantity:</strong> {product.quantity}</p>
            </li>
          ))
        ) : (
          !loading && <p>No products found.</p>
        )}
      </ul>
    </div>
  );
};

export default Products;
