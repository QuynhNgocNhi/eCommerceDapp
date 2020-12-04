# Decentralized Marketplace on Ethereum

This project aims to simulate basic functionalities of a decentralized marketplace application powered by the Ethereum blockchain. 
The DApp focuses on initial Seller and Buyer actions as well as the transfer of funds between them. Admin functions are included for demonstrative purposes, which get in the way of pure decentralization.

## Technology

- Smart contracts for business logic (adding products, buying products, transfer of funds) written in Solidity
- Front-end developed using a reactive UI framework with the integration of ReactJS
- Truffle development framework for Ethereum

## Implementation

### Prerequisites

- Node v10.19.0
- Solidity v0.6.12 (solc-js)
- Truffle v5.1.46

### Setup
- Clone the repo using `git clone git@github.com:gerwinf/simple-marketplace.git`
- Have a local blockchain running on port 7545 (e.g. using Ganache)
- From the project folder, deploy contracts with `truffle migrate --reset`

### Uint Tests
- You can run the tests by running truffle test from the Marketplace directory
- Note that there are tests both in JavaScript and Solidity

### To run the client:
- Navigate to the client folder with `cd client`
- Run `npm install` and then `npm run start`
- Your browser should open and run the project (otherwise go to localhost:3000)

### Contract interaction on a local blockchain
- Ensure your browser has a plugin (e.g. Metamask) that allows you to interact with the Ethereum blockchain
- Ensure you have a local blockchain running (e.g. on Ganache)
- Select Localhost:8545 or Custom RPC depending on which port your Ganache blockchain is running on
- Interact with the web interface

### Contract interaction on Görli Testnet
- Ensure your browser has a plugin (e.g. Metamask) that allows you to interact with the Ethereum blockchain
- Select Görli Test Network and choose a Metamask account that has some testnet ether. You can obtain some Görli testnet ether via this faucet: https://faucet.goerli.mudit.blog/
- Interact with the web interface
