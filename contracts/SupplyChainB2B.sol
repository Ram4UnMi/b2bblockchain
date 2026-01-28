// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SupplyChainB2B {
    event OrderPaid(uint256 indexed orderId, address indexed reseller, address indexed supplier, uint256 amount, uint256 timestamp);

    // Reseller membayar order ke Supplier
    // orderId: ID dari database backend
    // _supplier: Address wallet supplier
    function payOrder(uint256 orderId, address payable _supplier) external payable {
        require(msg.value > 0, "Amount must be greater than 0");
        require(_supplier != address(0), "Invalid supplier address");

        // Transfer dana langsung ke supplier
        (bool sent, ) = _supplier.call{value: msg.value}("");
        require(sent, "Failed to send Ether");

        emit OrderPaid(orderId, msg.sender, _supplier, msg.value, block.timestamp);
    }
}