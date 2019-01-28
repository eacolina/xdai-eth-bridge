// This service should listen to Events of the Emitter contract

if(process.env.NODE_ENV != 'production'){
    require('dotenv').load()
}
const EthereumSerivce = require('./services/EthereumService')
function main() {
    console.log("Starting application...")
    EthereumSerivce.init()// Start EthereumService, this will connect to xDai and ETH networks and start listening for events
}

main()