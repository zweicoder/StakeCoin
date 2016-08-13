import { checkBalanceEquals } from './utils.js'

contract('StakeCoin#deposit', (accounts) => {
  const [user1, user2] = accounts;
  const deposit = 1;
  const depositInWei = web3.toWei(deposit, 'ether');

  it('should deposit the correct amounts', () => {
    const stakeCoin = StakeCoin.deployed();
    return stakeCoin.deposit({
      from: user1,
      value: depositInWei
    })
      .then(() => stakeCoin.deposit({
        from: user2,
        value: depositInWei
      }))
      .then(() => checkBalanceEquals(stakeCoin, 1, 'Balance of user1 should be 1', {
        from: user1
      }))
      .then(() => checkBalanceEquals(stakeCoin, 1, 'Balance of user2 should be 1', {
        from: user2
      }))
  })
})