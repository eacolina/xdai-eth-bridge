var Receiver = artifacts.require("./Receiver.sol");

module.exports = function(deployer) {
  deployer.deploy(Receiver);
};
