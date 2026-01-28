const { ethers } = require('ethers');
const ProductReservationABI = require('../../frontend/src/abi/ProductReservation.json').abi;

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, ProductReservationABI, provider);

/**
 * Fetches all products directly from the smart contract.
 */
const getOnChainProducts = async () => {
    try {
        const productCount = await contract.productCount();
        const products = [];
        for (let i = 1; i <= productCount; i++) {
            const p = await contract.products(i);
            // The contract returns a struct-like array, convert it to an object
            if (p.name) { // Only add if product exists
                products.push({
                    id: p.id.toString(),
                    name: p.name,
                    price: ethers.formatEther(p.price),
                    stock: p.stock.toString(),
                });
            }
        }
        return products;
    } catch (error) {
        console.error('Error fetching on-chain products:', error);
        throw new Error('Could not fetch products from the blockchain.');
    }
};

module.exports = {
    getOnChainProducts
};
