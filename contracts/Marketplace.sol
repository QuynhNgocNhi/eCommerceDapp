pragma solidity >=0.4.21 <0.7.0;

contract Marketplace {

  address owner;
  uint skuCount;
  mapping (uint => Item) public items;

  struct Item {
    string name;
    uint sku;
    uint price;
    State state;
    address payable seller;
    address payable buyer;
  }

  enum State {
    ForSale,
    Sold,
    Shipped,
    Received
  }

    event LogForSale(uint sku);
    event LogSold(uint sku);
    event LogShipped(uint sku);
    event LogReceived(uint sku);
    event LogAddress(address);


  modifier verifyCaller (address _address) { require (msg.sender == _address); _;}
  modifier paidEnough(uint _price) { require(msg.value >= _price); _;}
  modifier checkValue(uint _sku) {
    _;
    uint _price = items[_sku].price;
    uint amountToRefund = msg.value - _price;
    items[_sku].buyer.transfer(amountToRefund);
  }


  modifier forSale(uint _sku) { require(items[_sku].state == State.ForSale && items[_sku].buyer == address(0)); _;}
  modifier sold(uint _sku) { require(items[_sku].state == State.Sold); _;}
  modifier shipped(uint _sku) { require(items[_sku].state == State.Shipped); _;}
  modifier received(uint _sku) { require(items[_sku].state == State.Received); _;}

  constructor() public {
    owner = msg.sender;
    skuCount = 0;
    /* id = 1001; */
  }

  function getCount() public returns (uint sku) {
    return skuCount;
  }

  function addItem(string memory _name, uint _price) public returns(bool){
    emit LogForSale(skuCount);
    items[skuCount] = Item({name: _name, sku: skuCount, price: _price, state: State.ForSale, seller: msg.sender, buyer: address(0)});
    skuCount += 1;
    /* id += 1; */
    // Replace items[skuCount] with items[id] to use id
    return true;
  }

  function buyItem(uint sku)
    public payable forSale(sku) paidEnough(items[sku].price) checkValue(sku)
  {
    // set buyer as caller of transaction
    items[sku].buyer = msg.sender;
    // transfer money to seller (from contract)
    items[sku].seller.transfer(items[sku].price);
    // same as sendTransaction({from: buyer, to: seller, value: items[sku].price})
    // set state to sold
    items[sku].state = State.Sold;
    emit LogSold(sku);
    emit LogAddress(items[sku].buyer);
    emit LogAddress(items[sku].seller);
  }

  function shipItem(uint sku)
    public sold(sku) verifyCaller(items[sku].seller)
  {
    items[sku].state = State.Shipped;
    emit LogShipped(sku);
  }

  function receiveItem(uint sku)
    public shipped(sku) verifyCaller(items[sku].buyer)
  {
    items[sku].state = State.Received;
    emit LogReceived(sku);
  }

  function fetchItem(uint _sku) public view returns (string memory name, uint sku, uint price, uint state, address seller, address buyer) {
    name = items[_sku].name;
    sku = items[_sku].sku;
    price = items[_sku].price;
    state = uint(items[_sku].state);
    seller = items[_sku].seller;
    buyer = items[_sku].buyer;
    return (name, sku, price, state, seller, buyer);
  }
}
