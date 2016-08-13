import { checkBalanceEquals, checkStakeEquals, checkValueEquals, Rpc, ethToWei } from './utils.js';

contract('StakeCoin#unstake', (accounts) => {
  const [user1, user2] = accounts;
  const deposit = 1;
  const depositInWei = web3.toWei(1, 'ether');

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
  
  it('should unstake coins', () => {
    const stakeCoin = StakeCoin.deployed();
    const [id1, id2] = ['id_1', 'id_2'];
    return Rpc.revertSnapshot()
      .then(() => stakeCoin.stake(id1, ethToWei(0.5)))
      .then(() => stakeCoin.stake(id2, ethToWei(0.5)))
      .then(() => stakeCoin.stake(id1, ethToWei(0.5), {
        from: user2
      }))
      .then(() => stakeCoin.unstake(id1))
      .then(() => {
        const p1 = checkBalanceEquals(stakeCoin, deposit - 0.5, 'Balance should increase by 0.5')
        const p2 = checkValueEquals(stakeCoin, id1, 0.5, 'Value of id_1 should reduce by 0.5')
        const p3 = checkStakeEquals(stakeCoin, user1, id1, 0, 'stakeOf user1 on id1 should zero')

        return Promise.all([p1, p2, p3])
      })
      .then(() => stakeCoin.unstake(id1))
      .then(() => {
        const p1 = checkBalanceEquals(stakeCoin, deposit - 0.5, 'Should be no-op')
        const p2 = checkValueEquals(stakeCoin, id1, 0.5, 'Should be no-op')
        const p3 = checkStakeEquals(stakeCoin, user1, id1, 0, 'Should be no-op')

        return Promise.all([p1, p2, p3])
      })
      .then(() => stakeCoin.unstake(id2))
      .then(() => {
        const p1 = checkBalanceEquals(stakeCoin, deposit, 'Balance should increase by another 0.5')
        const p2 = checkValueEquals(stakeCoin, id2, 0, 'Value of id_2 should reduce by 0.5')
        const p3 = checkStakeEquals(stakeCoin, user1, id2, 0, 'stakeOf user1 on id2 should zero')

        return Promise.all([p1, p2, p3])
      })
  })
})