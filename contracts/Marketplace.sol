pragma solidity >=0.4.21 <0.7.0;

contract Marketplace {

  address payable owner;
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

  modifier paidEnough(uint _price) { require(msg.value >= _price); _;}
  modifier checkValue(uint _id) {
    _;
    uint _price = products[_id].price;
    uint amountToRefund = msg.value - _price;
    products[_id].buyer.transfer(amountToRefund);
  }


  modifier forSale(uint _id) { require(products[_id].state == State.ForSale && products[_id].buyer == address(0)); _;}
  modifier sold(uint _id) { require(products[_id].state == State.Sold); _;}

  constructor() public {
    owner = msg.sender;
    productCount = 0;
  }

  function getCount() public view returns (uint id) {
    return productCount;
  }

  function addProduct(string memory _name, uint _price) public returns(bool){
    emit LogForSale(productCount);
    products[productCount] = Product({name: _name, id: productCount, price: _price, state: State.ForSale, seller: msg.sender, buyer: address(0)});
    productCount += 1;
    return true;
  }

  function buyProduct(uint id)
    public payable forSale(id) paidEnough(products[id].price) checkValue(id)
  {
    products[id].buyer = msg.sender;
    products[id].seller.transfer(products[id].price * 19 / 20);
    products[id].state = State.Sold;
    owner.transfer(products[id].price / 20);

    emit LogSold(id);
    emit LogAddressBuyer(products[id].buyer);
    emit LogAddressSeller(products[id].seller);
  }

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
