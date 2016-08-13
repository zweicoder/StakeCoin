export function checkValueEquals(stakeCoin, id, val, message) {
  return stakeCoin.getValueOf.call(id)
    .then((value) => assert.equal(web3.fromWei(value.toNumber(), 'ether'), val, message))
}

export function checkBalanceEquals(stakeCoin, val, message, kwargs) {
  kwargs = kwargs || {};
  return stakeCoin.getBalance.call(kwargs)
    .then((value) => assert.equal(web3.fromWei(value.toNumber(), 'ether'), val, message))
}

export function checkStakeEquals(stakeCoin, user, id, val, message) {
  return stakeCoin.getStake.call(user, id)
    .then((amount) => assert.equal(web3.fromWei(amount.toNumber(), 'ether'), val, message))
}

function rpc(method, arg) {
  var req = {
    jsonrpc: "2.0",
    method: method,
    id: new Date().getTime()
  };
  if (arg)
    req.params = arg;

  return new Promise((resolve, reject) => {
    web3.currentProvider.sendAsync(req, (err, result) => {
      if (err) return reject(err)
      if (result && result.error) {
        return reject(new Error("RPC Error: " + (result.error.message || result.error)))
      }
      resolve(result)
    })
  })
}

const Rpc = {
  snap: null,
  saveSnapshot() {
    return rpc('evm_snapshot')
      .then((res) => {
        this.snap = res.result;
      })
  },

  revertSnapshot() {
    return rpc('evm_revert', [this.snap])
  },

  setTime(newTime) {
    const baseURL = 'http://localhost:8546'
    return axios.post(baseURL, {
      time: newTime
    })
  }
}

export {Rpc}

export function ethToWei(x) {
  return web3.toWei(x, 'ether')
}