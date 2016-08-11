import utils from './utils.js';

contract('StakeCoin#stake', (accounts) => {
  const user = accounts[0];
  const deposit = 1;
  const depositInWei = web3.toWei(deposit, 'ether');
  const id = 'stakeCoin';

  it('should setup', () => {
    const stakeCoin = StakeCoin.deployed();
    return stakeCoin.deposit({
      from: user,
      value: depositInWei
    }).then(() => utils.saveSnapshot())
  })

  it('should fail to stake above sender balance', () => {
    const stakeCoin = StakeCoin.deployed();
    return stakeCoin.stake(id, deposit + 1)
      .then(() => {
        assert.fail(0, 1)
      }, (e) => {
        assert.isOk(e)
      })
  })

  it('should stake coins on a string identifier', () => {
    const stakeCoin = StakeCoin.deployed();
    const amountStaked = deposit;
    return stakeCoin.stake(id, amountStaked)
      .then(() => {
        const p1 = stakeCoin.getBalanceInEth.call()
          .then((balance) => assert.equal(balance, deposit - amountStaked, 'Balance should reduce by the amount staked'))

        const p2 = stakeCoin.getValueOf.call(id)
          .then((value) => assert.equal(value, amountStaked, 'Value of id should increase due to amount staked'))

        const p3 = stakeCoin.getStake.call(user, id)
          .then((amount) => assert.equal(amount, amountStaked), 'stakeOf user on id should increase')

        return Promise.all([p1, p2, p3])
      })
  })

  it('should revert to saved snapshot', () => {
    const stakeCoin = StakeCoin.deployed();
    return utils.revertSnapshot()
      .then(() => stakeCoin.getBalanceInEth.call())
      .then((balance) => assert.equal(balance, deposit))
  })
})