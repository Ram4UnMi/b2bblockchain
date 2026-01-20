# B2B Product Reservation System - Architectural Overview

This document outlines the architecture of the B2B Product Reservation System, emphasizing the separation between on-chain and off-chain components.

## 1. Smart Contract (On-Chain)

The single `ProductReservation.sol` smart contract is the trust layer of the system.

- **File:** `contracts/ProductReservation.sol`
- **Purpose:** To manage the authoritative record of products offered by the supplier and to handle the trust-critical transfer of funds from reseller to supplier.
- **Key Features:**
    - **Supplier-only product management:** Only the contract owner (the supplier) can add products.
    - **Atomic orders:** The `orderProduct` function ensures that a reseller's payment is only transferred if the product has sufficient stock. The stock is updated in the same transaction.
    - **Events:** The contract emits events (`ProductAdded`, `ProductOrdered`) to allow off-chain systems to easily listen for state changes without constantly querying the contract.
    - **No unnecessary complexity:** The contract uses only native ETH and avoids complex design patterns, making it easy to understand and audit for academic purposes.

## 2. Backend (Off-Chain)

The backend provides all application logic that does not need to be on the blockchain.

- **Directory:** `backend/`
- **Technology:** Node.js with Express and Mongoose.
- **Purpose:** To manage data and operations that are not trust-critical, such as reseller catalogs and customer orders.
- **Key Features:**
    - **Reseller Catalog Management:** Provides CRUD APIs for resellers to manage their own product listings that they sell to end customers. This data is stored in a traditional database (MongoDB).
    - **Customer Order Processing:** Handles orders from customers to resellers. These are standard e-commerce transactions and do not involve the blockchain.
    - **No Private Keys:** The backend *never* holds private keys and does not sign any blockchain transactions. It is completely separate from the on-chain fund management.

## 3. Database Schema (Off-Chain)

The database stores all off-chain data.

- **Models:** `backend/models/`
- **`ResellerProduct`:** Stores information about the products a reseller is selling to their customers. This is distinct from the on-chain products they purchase from the supplier.
- **`CustomerOrder`:** Stores records of purchases made by end customers from resellers.

## 4. Frontend (Off-Chain with On-Chain Interaction)

The frontend is the user interface for all roles, carefully managing the boundary between on-chain and off-chain actions.

- **Directory:** `frontend/`
- **Technology:** React with `ethers.js`.
- **Key Features:**
    - **Role-based Dashboards:**
        - **Supplier Dashboard:** Interacts directly with the smart contract to add products. Requires MetaMask.
        - **Reseller Dashboard:**
            - **On-Chain Interaction:** Reads product data from the smart contract and allows the reseller to order products (sending ETH), which requires MetaMask.
            - **Off-Chain Interaction:** Interacts with the backend API to manage the reseller's own catalog for their customers.
        - **Customer Storefront:** Interacts *only* with the backend API. It has no blockchain awareness and requires no wallet, providing a standard web e-commerce experience.
    - **Clear Separation:** The UI makes it clear which actions are on-chain (and will trigger a MetaMask transaction) and which are off-chain.

## Summary of Separation

| Component           | Responsibility                                                                    | Technology                               | Interaction           |
|---------------------|-----------------------------------------------------------------------------------|------------------------------------------|-----------------------|
| **Smart Contract**  | Supplier products, stock, and Reseller-to-Supplier payments.                      | Solidity                                 | On-Chain              |
| **Backend API**     | Reseller's own product catalog, customer orders, all non-blockchain business logic. | Node.js, Express, MongoDB                | Off-Chain             |
| **Frontend**        | UI for all roles. Connects to the smart contract for on-chain actions (via          | React, ethers.js                         | Hybrid                |
|                     | MetaMask) and to the backend for off-chain actions.                               |                                          |                       |

This hybrid architecture correctly uses the blockchain for its core strengths (trust, decentralization, asset transfer) while leveraging traditional, scalable off-chain systems for everything else. This aligns with the project's academic goal of demonstrating a clear and correct architectural separation.
