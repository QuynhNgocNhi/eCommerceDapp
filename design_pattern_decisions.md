# Design Pattern Best Practices
The following patterns were taken into account in the design of the Marketplace smart contract.

## Fail Early and Fail Loud
Condition checks are used early in function bodies to throw an exception when requirements are not met. This reduces unnecessary code execution when an exception is thrown.

## Access Control
Administrative functions are restricted to a designated user, the owner. This is done through the `onlyOwner` modifier which is added to the two functions below.

## Circuit Breaker
Should an unknown bug lead to problems with the contract, the owner will be able to freeze the `addProduct` and `buyProduct` functions. This ensures that no more transactions go through while the bug is being examined and fixed.
This is accomplished with the `toggleCircuitBreaker` function which updates the boolean state `isActive` of the contract. This in turn causes the `contractIsActive` modifier to throw an exception for said functions.

## Kill Switch
The owner can remove the contract from the blockchain with the `kill` function if problems persist or if alpha/beta phases have ended.
