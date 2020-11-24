pragma solidity ^0.6.12;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Marketplace.sol";

// Contract wrapper used to avoid VM revert error

contract MarketplaceWrapper is Marketplace{

  function callAddItem(string memory name, uint price) public {
    addItem(name, price);
  }

  function callBuyItem(uint sku) public {
    buyItem(sku);
  }

  function callFetchItem(uint sku) public {
    fetchItem(sku);
  }
}

contract TestMarketplace {

    address payable contractAdress;
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

      MarketplaceWrapper(address(throwProxy)).callAddItem(name, price);
      (bool resultAddedItem, ) = throwProxy.execute.gas(200000)();
      emit LogAddedProduct(resultAddedItem);

      // Expectations
      uint expectedSku = 0;
      string memory expectedName = "Smartphone";
      uint expectedPrice = 42;

      MarketplaceWrapper(address(throwProxy)).callBuyItem(expectedSku);
      (bool resultBoughtItem, ) = throwProxy.execute.gas(200000)();
      emit LogBoughtProduct(resultBoughtItem);

      // Assert
      Assert.isFalse(resultBoughtItem, "Should be false because not enough funds");

    }

     function testItemNotForSale() public {
      // Set up

      MarketplaceWrapper wrappedInstance = new MarketplaceWrapper();
      ThrowProxy throwProxy = new ThrowProxy(address(wrappedInstance));

      // Execute
      // Instead of buyItem, callBuyItem from wrapper contract could be used
      MarketplaceWrapper(address(throwProxy)).buyItem(100);

      (bool result, ) = throwProxy.execute.gas(200000)();

      // Assert
      Assert.isFalse(result, "Should not be available anymore");

    }

    function beforeAll() public {
        contractAdress = DeployedAddresses.Marketplace();
        testInstance = Marketplace(contractAdress);
    }

    event LogNumber(uint);
    event LogAddress(address);
    event LogBool(bool);
    event LogString(string);

    function test_init_shop_count() public {

        // Setup
        uint expectedCount = 0;

        // test execution
        uint returnedCount = testInstance.getCount();
        emit LogNumber(returnedCount);

        // assertion
        Assert.equal(returnedCount, expectedCount, "neu initierter shop sollte noch keine items enthalten");

    }

    function test_add_item_to_shop() public {

        // test der vorbedingungen
        uint expectedCount = 0;
        uint returnedCount = testInstance.getCount();
        Assert.equal(returnedCount, expectedCount, "neu initierter shop sollte noch keine items enthalten");

        // Setup
        string memory name = "iPhone";
        uint price = 0.1 ether;

        // test execution
        bool success = testInstance.addItem(name, price);
        emit LogBool(success);

        // expectation
        string memory expectedName = name;
        uint expectedPrice = price;
        // uint expectedId = 1001;
        uint expectedSku = 0;
        uint expectedStateId = 0;
        uint expectedNumberOfItems = 1;
        address expectedBuyer = address(0);
        /* address expectedSeller = msg.sender; */

        // assertion
        uint returnedNumberOfItems = testInstance.getCount();
        Assert.isAtLeast(returnedNumberOfItems, expectedNumberOfItems, "count muesste nach hinzufuegen grosser als 0 sein");

        (string memory returnedName, uint returnedSku, uint returnedPrice,
          uint returnedState, address returnedSeller, address returnedBuyer) =
            testInstance.fetchItem(expectedSku);
            // Change to expectedId if id is implemented

        emit LogString(returnedName);

        emit LogNumber(returnedSku);
        emit LogNumber(returnedPrice);
        emit LogNumber(returnedState);

        emit LogAddress(returnedBuyer);
        emit LogAddress(returnedSeller);
        emit LogAddress(tx.origin);
        emit LogAddress(msg.sender);

        // Returned seller: 0xDb11c603d34Eb834399041dccB6FA6acE0f7A095 (always changes!)
        // EOA that created contract: 0xAF625d9D2f53276b234C94a6a8f00452FD75AA7d
        // Contract: 0xaCf73FB1E1f470E30981b1E3430568c6331633A1

        Assert.equal(returnedName, expectedName, "falscher Name");
        /* Assert.equal(returnedSku, expectedId, "falsche ID"); */
        Assert.equal(returnedPrice, expectedPrice, "falscher price");
/*         Assert.notEqual(returnedSeller, expectedSeller, "falscher seller"); */
        Assert.equal(returnedState, expectedStateId, "falscher state");
        Assert.isZero(returnedBuyer, "falscher buyer");
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



// Helper function bytes to string

/* function bytes32ToString(bytes32 x) public returns (string memory) {
    bytes memory bytesString = new bytes(32);
    uint charCount = 0;
    for (uint j = 0; j < 32; j++) {
        byte char = byte(bytes32(uint(x) * 2 ** (8 * j)));
        if (char != 0) {
            bytesString[charCount] = char;
            charCount++;
        }
    }
    bytes memory bytesStringTrimmed = new bytes(charCount);
    for (uint j = 0; j < charCount; j++) {
        bytesStringTrimmed[j] = bytesString[j];
    }
    return string(bytesStringTrimmed);
} */

