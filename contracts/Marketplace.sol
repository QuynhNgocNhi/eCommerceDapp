pragma solidity >=0.4.21 <0.7.0;

import "./SafeMath.sol";

/// @title A simple decentralized marketplace
/// @author Gerwin Fricke
/// @notice You can use this contract for marketplace simulations including commission

contract Marketplace {

  /// @notice The marketplace owner has a payable address to take commissions
  /// @dev The contract has an isActive boolean for the circuit breaker function
  address payable owner;
  bool isActive = true;
  uint productCount;
  mapping (uint => Product) public products;

  struct Product {
    uint id;
    string name;
    uint price;
    State state;
    address payable seller;
    address payable buyer;
  }

  enum State {
    ForSale,
    Sold
  }

  event LogAddressSeller(address);
  event LogAddressBuyer(address);
  event LogForSale(uint id);
  event LogSold(uint id);

  modifier onlyOwner() {require(owner == msg.sender); _;}
  modifier contractIsActive() { require(isActive == true); _;}
  modifier paidEnough(uint _price) { require(msg.value >= _price); _;}
  modifier checkValue(uint _id) {
    _;
    uint _price = products[_id].price;
    uint amountToRefund = SafeMath.sub(msg.value, _price);
    products[_id].buyer.transfer(amountToRefund);}
  modifier forSale(uint _id) { require(products[_id].state == State.ForSale && products[_id].buyer == address(0)); _;}
  modifier sold(uint _id) { require(products[_id].state == State.Sold); _;}

  constructor() public {
    owner = msg.sender;
    productCount = 0;
  }

  /// @dev Function to pause contract restricted to marketplace owner
  function toggleCircuitBreaker() external onlyOwner() {
      isActive = !isActive;
  }

  /// @dev Function to destroy contract restricted to marketplace owner
  function kill() external onlyOwner() {
      selfdestruct(owner);
  }

  /// @param  _name The name of the product to be added
  /// @param  _price The price of the product to be added
  /// @dev Restrict UI price inputs to integers to avoid errors
  function addProduct(string memory _name, uint _price) contractIsActive() public returns(bool) {
    emit LogForSale(productCount);
    products[productCount] = Product({name: _name, id: productCount, price: _price, state: State.ForSale, seller: msg.sender, buyer: address(0)});
    productCount += 1;
    return true;
  }

  /// @dev Library is imported and used to guard against under-/overflow
  using SafeMath for uint;

  /// @notice Deducts 5% commission after buyer's purchase and makes corresponding transfers
  function buyProduct(uint id)
    public payable forSale(id) paidEnough(products[id].price) checkValue(id) contractIsActive()
  {
    products[id].buyer = msg.sender;
    uint commission = SafeMath.div(products[id].price, 20);
    uint shareSeller = SafeMath.sub(products[id].price, commission);
    products[id].state = State.Sold;
    products[id].seller.transfer(shareSeller);
    owner.transfer(commission);

    emit LogSold(id);
    emit LogAddressBuyer(products[id].buyer);
    emit LogAddressSeller(products[id].seller);
  }

  /// @dev Getter function for UI and/or tests
  function getCount() public view returns (uint id) {
    return productCount;
  }

  /// @dev Getter function for UI and/or tests
  function getContractStatus() public view returns (bool) {
    return isActive;
  }

  /// @dev Getter function for UI and/or tests
  function fetchProduct(uint _id) public view returns (string memory name, uint id, uint price, uint state, address seller, address buyer) {
    name = products[_id].name;
    id = products[_id].id;
    price = products[_id].price;
    state = uint(products[_id].state);
    seller = products[_id].seller;
    buyer = products[_id].buyer;
    return (name, id, price, state, seller, buyer);
  }
}
