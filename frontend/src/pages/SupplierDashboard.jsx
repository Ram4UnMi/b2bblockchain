// This component is for the Supplier.
// It allows the supplier to add products to the smart contract.
// All interactions here are ON-CHAIN.
import React, { useState } from 'react';
import { ethers } from 'ethers';
import ProductReservation from '../abi/ProductReservation.json';

// Replace with your contract address
const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

function SupplierDashboard() {
    const [productName, setProductName] = useState('');
    const [productPrice, setProductPrice] = useState('');
    const [productStock, setProductStock] = useState('');

    // ON-CHAIN: Function to add a product to the smart contract
    async function addProduct() {
        if (!productName || !productPrice || !productStock) return;

        if (typeof window.ethereum !== 'undefined') {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(contractAddress, ProductReservation.abi, signer);

            try {
                const formattedPrice = productPrice.replace(',', '.');
                const priceInWei = ethers.utils.parseUnits(formattedPrice, 'ether');
                const transaction = await contract.addProduct(productName, priceInWei, productStock);
                await transaction.wait();
                alert('Product added successfully!');
                setProductName('');
                setProductPrice('');
                setProductStock('');
            } catch (error) {
                console.error('Error adding product:', error);
                alert('Error adding product.');
            }
        } else {
            alert('MetaMask is not installed.');
        }
    }

    return (
        <div>
            <h2>Supplier Dashboard</h2>
            <p>Use this dashboard to add products to the blockchain.</p>
            <input
                type="text"
                placeholder="Product Name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
            />
            <input
                type="text"
                placeholder="Product Price (ETH)"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
            />
            <input
                type="number"
                placeholder="Product Stock"
                value={productStock}
                onChange={(e) => setProductStock(e.target.value)}
            />
            <button onClick={addProduct}>Add Product (On-Chain)</button>
        </div>
    );
}

export default SupplierDashboard;
