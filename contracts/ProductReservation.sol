// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

/**
 * @title ProductReservation
 * @dev A simple B2B product reservation smart contract for an academic project.
 * The deployer of the contract is the designated Supplier.
 * Resellers can order products by sending the correct amount of ETH.
 */
contract ProductReservation {
    // --- State Variables ---

    address public immutable supplier;
    uint256 public productCount;

    struct Product {
        string name;
        uint256 price; // Price in wei
        uint256 stock;
    }

    mapping(uint256 => Product) public products;

    // --- Events ---

    event ProductAdded(
        uint256 indexed productId,
        string name,
        uint256 price,
        uint256 stock
    );

    event ProductOrdered(
        uint256 indexed productId,
        address indexed reseller,
        uint256 quantity
    );
    
    event FundsWithdrawn(
        address indexed to,
        uint256 amount
    );

    // --- Modifiers ---

    modifier onlySupplier() {
        require(msg.sender == supplier, "Only the supplier can call this function.");
        _;
    }

    // --- Functions ---

    /**
     * @dev Sets the contract deployer as the supplier.
     */
    constructor() {
        supplier = msg.sender;
    }

    /**
     * @dev Allows the supplier to add a new product.
     * @param _name The name of the product.
     * @param _price The price of the product in wei.
     * @param _stock The available stock quantity.
     */
    function addProduct(string memory _name, uint256 _price, uint256 _stock) public onlySupplier {
        require(_price > 0, "Price must be greater than zero.");
        require(_stock > 0, "Stock must be greater than zero.");

        productCount++;
        products[productCount] = Product(_name, _price, _stock);

        emit ProductAdded(productCount, _name, _price, _stock);
    }

    /**
     * @dev Allows a reseller to order one or more units of a product by its ID.
     * The reseller must send the exact total price in ETH (wei) for the quantity ordered.
     * @param _productId The ID of the product to order.
     * @param _quantity The number of units to order.
     */
    function orderProduct(uint256 _productId, uint256 _quantity) public payable {
        require(_productId > 0 && _productId <= productCount, "Product does not exist.");
        require(_quantity > 0, "Quantity must be greater than zero.");

        Product storage orderedProduct = products[_productId];

        require(orderedProduct.stock >= _quantity, "Not enough stock available.");
        
        uint256 totalPrice = orderedProduct.price * _quantity;
        require(msg.value == totalPrice, "Incorrect ETH amount sent for the given quantity.");

        orderedProduct.stock -= _quantity;

        emit ProductOrdered(_productId, msg.sender, _quantity);
    }
    
    /**
     * @dev Allows the supplier to withdraw the entire contract balance.
     */
    function withdraw() public onlySupplier {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw.");

        (bool success, ) = supplier.call{value: balance}("");
        require(success, "Failed to send Ether");
        
        emit FundsWithdrawn(supplier, balance);
    }

    /**
     * @dev A helper function for the supplier to check the contract's balance.
     */
    function getBalance() public view onlySupplier returns (uint256) {
        return address(this).balance;
    }
}
