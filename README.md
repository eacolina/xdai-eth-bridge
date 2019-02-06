# Ethereum to xDai Bridge

This service works as bridge between POA's xDai network and the Ethereum mainnet.

## How it works
- There are two proxy contracts, one on Ethereum and one on xDai.
- When the function `convertFunds` is called on either one of them it will trigger the event `FundsSent`. And it will redirect the sent funds to a liquidity pool set at deployment time.
- A service will pick up those events and its values. It will convert the sent amount to the corresponding token based on the current price of ETH/USD and send the funds to the same address on the other chain.

## How to run it

- Clone this repo
- Run `npm install`
- Create a `.env` file or setup the following environment variables:
    ```
    WALLET_MNEMONIC=MENMONIC FOR THE ACCOUNT THAT WILL SEND THE GAS
    XDAI_ENDPOINT=YOUR XDAI ENDPOINT
    ETH_ENDPOINT=YOUR ETH ENDPOINT
    ```
- Deploy the contract on Ethereum, run the following:
    ```
    truffle console --network mainnet
    (await Emitter.new()).address
    .exit
    ```
    This will return the address of the ETH proxy contract, paste this in a new environment variable `ETH_EMITTER_ADDRESS`.

- Deploy the contract on xDai, run the following:
    ```
    truffle console --network xdai
    (await Emitter.new()).address
    .exit
    ```
    This will return the address of the xDai proxy contract, paste this in a new environment variable `XDAI_EMITTER_ADDRESS`.

    Now that both contracts are deployed, we can start the service with `npm start`.
