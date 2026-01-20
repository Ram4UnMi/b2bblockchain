// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title B2BProductReservation
 * @dev A smart contract for a B2B product reservation system.
 * Allows a single supplier to add products and resellers to order them.
 */
contract B2BProductReservation {
    address public owner;
    uint256 public productCount;

    struct Product {
        uint256 id;
        string name;
        uint256 price;
        uint256 stock;
    }

    mapping(uint256 => Product) public products;

    event ProductAdded(uint256 id, string name, uint256 price, uint256 stock);
    event ProductOrdered(uint256 id, uint256 quantity, address indexed reseller);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function.");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Allows the owner (supplier) to add a new product.
     * @param _name The name of the product.
     * @param _price The price of the product in wei.
     * @param _stock The available stock of the product.
     */
    function addProduct(string memory _name, uint256 _price, uint256 _stock) public onlyOwner {
        productCount++;
        products[productCount] = Product(productCount, _name, _price, _stock);
        emit ProductAdded(productCount, _name, _price, _stock);
    }

    /**
     * @dev Allows a reseller to order a product.
     * @param _id The ID of the product to order.
     * @param _quantity The quantity of the product to order.
     */
    function orderProduct(uint256 _id, uint256 _quantity) public payable {
        require(_id > 0 && _id <= productCount, "Product does not exist.");
        Product storage product = products[_id];
        require(product.stock >= _quantity, "Not enough stock available.");
        require(msg.value == product.price * _quantity, "Incorrect payment amount.");

        product.stock -= _quantity;

        // Transfer payment to the supplier
        (bool success, ) = owner.call{value: msg.value}("");
        require(success, "Payment transfer failed.");

        emit ProductOrdered(_id, _quantity, msg.sender);
    }
}
