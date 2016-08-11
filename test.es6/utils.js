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

export default {
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