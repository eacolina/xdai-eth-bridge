// This service should listen to Events of the Emitter contract

if(process.env.NODE_ENV != 'production'){
    require('dotenv').load()
}

module.exports = {
    init:initETHService
}

var EmitterArtifacts = require("./../build/contracts/Emitter.json")
var ReceiverArtifacts = require("./../build/contracts/Receiver.json")
var HDWalletProvider = require("truffle-hdwallet-provider")
var priceFeed = require('./PriceFeedSerivce')
var mnemonic = "bag various stumble orchard print plate relief gossip defense spirit during raven"
var Web3 = require('Web3')
var web3_xdai
var web3_eth
var utils 
var EmitterABI = EmitterArtifacts.abi
var ReceiverABI = ReceiverArtifacts.abi
var EmitterContract
var ReceiverContract
var lastEventBlock = 0
const axios = require('axios')

const xdaiEndpoint = "https://dai.poa.network/";
const ethEndpoint = "https://mainnet.infura.io/v3/f3075a55b6784172bf6b940a6574437b"//"https://ropsten.infura.io/tRmXv2MPxIZMNr29IaYX ";

var xdai_account 
var eth_account


async function initETHService() {
    console.log("Starting Ethereum service...")
    web3_xdai = new Web3(xDaiproviderSetup()) // create a web3 object with xDai endpoint
    web3_eth = new Web3(ethProviderSetup()) // create a web3 object with ETH endpoint
    xdai_account = (await web3_xdai.eth.getAccounts())[0] // TODO setup with proper account for DAI pool
    eth_account = (await web3_eth.eth.getAccounts())[0]  // TODO setup with proper account for ETH pool
    utils = web3_eth.utils 
    EmitterContract = new web3_xdai.eth.Contract(EmitterABI, process.env.EMITTER_ADDRESS, {from:xdai_account})
    ReceiverContract = new web3_eth.eth.Contract(ReceiverABI, process.env.RECEIVER_ADDRESS, {from: eth_account})
    pollEvents()   
}

// Returns a wallet provider pointing to the xDai RPC
function xDaiproviderSetup(){
    return new HDWalletProvider(process.env.WALLET_MNEMONIC, xdaiEndpoint)
}
// Returns a wallet provider pointing to the Ropsten Infura RPC
function ethProviderSetup(){
    return new HDWalletProvider(process.env.WALLET_MNEMONIC,  ethEndpoint)
}

// Callback function that should get called whenver the services hears a "FundsSent" event in the Emitter contract
async function fundsSentCb(err, res){
    if(err){
        console.log("There was an error with the RPC endpoint")
    } else {
        if(res.length == 0){console.log("No events!");return}
        var latest_event = res[res.length - 1] // get latest event
        if (latest_event.blockNumber > lastEventBlock){ // only update & process latest_block if the found one is higher
            lastEventBlock = latest_event.blockNumber  //update block number
            let destAccount = latest_event.sender
            let daiAmount = latest_event.returnValues.value // parse amount of DAI to convert
            let priceOfETH = await priceFeed.getFilteredETH_price() // get price of ETH
            let ethAmount = calculateAmountOfETH(daiAmount, priceOfETH) // convert from DAI to ETH
            let sender = latest_event.returnValues.sender
            let res = forwardFundsETH(ethAmount, sender).then((err,res) => {
                console.log("Just sent", utils.fromWei(ethAmount.toString()), "ETH to account", sender,"@",priceOfETH,"/USD"," \n")
            }).catch((err) => {
                console.error("There was an error sending the funds: ", err,"\n")
            })
        }
    }
}

function pollEvents(contractInstance, event, fromBlock, cb){
    // Get all the past "FundsSent" events 
    EmitterContract.getPastEvents("FundsSent",{fromBlock:lastEventBlock, toBlock:'latest'},fundsSentCb)
    setTimeout(pollEvents,150) // poll every 150ms 
}
// Simply return the amount of ETH given the DAI amount and current price of ETH
// TODO: Watch out for decimal handeling with BN library
function calculateAmountOfETH(DAI_amount,priceOfETH){
    return DAI_amount/priceOfETH
}

async function forwardFundsETH(amount, dest_account){
   web3_eth.eth.sendTransaction({from:eth_account, to:dest_account, value: amount}).catch((err) => {
       console.log(err)
    })
}
