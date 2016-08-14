# StakeCoin

Proof of Stake in various systems for social identities. 

The rationale behind StakeCoin is to reduce the noise in social platforms like Reddit (especially during the Hard Fork incident), by allowing users to stake Ether on an ID (e.g. /u/reddituser). This allows users to see how much stake a user has in the Ethereum ecosystem to make a better judgment on said person's opinions.

StakeCoin is converted from other currency (currently only Ether). To convert back, one will have request for a withdrawal and await a countdown, currently set to be 5 days. Someone who has StakeCoins converted from Ether is willingly freezing his/her Ether for at least 5 days, risking price volatility and showing his/her commitment to the Ethereum ecosystem.

## How it works
1. Deposit by sending some Ether to this contract.
2. Call `stake()` with a string identifier, e.g. /u/zweicoder, an the amount to stake. Feel free to stake some ETH on someone else's username!
3. Install plugin to see everyone's stakes on reddit? (KIV)

## Trying it out
It's currently deployed in the testnet at `0x9Dc3F7FE259ab431B78725F92e6e9adF90C54558`

Copy the JSON interface into Mist to test it out on Morden testnet!
```
[ { "constant": true, "inputs": [], "name": "getBalance", "outputs": [ { "name": "balance", "type": "uint256", "value": "2000000000000000000" } ], "type": "function" }, { "constant": true, "inputs": [ { "name": "user", "type": "address" }, { "name": "id", "type": "string" } ], "name": "getStake", "outputs": [ { "name": "staked", "type": "uint256", "value": "0" } ], "type": "function" }, { "constant": false, "inputs": [], "name": "commitSudoku", "outputs": [], "type": "function" }, { "constant": true, "inputs": [], "name": "MIN_LOCK_PERIOD", "outputs": [ { "name": "", "type": "uint256", "value": "432000" } ], "type": "function" }, { "constant": false, "inputs": [], "name": "withdraw", "outputs": [], "type": "function" }, { "constant": false, "inputs": [ { "name": "_amount", "type": "uint256" } ], "name": "unlock", "outputs": [], "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "address" } ], "name": "balanceOf", "outputs": [ { "name": "", "type": "uint256", "value": "0" } ], "type": "function" }, { "constant": true, "inputs": [ { "name": "user", "type": "address" } ], "name": "getWithdrawalStatus", "outputs": [ { "name": "amount", "type": "uint256", "value": "0" }, { "name": "unlockedAt", "type": "uint256", "value": "0" } ], "type": "function" }, { "constant": true, "inputs": [ { "name": "id", "type": "string" } ], "name": "getValueOf", "outputs": [ { "name": "totalValue", "type": "uint256", "value": "0" } ], "type": "function" }, { "constant": false, "inputs": [ { "name": "numDays", "type": "uint256" } ], "name": "setLockPeriod", "outputs": [], "type": "function" }, { "constant": false, "inputs": [ { "name": "id", "type": "string" }, { "name": "amount", "type": "uint256" } ], "name": "stake", "outputs": [], "type": "function" }, { "constant": true, "inputs": [], "name": "timeOfDeath", "outputs": [ { "name": "", "type": "uint256", "value": "0" } ], "type": "function" }, { "constant": false, "inputs": [], "name": "deposit", "outputs": [], "type": "function" }, { "constant": false, "inputs": [ { "name": "id", "type": "string" } ], "name": "unstake", "outputs": [], "type": "function" }, { "inputs": [], "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "timeOfDeath", "type": "uint256" } ], "name": "Event_Selfdestructing", "type": "event" } ]
```