import { checkBalanceEquals, checkStakeEquals, checkValueEquals, Rpc, ethToWei } from './utils.js';

contract('StakeCoin#unlock', (accounts) => {
  const [user1, user2] = accounts;
  const deposit = 1;
  const depositInWei = web3.toWei(1, 'ether');
  const days = 24 * 60 * 60; // num of seconds in a day
  const now = 1000;
  function revertToStart() {
    return Rpc.revertSnapshot()
      .then(() => Rpc.setTime(now))
  }

  it('should setup', () => {
    const stakeCoin = StakeCoin.deployed();
    return stakeCoin.deposit({
      from: user1,
      value: depositInWei
    })
      .then(() => stakeCoin.deposit({
        from: user2,
        value: depositInWei
      }))
      .then(() => Rpc.saveSnapshot())
  })

  it('should unlock all of the balance if amount > balance', () => {
    const stakeCoin = StakeCoin.deployed();
    return revertToStart()
      .then(() => stakeCoin.unlock(ethToWei(1.1)))
      .then(() => stakeCoin.getWithdrawalStatus(user1))
      .then((res) => {
        const [amount, unlockedAt] = res;
        const unlockedAmount = web3.fromWei(amount.toNumber(), 'ether');
        assert.equal(unlockedAmount, 1, 'It should unlock all balance');
        assert.equal(unlockedAt.toNumber(), 5 * days + now);
      })
      .then(() => checkBalanceEquals(stakeCoin, 0, 'Balance should be zeroed for withdrawal'))
  })

  it('should unlock the amount requested if amount > balance', () => {
    const stakeCoin = StakeCoin.deployed();
    const amountRequested = 0.5;
    return revertToStart()
      .then(() => stakeCoin.unlock(ethToWei(amountRequested)))
      .then(() => stakeCoin.getWithdrawalStatus(user1))
      .then((res) => {
        const [amount, unlockedAt] = res;
        const unlockedAmount = web3.fromWei(amount.toNumber(), 'ether');
        assert.equal(unlockedAmount, amountRequested, 'It should unlock 0.5 eth');
        assert.equal(unlockedAt.toNumber(), 5 * days + now, 'It should only unlock 5 days later');
      })
  })

  it('should update the unlocked date upon another valid unlock request', () => {
    const stakeCoin = StakeCoin.deployed();
    const secondRequestTime = now + 6;
    return revertToStart()
      .then(() => stakeCoin.unlock(ethToWei(0.25)))
      .then(() => stakeCoin.getWithdrawalStatus(user1))
      .then(() => Rpc.setTime(secondRequestTime))
      .then(() => stakeCoin.unlock(ethToWei(0.75)))
      .then(() => stakeCoin.getWithdrawalStatus(user1))
      .then((res) => {
        const [amount, unlockedAt] = res;
        const unlockedAmount = web3.fromWei(amount.toNumber(), 'ether');
        const updatedTime = ((5 * days + now) * 0.25) / 1 + ((secondRequestTime + 5 * days) * 0.75) / 1;
        assert.equal(unlockedAmount, 1, 'It should unlock 1 eth');
        // Floor cause of how solidity handles division
        assert.equal(unlockedAt.toNumber(), Math.floor(updatedTime), 'Updated unlocked time should be based on the proportion of unlocked amounts');
      })
  })

  it('should update the unlocked date upon another valid unlock request', () => {
    const stakeCoin = StakeCoin.deployed();
    const secondRequestTime = now + 6000;
    return revertToStart()
      .then(() => stakeCoin.unlock(ethToWei(0.25)))
      .then(() => stakeCoin.getWithdrawalStatus(user1))
      .then(() => Rpc.setTime(secondRequestTime))
      .then(() => stakeCoin.unlock(ethToWei(0.75)))
      .then(() => stakeCoin.getWithdrawalStatus(user1))
      .then((res) => {
        const [amount, unlockedAt] = res;
        const unlockedAmount = web3.fromWei(amount.toNumber(), 'ether');
        const updatedTime = ((5 * days + now) * 0.25) / 1 + ((secondRequestTime + 5 * days) * 0.75) / 1;
        assert.equal(unlockedAmount, 1, 'It should unlock 1 eth');
        assert.equal(unlockedAt.toNumber(), Math.floor(updatedTime), 'Updated unlocked time should be based on the proportion of unlocked amounts');
      })
  })
})