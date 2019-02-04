const Emitter = artifacts.require("Emitter")
const BN = web3.utils.BN 
contract('Emitter', (accounts) => {
    let instance
    let poolOwner 
    beforeEach('create a new contract', async() =>{
        instance = await Emitter.new()
    })

    it('should create contract with correct pool', async () => {
        poolOwner = await instance.poolOwner()
        assert.equal(poolOwner, accounts[0], "Wrong pool")
    })

    it('goToETH() should foward ETH to pool address', async() => {
        let initialPoolBalance = await web3.eth.getBalance(accounts[0])
        let val = await web3.utils.toWei('10')
        await instance.goToETH.sendTransaction({from:accounts[1], value: val}) // foward funds to the pool
        let finalPoolBalance = await web3.eth.getBalance(accounts[0])
        assert.isTrue((new BN(initialPoolBalance).add(new BN(val)).eq(new BN(finalPoolBalance))), "Balances don't add up")
    })

})
