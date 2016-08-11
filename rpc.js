var TestRPC = require("ethereumjs-testrpc");
var server = TestRPC.server();
var port = 8545;

function setTime(newTime) {
  Date.prototype.getTime = function() {
    return newTime;
  }
}

server.listen(port, function(err, blockchain) {
  console.log('Listening on ', port);
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
            console.log('Setting time to: ',payload.time);
            setTime(payload.time * 1000);
            return response.end('')
        }

        break;
      default:
        return;
    }
  })
})

backdoor.listen(port+1, (err)=>{
    if (err) console.err(err)
})