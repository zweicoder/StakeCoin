var TestRPC = require("ethereumjs-testrpc");
var server = TestRPC.server();
var port = 8545;

function setTime(newTime) {
  Date.prototype.getTime = function() {
    return newTime;
  }
}

server.listen(port, function(err, blockchain) {
  if (err) {
    console.log(err);
    return;
  }
  console.log("");
  console.log("Available Accounts");
  console.log("==================");

  var accounts = blockchain.accounts;
  var addresses = Object.keys(accounts);

  addresses.forEach(function(address, index) {
    console.log("(" + index + ") " + address);
  });

  console.log("");
  console.log("Private Keys");
  console.log("==================");

  addresses.forEach(function(address, index) {
    console.log("(" + index + ") " + accounts[address].secretKey.toString("hex"));
  });

  console.log("");
  console.log("HD Wallet");
  console.log("==================");
  console.log("Mnemonic:      " + blockchain.mnemonic);
  console.log("Base HD Path:  " + blockchain.wallet_hdpath + "/{account_index}")


  console.log("");
  console.log("Listening on localhost:" + port);

});

var backdoor = require('http').createServer((request, response) => {
  var headers = request.headers;
  var method = request.method;
  var url = request.url;
  var body = [];
  request.on('error', function(err) {
    // console.error(err);
  }).on('data', function(chunk) {
    body.push(chunk);
  }).on('end', function() {
    body = Buffer.concat(body).toString();
    switch (method) {
      case 'POST':
        var payload;
        payload = JSON.parse(body);
        if (payload.time) {
          console.log('Setting time to: ', payload.time);
          setTime(payload.time * 1000);
          return response.end('')
        }

        break;
      default:
        return;
    }
  })
})

backdoor.listen(port + 1, (err) => {
  if (err) console.err(err)
})