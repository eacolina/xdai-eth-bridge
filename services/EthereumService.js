// This service should listen to Events of the Emitter contract
if(process.env.NODE_ENV != 'production'){
    require('dotenv').load()
}

module.exports = {
    init:initETHService,
    sendTX:forwardFundsETH
}

var EmitterArtifacts = require("./../build/contracts/Emitter.json")
var HDWalletProvider = require("truffle-hdwallet-provider")
var priceFeed = require('./PriceFeedSerivce')
var Web3 = require('Web3')
var xdaiService = require('./xDaiService')
var web3_eth
var utils 
var EmitterABI = EmitterArtifacts.abi
var lastEventBlock_eth = 7146113// always update this

const ethEndpoint = process.env.ETH_ENDPOINT
var eth_account
async function initETHService() {
    console.log("Starting Ethereum service...")
    web3_eth = new Web3(ethProviderSetup()) // create a web3 object with ETH endpoint
    eth_account = (await web3_eth.eth.getAccounts())[0]  // TODO setup with proper account for ETH pool
    utils = web3_eth.utils 
    eth_EmitterContract = new web3_eth.eth.Contract(EmitterABI, process.env.ETH_EMITTER_ADDRESS, {from: eth_account})
    eth_PollEvents()  // start polling for events on eth network
    console.log("Ethereum service started")
}

// Returns a wallet provider pointing to the Ropsten Infura RPC
function ethProviderSetup(){
    return new HDWalletProvider(process.env.WALLET_MNEMONIC,  ethEndpoint)
}

// Callback function that should get called whenver the services hears a "FundsSent" event in the Emitter contract
async function eth_fundsSentCb(err, res){
    if(err){
        // console.log("There was an error with the RPC endpoint")
    } else {
        if(res.length == 0){return}
        var latest_event = res[res.length - 1] // get latest event
        if (latest_event.blockNumber > lastEventBlock_eth){ // only update & process latest_block if the found one is higher
            lastEventBlock_eth = latest_event.blockNumber  // update block number
            let destAccount = latest_event.sender
            let ethAmount = latest_event.returnValues.value // parse amount of DAI to convert
            let priceOfETH = await priceFeed.getFilteredETH_price() // get price of ETH
            let daiAmount = calculateAmountOfDAI(ethAmount, priceOfETH) // convert from DAI to ETH
            let sender = latest_event.returnValues.sender
            console.log("trying to send", utils.fromWei(ethAmount), "ETH")
            xdaiService.sendTx(daiAmount, sender).then( (res) => {
                console.log("Just sent", utils.fromWei(daiAmount.toString()), "DAI to account", sender,"@",1/priceOfETH,"USD/ETH")
                console.log("TxHash: ", res.transactionHash)
            }).catch((err) => {
                console.error("There was an error sending the funds: ", err,"\n")
            })
        }
    }
}

function eth_PollEvents(contractInstance, event, fromBlock, cb){
    // Get all the past "FundsSent" events 
    eth_EmitterContract.getPastEvents("FundsSent",{fromBlock:lastEventBlock_eth, toBlock:'latest'},eth_fundsSentCb)
    setTimeout(eth_PollEvents,150) // poll every 150ms 
}
// Simply return the amount of ETH given the DAI amount and current price of ETH
// TODO: Watch out for decimal handeling with BN library
function calculateAmountOfDAI(ETH_amount,priceOfETH){
    return ETH_amount*priceOfETH
}

// send eth
async function forwardFundsETH(amount, dest_account){
    var nonce = await web3_eth.eth.getTransactionCount(eth_account)
   return web3_eth.eth.sendTransaction({from:eth_account, to:dest_account, value: amount,gas:210000, gasPrice:20000000000, nonce:nonce})
}
 