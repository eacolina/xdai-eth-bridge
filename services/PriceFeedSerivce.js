var axios = require('axios')
let priceFeeds = {
    'coinmarketcap' : getPriceOfETH_CMC,
    'cryptocompare': getPriceOfETH_CMC,
    'cryptonator': getPriceOfETH_CNT
}

async function getPriceOfETH_CPC(){ // CRYPTO_COMPARE
    // API SPEC: https://min-api.cryptocompare.com/documentation 
   try{
       var res = await  axios({
            method: 'get',
            url:'https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD',
            headers:{
                'Content-Type':'application/json',
                'Apikey':'61a50c0327d8d0bbed24b29bf380d1a8883f05d596d28f1a41069ff348c76f8e'
            }
        })
       const price = res.data.USD;
       return parseFloat(price)
   } catch(err){
       console.error(err)
   }
}
async function getPriceOfETH_CMC(){
    //API SPEC: https://coinmarketcap.com/api/documentation/v1/#operation/getV1CryptocurrencyQuotesLatest
   try{
       var res = await  axios({
            method: 'get',
            url:'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=ETH',
            headers:{
                'Content-Type':'application/json',
                'X-CMC_PRO_API_KEY':'e531810c-4ef5-4bda-86a4-53b484e51337'
            }
        })
       const price = res.data.data.ETH.quote.USD.price;
       return parseFloat(price)
   } catch(err){
       console.error(err)
   }
}
async function getPriceOfETH_CNT(){
    //API SPEC: https://www.cryptonator.com/api/
   try{
       var res = await  axios({
            method: 'get',
            url:'https://api.cryptonator.com/api/ticker/eth-usd',
        })
        var price = res.data.ticker.price
        return parseFloat(price)
   } catch(err){
       console.error(err)
   }
}

async function getFilteredETH_price(){
    let prices = []
    for(let feed in priceFeeds){ // iterate through all the price feeds
        var price = await priceFeeds[feed]() // get the price from the feed
        prices.push(price) // push price to array
    }
    prices = prices.sort() //sort price array
    let mid = Math.floor(prices/2)
    // get the median of the prices
    if (prices.length % 2 == 0){
        return (prices[mid - 1] + prices[mid])/2
    }
    return (prices[mid])
}

module.exports = {
    getFilteredETH_price: getFilteredETH_price,
}