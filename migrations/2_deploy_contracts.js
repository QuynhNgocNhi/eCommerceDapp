var Marketplace = artifacts.require("./Marketplace.sol");
var SafeMath = artifacts.require("./SafeMath.sol");


module.exports = function(deployer) {
  deployer.deploy(SafeMath);
  deployer.link(SafeMath, Marketplace);
  deployer.deploy(Marketplace);
};
