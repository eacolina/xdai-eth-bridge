var Migrations = artifacts.require("./Migrations.sol");
var Emitter = artifacts.require("./Emitter.sol");

module.exports = function(deployer) {
  deployer.deploy(Emitter, "Initial message!");
};
