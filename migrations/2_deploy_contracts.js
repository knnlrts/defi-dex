const Dai = artifacts.require('mocks/Dai.sol');
const Bat = artifacts.require('mocks/Bat.sol');
const Rep = artifacts.require('mocks/Rep.sol');
const Zrx = artifacts.require('mocks/Zrx.sol');
const Knt = artifacts.require('mocks/Knt.sol');
const Dex = artifacts.require('Dex.sol');

const [DAI, BAT, REP, ZRX, KNT] = ['DAI', 'BAT', 'REP', 'ZRX', 'KNT'].map(ticker => web3.utils.fromAscii(ticker));

const SIDE = {
    BUY: 0,
    SELL: 1
}

module.exports = async function(deployer, _network, accounts) {
    const [trader1, trader2, trader3, trader4, _] = accounts;

    await Promise.all(
        [Dai, Bat, Rep, Zrx, Knt, Dex].map(contract => deployer.deploy(contract))
    );

    const [dai, bat, rep, zrx, knt, dex] = await Promise.all(
        [Dai, Bat, Rep, Zrx, Knt, Dex].map(contract => contract.deployed())
    );

    await Promise.all([
        dex.addToken(DAI, dai.address),
        dex.addToken(BAT, bat.address),
        dex.addToken(REP, rep.address),
        dex.addToken(ZRX, zrx.address),
        dex.addToken(KNT, knt.address)
    ]);

    const amount = web3.utils.toWei('1000');
    const seedTokenBalance = async (token, trader) => {
        await token.faucet(trader, amount);
        await token.approve(dex.address, amount, {from: trader});
        const ticker = await token.name();
        await dex.deposit(amount, web3.utils.fromAscii(ticker), {from: trader});
    }
    // seed tokens trader1
    await Promise.all(
        [dai, bat, rep, zrx, knt].map(token => seedTokenBalance(token, trader1))
    );
    // seed tokens trader2
    await Promise.all(
        [dai, bat, rep, zrx, knt].map(token => seedTokenBalance(token, trader2))
    );
    // seed tokens trader3
    await Promise.all(
        [dai, bat, rep, zrx, knt].map(token => seedTokenBalance(token, trader3))
    );
    // seed tokens trader4
    await Promise.all(
        [dai, bat, rep, zrx, knt].map(token => seedTokenBalance(token, trader4))
    );

    // helper function to increase time (alternative: @openzeppelin/test-helpers)
    const increaseTime = async (seconds) => {
        await web3.currentProvider.send({
            jsonrpc: '2.0',
            method: 'evm_increaseTime',
            params: [seconds],
            id: 0
        }, () => {});
        await web3.currentProvider.send({
            jsonrpc: '2.0',
            method: 'evm_mine',
            params: [],
            id: 0
        }, () => {});
    }

    // create mock trades
    await dex.createLimitOrder(BAT, 1000, 10, SIDE.BUY, {from: trader1});
    await dex.createMarketOrder(BAT, 1000, SIDE.SELL, {from: trader2});
    await increaseTime(1);
    await dex.createLimitOrder(BAT, 1200, 11, SIDE.BUY, {from: trader1});
    await dex.createMarketOrder(BAT, 1200, SIDE.SELL, {from: trader2});
    await increaseTime(1);
    await dex.createLimitOrder(BAT, 1200, 15, SIDE.BUY, {from: trader1});
    await dex.createMarketOrder(BAT, 1200, SIDE.SELL, {from: trader2});
    await increaseTime(1);
    await dex.createLimitOrder(BAT, 1500, 14, SIDE.BUY, {from: trader1});
    await dex.createMarketOrder(BAT, 1500, SIDE.SELL, {from: trader2});
    await increaseTime(1);
    await dex.createLimitOrder(BAT, 2000, 12, SIDE.BUY, {from: trader1});
    await dex.createMarketOrder(BAT, 2000, SIDE.SELL, {from: trader2});

    await dex.createLimitOrder(REP, 1000, 2, SIDE.BUY, {from: trader1});
    await dex.createMarketOrder(REP, 1000, SIDE.SELL, {from: trader2});
    await increaseTime(1);
    await dex.createLimitOrder(REP, 500, 4, SIDE.BUY, {from: trader1});
    await dex.createMarketOrder(REP, 500, SIDE.SELL, {from: trader2});
    await increaseTime(1);
    await dex.createLimitOrder(REP, 800, 2, SIDE.BUY, {from: trader1});
    await dex.createMarketOrder(REP, 800, SIDE.SELL, {from: trader2});
    await increaseTime(1);
    await dex.createLimitOrder(REP, 1200, 6, SIDE.BUY, {from: trader1});
    await dex.createMarketOrder(REP, 1200, SIDE.SELL, {from: trader2});

    // create mock orders
    await Promise.all([
        dex.createLimitOrder(BAT, 1400, 10, SIDE.BUY, {from: trader1}),
        dex.createLimitOrder(BAT, 1200, 11, SIDE.BUY, {from: trader2}),
        dex.createLimitOrder(BAT, 1000, 12, SIDE.BUY, {from: trader2}),
        dex.createLimitOrder(REP, 3000, 4, SIDE.BUY, {from: trader1}),
        dex.createLimitOrder(REP, 2000, 5, SIDE.BUY, {from: trader1}),
        dex.createLimitOrder(REP, 500, 6, SIDE.BUY, {from: trader2}),
        dex.createLimitOrder(ZRX, 4000, 12, SIDE.BUY, {from: trader1}),
        dex.createLimitOrder(ZRX, 3000, 13, SIDE.BUY, {from: trader1}),
        dex.createLimitOrder(ZRX, 500, 14, SIDE.BUY, {from: trader2}),
        dex.createLimitOrder(KNT, 2000, 4, SIDE.BUY, {from: trader1}),
        dex.createLimitOrder(KNT, 8000, 3, SIDE.BUY, {from: trader2}),
        dex.createLimitOrder(KNT, 500, 2, SIDE.BUY, {from: trader2}),
        
        dex.createLimitOrder(BAT, 2000, 16, SIDE.SELL, {from: trader3}),
        dex.createLimitOrder(BAT, 3000, 15, SIDE.SELL, {from: trader4}),
        dex.createLimitOrder(BAT, 500, 14, SIDE.SELL, {from: trader4}),
        dex.createLimitOrder(REP, 4000, 10, SIDE.SELL, {from: trader3}),
        dex.createLimitOrder(REP, 2000, 9, SIDE.SELL, {from: trader3}),
        dex.createLimitOrder(REP, 800, 8, SIDE.SELL, {from: trader4}),
        dex.createLimitOrder(ZRX, 1500, 23, SIDE.SELL, {from: trader3}),
        dex.createLimitOrder(ZRX, 1200, 22, SIDE.SELL, {from: trader3}),
        dex.createLimitOrder(ZRX, 900, 21, SIDE.SELL, {from: trader4}),
        dex.createLimitOrder(KNT, 500, 7, SIDE.SELL, {from: trader3}),
        dex.createLimitOrder(KNT, 4000, 6, SIDE.SELL, {from: trader4}),
        dex.createLimitOrder(KNT, 2500, 5, SIDE.SELL, {from: trader4}),
    ]);
}