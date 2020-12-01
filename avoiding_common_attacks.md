## Security Best Practices
The following preventative techniques were implemented to ensure that the contracts are not susceptible to common attacks.

## Reentrancy Prevention
It was ensured that logic that changes state variables happens before ether is sent out of the contract. Specifically, within the `buyProduct` function, the state of the enum (product) state is updated to `sold` before the seller receives the money.
Moreover, the built-in `transfer` function is used, which only sends 2300 gas and thus isn't enough for the destination address/contract to reenter.

## Arithmetic Under-/Overflow Prevention
Standard math operators were replaced with corresponding functions from OpenZeppelin's `SafeMath` library. This was required to guard against under-/overflow vulnerabilities. Particularly, in calculating the *seller's share* and the *owner's commission*.

## Denial of Service (DoS) Prevention
Several modifiers were implemented to ensure that functions throw an exception or revert. Thus the DoS attack surface is reduced. A few examples are `onlyOwner`, `paidEnough` and `forSale`.
