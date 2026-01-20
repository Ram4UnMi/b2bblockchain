// This component is for the End Customer.
// It displays products from a reseller's off-chain catalog.
// All interactions here are OFF-CHAIN. There is no wallet interaction.
import React, { useState, useEffect } from 'react';

function CustomerStorefront() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetchProducts();
    }, []);

    // OFF-CHAIN: Fetch products from the backend API
    async function fetchProducts() {
        // In a real app, you'd fetch products for a specific reseller
        try {
            const response = await fetch('http://localhost:5000/api/reseller/products');
            const data = await response.json();
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    }

    // OFF-CHAIN: Simulate a purchase by calling the backend API
    function buyProduct(productId) {
        alert(`Simulating off-chain purchase for product ID: ${productId}`);
        // In a real application, you would make a POST request to the backend, e.g.:
        // fetch('http://localhost:5000/api/customer/orders', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ productId, quantity: 1, customerName: 'John Doe' })
        // });
    }

    return (
        <div>
            <h2>Customer Storefront</h2>
            <p>Products sold by our resellers. All transactions are off-chain.</p>
            <div>
                {products.map((product) => (
                    <div key={product.id}>
                        <p>{product.name} - ${product.price}</p>
                        <button onClick={() => buyProduct(product.id)}>Buy (Off-Chain)</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default CustomerStorefront;
