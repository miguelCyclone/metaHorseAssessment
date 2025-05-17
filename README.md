# MetaHorse NFT Project

## Overview

MetaHorse is a full-stack demonstration DApp for minting NFTs, featuring a robust React frontend and a secure, fully-tested smart contract deployed on the Polygon Amoy testnet.
The project fulfills all requirements of the MetaHorse technical assessment, including wallet integration, real-time form validation, mint transaction UX, and comprehensive error handling both on-chain and in the user interface.

---

## Project Structure

```
/
├── frontEnd        # React app for user interactions and MetaMask integration
└── NFT             # Hardhat project for the MetaHorseNFT smart contract and tests
```

### **1. `frontEnd/`**

* Complete React-based dApp for interacting with MetaHorseNFT
* Features:

  * Connect MetaMask, automatic network detection, and one-click switch to Polygon Amoy
  * Live-validated NFT minting form (unique title, URI, Token ID)
  * Real-time error feedback and full transaction status, with direct Polygon Amoy block explorer links
  * Screenshots and user instructions included

See `frontEnd/README.md` for usage instructions and flow screenshots.

---

### **2. `NFT/`**

* Hardhat project for the MetaHorseNFT ERC721 contract (OpenZeppelin base)
* Custom logic ensures each title and token ID are unique (enforced on-chain)
* Full suite of unit tests for contract correctness and error conditions
* Easily extensible for further NFT features

See `NFT/README.md` for contract functions, test coverage, and deployment instructions.

---

## How This Project Meets the Assessment

* **Frontend** provides all required user flows:

  * Wallet connect, network switching, form validation, and mint feedback
* **Smart Contract** is secure, upgradable, and thoroughly tested
* **User Experience**: Disabled buttons and live feedback ensure users cannot submit invalid or costly transactions by mistake
* **Error Handling**: Both on-chain (reverts, custom errors) and in-app (UI feedback, validation)
* **Documentation**: Each subproject has its own focused README; root README helps navigate as a reviewer or engineer

---

## Quick Start

To run locally, see setup steps in each subfolder’s README:

* **Front end:**
  `cd frontEnd && npm install && npm start`
* **Smart contract:**
  `cd NFT && npm install && npx hardhat test`

---

## Key Notes

* **Polygon Amoy testnet** is used for all smart contract deployment and minting
* All images, code samples, and user flows were built and tested as per the assessment guidelines
* Demo transaction and UI screenshots included in the frontend documentation