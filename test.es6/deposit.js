contract('StakeCoin#deposit', (accounts) => {
  const user = accounts[0];
  const deposit = 1;
  const depositInWei = web3.toWei(deposit, 'ether');
  it('should update balances after depositing', () => {
    const stakeCoin = StakeCoin.deployed();
    return stakeCoin.deposit({
      from: user,
      value: depositInWei
    })
      .then(() => stakeCoin.getBalanceInEth.call())
      .then((balance) => {
        assert.equal(balance.toNumber(), deposit, 'Deposit should be the same amount');
      })
  })
})