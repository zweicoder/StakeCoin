contract StakeCoin {
    mapping(string => uint) valueOf; // amount of a string from all the stakes placed
    mapping(address => uint) balanceOf; // balance of a user
    mapping(address => mapping(string => uint)) stakeOf; // Stake of a user given to a string identifier
    mapping(address => LockedFunds) withdrawals;
    address developer;
    uint public timeOfDeath;
    uint public MIN_LOCK_PERIOD = 5 days;
    event Event_Selfdestructing(uint timeOfDeath);

    struct LockedFunds {
        uint amount;
        uint unlockedAt;
    }

    modifier onlyDev() {
        if(msg.sender != developer) throw;
        _
    }

    function StakeCoin() {
        developer = msg.sender;
    }

    /// @notice Stake an `amount` of your coins on an `id`.
    /// @param id The identifier you want to stake your coins on. Can be your own reddit username or others (e.g. /u/zweicoder@reddit).
    /// @param amount The amount of Wei to stake
    function stake(string id, uint amount) external {
        if (balanceOf[msg.sender] < amount) throw;

        balanceOf[msg.sender] -= amount;
        valueOf[id] += amount;
        stakeOf[msg.sender][id] += amount;
    }

    /// @notice Unstakes everything you have from the given `id`.
    /// @param id The identifier to unstake from
    function unstake(string id) external {
        var amount = stakeOf[msg.sender][id];
        balanceOf[msg.sender] += amount;
        valueOf[id] -= amount;
        stakeOf[msg.sender][id] = 0;
    }

    /// @notice Transfers `amount` from unstaked funds in `balanceOf` to `withdrawals` for withdrawal after the `MIN_LOCK_PERIOD`. If amount is larger than available balance, this unlocks all of it.
    /// @param _amount The amount you want to unlock. Unlocks everything
    function unlock(uint _amount) external {
        var amount = min(_amount, balanceOf[msg.sender]);

        balanceOf[msg.sender] -= amount;
        if (withdrawals[msg.sender].amount == 0) {
            withdrawals[msg.sender] = LockedFunds(amount, now + MIN_LOCK_PERIOD);
            return;
        }

        LockedFunds funds = withdrawals[msg.sender];
        uint newAmount = funds.amount + amount;
        uint unlockedAt = (funds.unlockedAt * funds.amount) / newAmount + ((now + MIN_LOCK_PERIOD) * amount) / newAmount;
        withdrawals[msg.sender] = LockedFunds(newAmount, unlockedAt);

    }

    /// @notice Withdraw all unfrozen funds from `withdrawals`
    function withdraw() external {
        if (now > withdrawals[msg.sender].unlockedAt) throw;

        msg.sender.send(withdrawals[msg.sender].amount);
    }

    /// @notice Deposit the amount sent with this transaction to be converted as `StakeCoin`
    function deposit() {
        balanceOf[msg.sender] += msg.value;
    }

    // In case it's too harsh
    function setLockPeriod(uint numDays) external onlyDev {
        MIN_LOCK_PERIOD = numDays * 1 days;
    }

    // Fair warning before commiting seppuku
    function commitSudoku() external onlyDev {
        if (timeOfDeath == 0) {
            timeOfDeath = now + 14 days;
            Event_Selfdestructing(timeOfDeath);
            return;
        }

        if (now > timeOfDeath) {
            selfdestruct(developer);
        }
    }

    function () {
        deposit();
    }

    function getBalance() constant returns(uint balance) {
        return balanceOf[msg.sender];
    }

    function getValueOf(string id) constant returns(uint totalValue){
        return valueOf[id];
    }

    function getStake(address user, string id) constant returns(uint staked) {
        // This inconsistency in allowing to specify user is for flexibility so we can use this for things other than reddit usernames
        return stakeOf[user][id];
    }

    function getWithdrawalStatus(address user) constant returns(uint amount, uint unlockedAt) {
        return (withdrawals[user].amount, withdrawals[user].unlockedAt);
    }

    function min(uint a, uint b) constant internal returns(uint) {
        return a < b ? a : b;
    }
}
