/**
 * Use this file to configure your truffle project. It's seeded with some
 * common settings for different networks and features like migrations,
 * compilation and testing. Uncomment the ones you need or modify
 * them to suit your project as necessary.
 *
 * More information about configuration can be found at:
 *
 * truffleframework.com/docs/advanced/configuration
 *
 * To deploy via Infura you'll need a wallet provider (like truffle-hdwallet-provider)
 * to sign your transactions before they're sent to a remote public node. Infura API
 * keys are available for free at: infura.io/register
 *
 * You'll also need a mnemonic - the twelve word phrase the wallet uses to generate
 * public/private key pairs. If you're publishing your code to GitHub make sure you load this
 * phrase from a file you've .gitignored so it doesn't accidentally become public.
 *
 */

var HDWalletProvider = require('truffle-hdwallet-provider');

// const infuraKey = "fj4jll3k.....";
//
// const fs = require('fs');
if(process.env.NODE_ENV != 'production'){
  require('dotenv').load()
}
const mnemonic = process.env.TRUFFLE_WALLET_MNEMONIC;

module.exports = {

  test_directory:'test_solidity',
  networks: {

    development: {
     host: "127.0.0.1",     // Localhost (default: none)
     port: 7545,            // Standard Ethereum port (default: none)
     network_id: "5777",       // Any network (default: none)
    },

    xdai: {
      provider: function(){
        return new HDWalletProvider(mnemonic, process.env.XDAI_ENDPOINT)
      },
      network_id:"*",
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/tRmXv2MPxIZMNr29IaYX ")
      },
      network_id: 3,
    },
    mainnet:{
      provider: function(){
        return new HDWalletProvider(menemonic, process.env.ETH_ENDPOINT)
      },
      network_id: 1,
      gas: 6000000,           // Gas sent with each transaction (default: ~6700000)
      gasPrice: 20000000000,  // 20 gwei (in wei) (default: 100 gwei)

    }
  },
}
