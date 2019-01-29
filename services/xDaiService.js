// This service will listen for transactions on the xDai network
if(process.env.NODE_ENV != 'production'){
    require('dotenv').load()
}

module.exports = {
    init:initXDAIService,
    sendTx:forwardFundsDAI
}

var HDWalletProvider = require("truffle-hdwallet-provider")
var EmitterArtifacts = require("./../build/contracts/Emitter.json")
var priceFeed = require('./PriceFeedSerivce')
var Web3 = require('Web3')
var ETHService = require('./EthereumService')
var web3_xdai
var utils 
var EmitterABI = EmitterArtifacts.abi
var xDaiEmitterContract
var lastEventBlock_dai = 1910370// always update this

const xdaiEndpoint = process.env.XDAI_ENDPOINT
var xdai_account 

// Returns a wallet provider pointing to the xDai RPC
function xDaiproviderSetup(){
    return new HDWalletProvider(process.env.WALLET_MNEMONIC, xdaiEndpoint)
}

async function initXDAIService() {
    console.log("Starting xDAI service...")
    web3_xdai = new Web3(xDaiproviderSetup()) // create a web3 object with xDai endpoint
    xdai_account = (await web3_xdai.eth.getAccounts())[0] // TODO setup with proper account for DAI pool
    utils = web3_xdai.utils 
    xDaiEmitterContract = new web3_xdai.eth.Contract(EmitterABI, process.env.XDAI_EMITTER_ADDRESS, {from: xdai_account})
    xDaiPollEvents() // start polling for events on xDai network
    console.log("xDai service started")
}

// Callback function that should get called whenver the services hears a "FundsSent" event in the Emitter contract
async function xDaifundsSentCb(err, res){
    if(err){
        // console.log("There was an error with the RPC endpoint")
    } else {
        if(res.length == 0){return}
        var latest_event = res[res.length - 1] // get latest event
        
        if (latest_event.blockNumber > lastEventBlock_dai){ // only update & process latest_block if the found one is higher
            lastEventBlock_dai = latest_event.blockNumber  //update block number
            let destAccount = latest_event.sender
            let daiAmount = latest_event.returnValues.value // parse amount of DAI to convert
            let priceOfETH = await priceFeed.getFilteredETH_price() // get price of ETH
            let ethAmount = calculateAmountOfETH(daiAmount, priceOfETH) // convert from DAI to ETH
            let sender = latest_event.returnValues.sender
            let res = ETHService.sendTX(ethAmount, sender).then((res) => {
                console.log("Just sent", utils.fromWei(ethAmount.toString()), "ETH to account", sender,"@",priceOfETH,"/USD"," \n")
                console.log('TxHash:',res.transactionHash)
            }).catch((err) => {
                console.error("There was an error sending the funds: ", err,"\n")
            })
        }
    }
}


function xDaiPollEvents(contractInstance, event, fromBlock, cb){
    // Get all the past "FundsSent" events 
    xDaiEmitterContract.getPastEvents("FundsSent",{fromBlock:lastEventBlock_dai, toBlock:'latest'},xDaifundsSentCb)
    setTimeout(xDaiPollEvents,150) // poll every 150ms 
}
function calculateAmountOfETH(DAI_amount,priceOfETH){
    return DAI_amount/priceOfETH
}

// send xdai
async function forwardFundsDAI(amount, dest_account){
    //TODO add gas estimation
    return web3_xdai.eth.sendTransaction({from:xdai_account, to:dest_account, value: amount, gas:210000, gasPrice:20000000000})
 }