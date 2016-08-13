import {checkBalanceEquals, checkStakeEquals, checkValueEquals, Rpc, ethToWei} from './utils.js';

contract('StakeCoin#stake', (accounts) => {
  const [user1, user2] = accounts;
  const deposit = 1;
  const depositInWei = web3.toWei(1, 'ether');
  const id = 'stakeCoin';

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

  it('should fail to stake above sender balance', () => {
    const stakeCoin = StakeCoin.deployed();
    return stakeCoin.stake(id, ethToWei(1.1))
      .then(() => {
        assert.fail(0, 1)
      }, (e) => {
        assert.isOk(e)
      })
      .then(() => checkBalanceEquals(stakeCoin, 1, 'Balance of user1 should be 1', {
        from: user1
      })
    )
      .then(() => checkBalanceEquals(stakeCoin, 1, 'Balance of user2 should be 1', {
        from: user2
      }))

  })

  it('should stake some coins', () => {
    const stakeCoin = StakeCoin.deployed();
    return stakeCoin.stake(id, depositInWei)
      .then(() => {
        const p1 = checkBalanceEquals(stakeCoin, 0, 'Balance should reduce be zero', {
          from: user1
        })
        const p2 = checkValueEquals(stakeCoin, id, 1, 'Value of id should increase by 1')
        const p3 = checkStakeEquals(stakeCoin, user1, id, 1, 'stakeOf user1 on id should increase by 1')

        return Promise.all([p1, p2, p3])
      })
  })

  it('should revert to saved snapshot', () => {
    const stakeCoin = StakeCoin.deployed();
    return Rpc.revertSnapshot()
      .then(() => stakeCoin.getBalance.call())
      .then(()=> checkBalanceEquals(stakeCoin, deposit, 'Balance should be reverted'))
  })

  it('should allow repeated staking on same string identifiers', () => {
    const stakeCoin = StakeCoin.deployed();
    const amountStaked = 0.5;
    return Rpc.revertSnapshot()
      .then(() => stakeCoin.stake(id, ethToWei(amountStaked) ))
      .then(() => {
        const p1 = checkBalanceEquals(stakeCoin, deposit - amountStaked, 'Balance should reduce by 0.5', {
          from: user1
        })
        const p2 = checkValueEquals(stakeCoin, id, amountStaked, 'Value of id should increase by 0.5')
        const p3 = checkStakeEquals(stakeCoin, user1, id, amountStaked, 'stakeOf user1 on id should increase by 0.5')

        return Promise.all([p1, p2, p3])
      })
      .then(() => stakeCoin.stake(id, ethToWei(amountStaked)))
      .then(() => {
        const p1 = checkBalanceEquals(stakeCoin, deposit - 1, 'Balance should reduce by another 0.5', {
          from: user1
        })
        const p2 = checkValueEquals(stakeCoin, id, 1, 'Value of id should increase by another 0.5')
        const p3 = checkStakeEquals(stakeCoin, user1, id, 1, 'stakeOf user1 on id should increase by another 0.5')

        return Promise.all([p1, p2, p3])
      })
  })

  it('should allow staking on different string identifiers', () => {
    const stakeCoin = StakeCoin.deployed();
    const [id1, id2] = ['id_1', 'id_2'];
    return Rpc.revertSnapshot()
      .then(() => stakeCoin.stake(id1, ethToWei(0.25)))
      .then(() => stakeCoin.stake(id2, ethToWei(0.25)))
      .then(() => {
        const p1 = checkBalanceEquals(stakeCoin, deposit - 0.5, 'Balance should reduce by the amount staked')
        const p2 = checkValueEquals(stakeCoin, id1, 0.25, 'Value of id_1 should increase by 0.25')
        const p3 = checkStakeEquals(stakeCoin, user1, id1, 0.25, 'stakeOf user1 on id_1 should increase by 0.25')
        const p4 = checkValueEquals(stakeCoin, id2, 0.25, 'Value of id_2 should increase by 0.25')
        const p5 = checkStakeEquals(stakeCoin, user1, id2, 0.25, 'stakeOf user1 on id_2 should increase by 0.25')

        return Promise.all([p1, p2, p3, p4, p5])
      })
  })

  it('should unstake coins', () => {
    const stakeCoin = StakeCoin.deployed();
    const [id1, id2] = ['id_1', 'id_2'];
    return Rpc.revertSnapshot()
      .then(() => stakeCoin.stake(id1, ethToWei(0.5)))
      .then(() => stakeCoin.stake(id2, ethToWei(0.5)))
      .then(() => stakeCoin.unstake(id1))
      .then(() => {
        const p1 = checkBalanceEquals(stakeCoin, deposit - 0.5, 'Balance should increase by 0.5')
        const p2 = checkValueEquals(stakeCoin, id1, 0, 'Value of id_1 should reduce by 0.5')
        const p3 = checkStakeEquals(stakeCoin, user1, id1, 0, 'stakeOf user1 on id1 should zero')

        return Promise.all([p1, p2, p3])
      })
      .then(() => stakeCoin.unstake(id1))
      .then(() => {
        const p1 = checkBalanceEquals(stakeCoin, deposit, 'Balance should increase by another 0.5')
        const p2 = checkValueEquals(stakeCoin, id2, 0, 'Value of id_2 should reduce by 0.5')
        const p3 = checkStakeEquals(stakeCoin, user1, id2, 0, 'stakeOf user1 on id2 should zero')

        return Promise.all([p1, p2, p3])
      })
  })

  it('should allow multiple users to stake on an identifier', () => {
    const stakeCoin = StakeCoin.deployed();
    const [id1, id2] = ['id_1', 'id_2'];
    const [user1, user2] = accounts;
    return Rpc.revertSnapshot()
      .then(() => stakeCoin.stake(id1, ethToWei(1), {
        from: user1
      }))
      .then(() => stakeCoin.stake(id1, ethToWei(0.5), {
        from: user2
      }))
      .then(() => stakeCoin.stake(id2, ethToWei(0.3), {
        from: user2
      }))
      .then(() => {
        const p1 = checkBalanceEquals(stakeCoin, 0, 'Balance of user1 should reduce by 1', {
          from: user1
        })
        const p2 = checkBalanceEquals(stakeCoin, 0.2, 'Balance of user2 should reduce by 0.8', {
          from: user2
        })
        const p3 = checkValueEquals(stakeCoin, id1, 1.5, 'Value of id1 should increase by 1.5 from user1 and user2')
        const p4 = checkValueEquals(stakeCoin, id2, 0.3, 'Value of id2 should increase by 0.3')
        const p5 = checkStakeEquals(stakeCoin, user1, id1, 1, 'Stake of user1 on id1 should be 1')
        const p6 = checkStakeEquals(stakeCoin, user2, id1, 0.5, 'Stake of user2 on id1 should be 0.5')
        const p7 = checkStakeEquals(stakeCoin, user2, id2, 0.3, 'Stake of user2 on id2 should be 0.3')
          .then((value) => assert.equal(value, val, message))

        return Promise.all([p1, p2, p3, p4, p5, p6, p7])
      })
  })

})