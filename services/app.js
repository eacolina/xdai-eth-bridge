// This service should listen to Events of the Emitter contract
var EmitterArtifacts = require("./Emitter.json")
var HDWalletProvider = require("truffle-hdwallet-provider")
const EmitterAddress = "0x9163EEE9b7A13EEE21D3e19A2bc9E5a557FC1A3c"
var mnemonic = "bag various stumble orchard print plate relief gossip defense spirit during raven"
var Web3 = require('Web3')
var EmitterABI = EmitterArtifacts.abi
var EmitterContract
var lastEventBlock = 0
function providerSetup(){
    return new HDWalletProvider(mnemonic, "https://dai.poa.network")
}


function initService() {
    web3 = new Web3(providerSetup())
    const account = web3.eth.getAccounts[0]
    EmitterContract = new web3.eth.Contract(EmitterABI, EmitterAddress, {from:account})
    pollEvents()
}
async function pollEvents(){
    EmitterContract.getPastEvents("Updated",{fromBlock:lastEventBlock, toBlock:'latest'},(err, res) => {
        var latest_event = res[res.length - 1]
        if (latest_event.blockNumber > lastEventBlock){
            lastEventBlock = latest_event.blockNumber
            console.log(latest_event.returnValues)
        }
    })
    setTimeout(pollEvents,150)
}

initService()