let BN = web3.utils.BN;
let Marketplace = artifacts.require('Marketplace');

contract("Marketplace", function(accounts) {
  const marketplaceOwner = accounts[0]
  const seller = accounts[1]
  const buyer = accounts[2]

  const commission = 0.05
  const price = "420"
  const amountWithGas = "430"

  let testInstance

  beforeEach(async () => {
    testInstance = await Marketplace.new()
  })

  it("buy should finalize for all parties (buyer makes transfer, seller receives 95%, owner recieves 5% commission and state is updated)", async () => {

    await testInstance.addProduct("iPad", price, { from: seller })
    var marketplaceOwnerBalanceBefore = await web3.eth.getBalance(marketplaceOwner)
    var sellerBalanceBefore = await web3.eth.getBalance(seller)
    var buyerBalanceBefore = await web3.eth.getBalance(buyer)

    await testInstance.buyProduct(0, { from: buyer, value: amountWithGas })

    var marketplaceOwnerBalanceAfter = await web3.eth.getBalance(marketplaceOwner)
    var sellerBalanceAfter = await web3.eth.getBalance(seller)
    var buyerBalanceAfter = await web3.eth.getBalance(buyer)

    const result = await testInstance.fetchProduct.call(0)

    assert.equal(result.state.toString(10), 1, 'state should be set to "Sold"')
    assert.equal(result.buyer, buyer, "the buyer's address should be set after purchase")
    assert.equal(new BN(marketplaceOwnerBalanceAfter).toString(), new BN(marketplaceOwnerBalanceBefore).add(new BN(price * commission)).toString(), "the owner's balance should be increased by the commission")
    assert.equal(new BN(sellerBalanceAfter).toString(), new BN(sellerBalanceBefore).add(new BN(price)).sub(new BN(price * commission)).toString(), "the seller's balance should be increased by price minus commission")
    assert.isBelow(Number(buyerBalanceAfter), Number(new BN(buyerBalanceBefore).sub(new BN(price))), "buyers balance should be reduced by price of the product")
  })

});
