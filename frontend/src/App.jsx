import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';

// Import the ABI from the new location
import ProductReservationABI from './abi/ProductReservation.json';

// The address of the deployed contract.
// This is the value you got from the deployment script.
const contractAddress = '0x3Bc9220E0778E2d12F52804210500753dd5EE8D4';

function App() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [isSupplier, setIsSupplier] = useState(false);
  const [products, setProducts] = useState([]);
  
  // Form state for adding a new product
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductStock, setNewProductStock] = useState('');

  // State for ordering products
  const [orderQuantities, setOrderQuantities] = useState({});

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        setAccount(account);

        const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(ethersProvider);

        const signer = ethersProvider.getSigner();
        const contractInstance = new ethers.Contract(contractAddress, ProductReservationABI.abi, signer);
        setContract(contractInstance);

        // Check if the connected account is the supplier
        const supplierAddress = await contractInstance.supplier();
        setIsSupplier(account.toLowerCase() === supplierAddress.toLowerCase());

      } catch (error) {
        console.error("Wallet connection failed:", error);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  const fetchProducts = async () => {
    if (contract) {
      try {
        const productCount = await contract.productCount();
        const productsArray = [];
        for (let i = 1; i <= productCount; i++) {
          const product = await contract.products(i);
          productsArray.push({
            id: i,
            name: product.name,
            price: product.price,
            stock: product.stock.toNumber(),
          });
        }
        setProducts(productsArray);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (contract && isSupplier) {
      try {
        // Convert price from Ether to Wei for the transaction
        const priceInWei = ethers.utils.parseEther(newProductPrice);
        const tx = await contract.addProduct(newProductName, priceInWei, newProductStock);
        await tx.wait();
        
        // Reset form and refetch products
        setNewProductName('');
        setNewProductPrice('');
        setNewProductStock('');
        fetchProducts(); 
        alert('Product added successfully!');
      } catch (error) {
        console.error("Failed to add product:", error);
        alert('Failed to add product. Check console for details.');
      }
    }
  };

  const handleOrderProduct = async (productId, quantity) => {
    if (contract && quantity > 0) {
      try {
        const product = products.find(p => p.id === productId);
        if (!product) {
          alert('Product not found!');
          return;
        }

        const totalPrice = product.price.mul(quantity);
        
        const tx = await contract.orderProduct(productId, quantity, { value: totalPrice });
        await tx.wait();
        
        fetchProducts(); // Refetch products to update stock
        alert('Order placed successfully!');
      } catch (error) {
        console.error("Failed to order product:", error);
        alert('Order failed. Check console for error (e.g., insufficient funds or stock).');
      }
    }
  };

  // Fetch products when the contract instance is ready
  useEffect(() => {
    if(contract) {
      fetchProducts();

      // Listen for ProductAdded events
      const onProductAdded = (productId, name, price, stock) => {
          console.log("Event: ProductAdded");
          fetchProducts(); // Refetch all products on event
      };

      // Listen for ProductOrdered events
      const onProductOrdered = (productId, reseller, quantity) => {
          console.log("Event: ProductOrdered");
          fetchProducts(); // Refetch all products on event
      };
      
      contract.on("ProductAdded", onProductAdded);
      contract.on("ProductOrdered", onProductOrdered);

      // Cleanup listeners on component unmount
      return () => {
          contract.off("ProductAdded", onProductAdded);
          contract.off("ProductOrdered", onProductOrdered);
      };
    }
  }, [contract]);


  return (
    <div className="App">
      <header className="App-header">
        <h1>B2B Product Reservation System</h1>
        {account ? (
          <div>
            <p>Connected Account: <span className="account-address">{account}</span></p>
            <p>{isSupplier ? <span className="role-supplier">Role: Supplier</span> : <span className="role-reseller">Role: Reseller</span>}</p>
          </div>
        ) : (
          <button onClick={connectWallet}>Connect Wallet</button>
        )}
      </header>

      <main>
        {isSupplier && (
          <div className="card supplier-card">
            <h2>Add New Product</h2>
            <form onSubmit={handleAddProduct}>
              <input
                type="text"
                placeholder="Product Name"
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                required
              />
              <input
                type="number"
                step="0.0001"
                placeholder="Price (ETH)"
                value={newProductPrice}
                onChange={(e) => setNewProductPrice(e.target.value)}
                required
              />
              <input
                type="number"
                placeholder="Stock"
                value={newProductStock}
                onChange={(e) => setNewProductStock(e.target.value)}
                required
              />
              <button type="submit">Add Product</button>
            </form>
          </div>
        )}

        <div className="products-list">
          <h2>Available Products</h2>
          {products.length > 0 ? (
            products.map((product) => (
              <div key={product.id} className="card product-card">
                <h3>{product.name}</h3>
                <p>Price: {ethers.utils.formatEther(product.price)} ETH</p>
                <p>Stock: {product.stock}</p>
                {!isSupplier && (
                  <div className="order-section">
                    <input 
                      type="number" 
                      min="1"
                      placeholder="Quantity"
                      onChange={(e) => setOrderQuantities({...orderQuantities, [product.id]: e.target.value})}
                    />
                    <button onClick={() => handleOrderProduct(product.id, orderQuantities[product.id] || 0)}>
                      Order
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No products available yet. {isSupplier ? "Please add one." : "Check back later."}</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;