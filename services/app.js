// This service should listen to Events of the Emitter contract

if(process.env.NODE_ENV != 'production'){
    require('dotenv').load()
}

var EmitterArtifacts = require("./../build/contracts/Emitter.json")
var ReceiverArtifacts = require("./../build/contracts/Receiver.json")
var HDWalletProvider = require("truffle-hdwallet-provider")
var mnemonic = "bag various stumble orchard print plate relief gossip defense spirit during raven"
var Web3 = require('Web3')
var web3_xdai
var web3_eth
var EmitterABI = EmitterArtifacts.abi
var ReceiverABI = ReceiverArtifacts.abi
var EmitterContract
var ReceiverContract
var lastEventBlock = 0
// Returns a wallet provider pointing to the xDai RPC
function xDaiproviderSetup(){
    return new HDWalletProvider(process.env.WALLET_MNEMONIC, "https://dai.poa.network")
}
// Returns a wallet provider pointing to the Ropsten Infura RPC
function ethProviderSetup(){
    return new HDWalletProvider(process.env.WALLET_MNEMONIC,  "https://ropsten.infura.io/tRmXv2MPxIZMNr29IaYX ")
}


async function initService() {
    web3_xdai = new Web3(xDaiproviderSetup())
    web3_eth = new Web3(ethProviderSetup())
    const xdai_account = (await web3_xdai.eth.getAccounts())[0]
    const eth_account = (await web3_eth.eth.getAccounts())[0]
    EmitterContract = new web3_xdai.eth.Contract(EmitterABI, process.env.EMITTER_ADDRESS, {from:xdai_account})
    ReceiverContract = new web3_eth.eth.Contract(ReceiverABI, process.env.RECEIVER_ADDRESS, {from: eth_account})
    pollEvents()
    sendRx()
}
function pollEvents(){
    EmitterContract.getPastEvents("Updated",{fromBlock:lastEventBlock, toBlock:'latest'},(err, res) => {
        if(err){
            console.log("There was an error with the RPC endpoint")
        } else {
            var latest_event = res[res.length - 1]
            if (latest_event.blockNumber > lastEventBlock){
                lastEventBlock = latest_event.blockNumber
                console.log(latest_event.returnValues)
                sendRx(process.env.EMITTER_ADDRESS, latest_event.returnValues.message)
            }
        }
    })
    setTimeout(pollEvents,150)
}

async function sendRx(address, message){
    let account = (await web3_eth.eth.getAccounts())[0]
    ReceiverContract.methods.receive(account, message).send({from:account})
}

initService()