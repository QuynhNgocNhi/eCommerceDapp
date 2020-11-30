pragma solidity ^0.6.12;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Marketplace.sol";

// Contract wrapper used to avoid VM revert error

contract MarketplaceWrapper is Marketplace{

  function callAddProduct(string memory name, uint price) public {
    addProduct(name, price);
  }

  function callBuyProduct(uint id) public {
    buyProduct(id);
  }

  function callFetchProduct(uint id) public {
    fetchProduct(id);
  }
}

contract TestMarketplace {

    address payable contractAdress;
    uint public initialBalance = 5 ether;
    Marketplace testInstance;

    event LogAddedProduct(bool);
    event LogBoughtProduct(bool);

    // Version with wrapper

    function testFailureIfNotEnoughFundsSent() public {

      // Setup - ThrowProxy initializes with created wrapped MarketplaceInstance address
      MarketplaceWrapper wrappedInstance = new MarketplaceWrapper();
      ThrowProxy throwProxy = new ThrowProxy(address(wrappedInstance));

      string memory name = "Smartphone";
      uint price = 42;

      MarketplaceWrapper(address(throwProxy)).callAddProduct(name, price);
      (bool resultAddedProduct, ) = throwProxy.execute.gas(200000)();
      emit LogAddedProduct(resultAddedProduct);

      // Expectations
      uint expectedId = 0;
      string memory expectedName = "Smartphone";
      uint expectedPrice = 42;

      MarketplaceWrapper(address(throwProxy)).callBuyProduct(expectedId);
      (bool resultBoughtProduct, ) = throwProxy.execute.gas(200000)();
      emit LogBoughtProduct(resultBoughtProduct);

      // Assert
      Assert.isFalse(resultBoughtProduct, "Should be false because not enough funds");

    }

     function testProductNotForSale() public {
      // Set up

      MarketplaceWrapper wrappedInstance = new MarketplaceWrapper();
      ThrowProxy throwProxy = new ThrowProxy(address(wrappedInstance));
      uint unknownProductId = 1001;

      // Execute
      // Instead of buyProduct, callBuyProduct from wrapper contract could be used
      MarketplaceWrapper(address(throwProxy)).callBuyProduct(unknownProductId);

      (bool result, ) = throwProxy.execute.gas(200000)();

      // Assert
      Assert.isFalse(result, "Should not be available");

    }

    function beforeAll() public {
        contractAdress = DeployedAddresses.Marketplace();
        testInstance = Marketplace(contractAdress);
    }

    event LogNumber(uint);
    event LogAddress(address);
    event LogBool(bool);
    event LogString(string);

    function testInitCount() public {

        // Setup
        uint expectedCount = 0;

        // test execution
        uint returnedCount = testInstance.getCount();
        emit LogNumber(returnedCount);

        // assertion
        Assert.equal(returnedCount, expectedCount, "Initiated shop shouldn't have any products");

    }

    function testAddProduct() public {

        // Test prerequisites
        uint expectedCount = 0;
        uint returnedCount = testInstance.getCount();
        Assert.equal(returnedCount, expectedCount, "Initiated shop shouldn't have any products");

        // Setup
        string memory name = "iPhone";
        uint price = 0.1 ether;

        // Test execution
        bool success = testInstance.addProduct(name, price);
        emit LogBool(success);

        // Expectation
        string memory expectedName = name;
        uint expectedPrice = price;
        uint expectedId = 0;
        uint expectedStateId = 0;
        uint expectedNumberOfProducts = 1;
        address expectedBuyer = address(0);

        // Assertion
        uint returnedNumberOfProducts = testInstance.getCount();
        Assert.isAtLeast(returnedNumberOfProducts, expectedNumberOfProducts, "Count after added product should be > 0");

        (string memory returnedName, uint returnedId, uint returnedPrice,
          uint returnedState, address returnedSeller, address returnedBuyer) =
            testInstance.fetchProduct(expectedId);

        emit LogString(returnedName);
        emit LogNumber(returnedId);
        emit LogNumber(returnedPrice);
        emit LogNumber(returnedState);
        emit LogAddress(returnedBuyer);
        emit LogAddress(returnedSeller);
        emit LogAddress(tx.origin);
        emit LogAddress(msg.sender);

        Assert.equal(returnedName, expectedName, "Wrong name");
        Assert.equal(returnedPrice, expectedPrice, "Wrong price");
        Assert.equal(returnedState, expectedStateId, "Wrong state");
        Assert.isZero(returnedBuyer, "Wrong buyer");

    }
}

// Proxy contract for testing throws
contract ThrowProxy {
  // Target = contract to test for throws
  address public target;
  bytes data;

  // Storing address of target
  constructor(address _target) public{
    target = _target;
  }

  //prime the data using the fallback function.
  fallback() external{
    // complete call data of a contract call i.e. function signature and inputs compressed into 32 bytes
    data = msg.data;
  }

  function execute() public returns (bool, bytes memory) {
    // returns bool to determine if function was executed or not
    return target.call(data);
  }
}

// Contract you're testing
contract Thrower {
  function doThrow() public {
    revert();
  }

  function doNoThrow() public {
    //
  }
}


