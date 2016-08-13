import { checkBalanceEquals, checkStakeEquals, checkValueEquals, Rpc, ethToWei } from './utils.js';

contract('StakeCoin#withdraw', (accounts) => {
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

  it('should not withdraw when funds are still frozen', () => {
    const stakeCoin = StakeCoin.deployed();
    let balance;
    return revertToStart()
      .then(() => stakeCoin.unlock(ethToWei(0.6)))
      .then(() => Rpc.setTime(now + 5 * days - 1))
      .then(() => stakeCoin.withdraw())
      .then(() => stakeCoin.getWithdrawalStatus(user1))
      .then((res) => {
        assert.fail(0, 1);
      }, (err) => {
        assert.isOk(err);
      })
  })

  it('should withdraw all balance when unfrozen', () => {
    const stakeCoin = StakeCoin.deployed();
    let balance;
    return revertToStart()
      .then(() => stakeCoin.unlock(ethToWei(0.6)))
      .then(() => Rpc.setTime(now + 5 * days + 1))
      .then(() => web3.eth.getBalance(user1))
      .then((bal) => {
        balance = bal;
      })
      .then(() => stakeCoin.withdraw())
      .then(() => stakeCoin.getWithdrawalStatus(user1))
      .then((res) => {
        const [amount, unlockedAt] = res;
        const unlockedAmount = web3.fromWei(amount.toNumber(), 'ether');
        assert.equal(unlockedAmount, 0, 'It should zero the withdrawal');
      })
      .then(() => web3.eth.getBalance(user1))
      .then((newBalance) => {
        const amountSentToWallet = web3.fromWei(newBalance - balance, 'ether')
        // Gas in solidity causes amount sent to wallet to be lower
        assert.isOk(withinRange(amountSentToWallet, 0.6, 0.1), 'user1 should get back his 0.6 eth')
      })
  })

})

function withinRange(a, b, range) {
  return Math.abs(a - b) <= range
}