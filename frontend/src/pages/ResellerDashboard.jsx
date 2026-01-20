// This component is for the Reseller.
// It has two main sections:
// 1. ON-CHAIN: Viewing and ordering products from the supplier's smart contract.
// 2. OFF-CHAIN: Managing the reseller's own product catalog via a backend API.
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import ProductReservation from '../abi/ProductReservation.json';

// Replace with your contract address
const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

function ResellerDashboard() {
    const [supplierProducts, setSupplierProducts] = useState([]);
    const [resellerProducts, setResellerProducts] = useState([]);

    useEffect(() => {
        fetchSupplierProducts();
        fetchResellerProducts();
    }, []);

    // ON-CHAIN: Fetch products from the smart contract
    async function fetchSupplierProducts() {
        if (typeof window.ethereum !== 'undefined') {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const contract = new ethers.Contract(contractAddress, ProductReservation.abi, provider);

            try {
                const productCount = await contract.productCount();
                const products = [];
                for (let i = 1; i <= productCount; i++) {
                    const product = await contract.products(i);
                    products.push(product);
                }
                setSupplierProducts(products);
            } catch (error) {
                console.error('Error fetching supplier products:', error);
            }
        }
    }

    // OFF-CHAIN: Fetch reseller's own products from the backend API
    async function fetchResellerProducts() {
        try {
            const response = await fetch('http://localhost:5000/api/reseller/products');
            const data = await response.json();
            setResellerProducts(data);
        } catch (error) {
            console.error('Error fetching reseller products:', error);
        }
    }

    // ON-CHAIN: Order a product from the supplier
    async function orderProduct(productId, quantity, price) {
        if (typeof window.ethereum !== 'undefined') {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(contractAddress, ProductReservation.abi, signer);

            try {
                const totalPrice = ethers.BigNumber.from(price).mul(quantity);
                const transaction = await contract.orderProduct(productId, quantity, { value: totalPrice });
                await transaction.wait();
                alert('Product ordered successfully!');
                fetchSupplierProducts(); // Refresh supplier products
            } catch (error) {
                console.error('Error ordering product:', error);
                alert('Error ordering product.');
            }
        } else {
            alert('MetaMask is not installed.');
        }
    }

    return (
        <div>
            <h2>Reseller Dashboard</h2>

            <h3>Supplier Products (On-Chain)</h3>
            <p>Products available from the supplier on the blockchain.</p>
            <div>
                {supplierProducts.map((product) => (
                    <div key={product.id.toString()}>
                        <p>{product.name} - Price: {ethers.utils.formatEther(product.price)} ETH - Stock: {product.stock.toString()}</p>
                        <button onClick={() => orderProduct(product.id, 1, product.price)}>Order 1 (On-Chain)</button>
                    </div>
                ))}
            </div>

            <hr />

            <h3>My Catalog (Off-Chain)</h3>
            <p>Manage your own products for sale to customers (no blockchain interaction).</p>
            {/* Add CRUD UI for reseller's own products here */}
            <div>
                {resellerProducts.map((product) => (
                    <div key={product.id}>
                        <p>{product.name} - Price: ${product.price} - Quantity: {product.quantity}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ResellerDashboard;
