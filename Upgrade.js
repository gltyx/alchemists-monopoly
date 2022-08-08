class Upgrade
{
    constructor({
        saveID,     // unique string
        currency,   // object {get: () => num, set: (num) => none}
        costFunc,   // function of cumulative cost (from level 0 to level n)
        inverseCostFunc, // function level over cummulative cost
        effectFunc, // function of upgrade's effect (at level <n>)
        contentFunc, // function of string to display (upgrade) => string
        maxLevel,   // max level, default no max
        afterBuy,      // callback function after upgrade is bought
        isVisible,
        parent = document.body,
    })
    {
        this.button = new Button({
            contentUpdate: () => this.contentFunc(this),
            onclick: () => this.buy(),
            isEnabled: () => this.canBuy(),
            isVisible: isVisible,
            parent: parent
        });

        this.saveID = saveID;
        this.currency = currency;
        this.costFunc = costFunc;
        this.inverseCostFunc = inverseCostFunc;
        this.effectFunc = effectFunc;
        this.contentFunc = contentFunc;
        this.maxLevel = maxLevel;
        state[this.saveID] ??= new num(0);
        this.level = state[this.saveID];
        this.afterBuy = afterBuy;
    }

    // method buys upgrade
    buy()
    {
        if (this.canBuy())
        {
            let levels = this.levelsToBuy(), cost = this.cost();
            // update
            this.currency.suba(cost);
            this.level.adda(levels);
            this.afterBuy?.(this, levels);
        }
    }

    // method returns cost of upgrade
    cost()
    {
        let newLevel = this.level.add(this.levelsToBuy());
        return this.costFunc(newLevel).sub(this.costFunc(this.level));
    }

    // method returns true if upgrade can be bought
    canBuy()
    {
        return this.currency.get().gte(this.cost());
    }

    // method returns levels trying to buy
    levelsToBuy()
    {
        if(buyAmount.max)
            return this.inverseCostFunc(this.currency.get().mul(buyAmount.amount).add(this.costFunc(this.level))).sub(this.level).floor().max(1);
        else
            return _n(buyAmount.amount);
    }

    // method returns current effect of upgrade
    effect()
    {
        return this.effectFunc(this.level);
    }
}


// function for an exponential upgrade following a geometric series
function exponentialSum(baseCost, ratio)
{
    return l => new num(ratio).pow(l).sub(1).mul(baseCost).div(ratio - 1);
}

// function for getting max level which can be gotten with an exponential cost
function inverseExponentialSum(baseCost, ratio)
{
    return c => c.mul(ratio - 1).div(baseCost).add(1).log10().div(Math.log10(ratio));
}