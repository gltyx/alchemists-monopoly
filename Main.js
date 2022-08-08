var state = {
    money: _n(0),
    totalMoney: _n(0),
    stone: _n(0),
    mana: _n(0),
    milestone: 0,
    prestige: 0,
    prestigeStoneGain: _n(0),
    soulPotionUsesSouls: true
};
load();
startAutosave();

// function for updating the game
let prevTime = performance.now();
let dt = 0;
function loop()
{
    dt = (performance.now() - prevTime) / 1e3;
    prevTime += dt * 1e3;
}
updateList.push(loop);

let buyAmount;
// function for game and UI setup
(function setup(){
    createProgressBar();
    setupResourceUI();
    setupSettings();
    setupDialogueUI();

    buyAmount = new BuyAmountSelector();
    
    // Mining
    new Button({
        contentUpdate: () => `Mine 1 Stone`,
        onclick: mine,
        elementOptions: {
            onmousedown: startClicker,
            onmouseup: endClicker,
            onmouseleave: endClicker,
            onkeydown: (e) => {
                startClicker();
                e.preventDefault();
            },
            onkeyup: (e) => {
                endClicker();
                mine();
                e.preventDefault();
            },
        }
    });
    new Element({
        type: "label",
        contentUpdate: () => `Luck: ${luck()}<br/>Base stone gain: ${stoneLuckMultiplier()}<br/>Base coal gain: ${coalLuckMultiplier().toString(4)}`,
        style: {
            position: "absolute",
            top: "130px",
            right: "25px",
            marginBottom: "15px",
        },
        isVisible: () => luck().gt(0),
    });
    new Button({
        contentUpdate: () => `Deal with the devil<br/>+${stonesOnPrestige().toFixed()} ???????????????????<br/>(next: ${moneyToNextStone()}$)`,
        onclick: prestige,
        isVisible: () => state.milestone >= 4,
        style: {
            position: "absolute",
            top: "225px",
            right: "15px"
        }
    });

    new Element({type: "br"});

    // UI
    new Element({
        type: "label",
        contentUpdate: () => `Money: ${formatMoney(state.money)}`
    });
    new Element({type: "br"});

    // workers
    let b = 1/400, p = 3, o = 13.5;
    let m = b / ((o + 1) ** p - o ** p);
    minerUpgrade = new Upgrade({
        saveID: "u0",
        currency: state.money,
        costFunc: (level) => level.add(o).pow(p).mul(m),
        inverseCostFunc: (currency) => currency.div(m).pow(1/p).sub(o), 
        effectFunc: (level) => level.copy(),
        contentFunc: (upgrade) => `Get Miner x${upgrade.levelsToBuy().toFixed()}<br/>Cost: ${formatMoney(upgrade.cost())}<br/>Current amount: ${upgrade.effect().toFixed()}`,
        afterBuy: (upgrade, levels) => state.soul.adda(levels),
        isVisible: () => state.totalMoney.gt(0.1 * 0.01)
    });
    let b2 = 0.05, p2 = 3.6, o2 = 13;
    let m2 = b2 / ((o2 + 1) ** p2 - o2 ** p2);
    woodcutterUpgrade = new Upgrade({
        saveID: "u1",
        currency: state.money,
        costFunc: (level) => level.add(o2).pow(p2).mul(m2),
        inverseCostFunc: (currency) => currency.div(m2).pow(1/p2).sub(o2), 
        effectFunc: (level) => level.copy(),
        contentFunc: (upgrade) => `Get Woodcutter x${upgrade.levelsToBuy().toFixed()}<br/>Cost: ${formatMoney(upgrade.cost())}<br/>Current amount: ${upgrade.effect().toFixed()}`,
        afterBuy: (upgrade, levels) => state.soul.adda(levels),
        isVisible: () => state.milestone >= 2
    });

    new Element({
        type: "h3", 
        content: "Resources", 
        parent: elementTable, 
        className: "itemCategoryTitle"
    });
    new Resource({
        name: "stone",
        description: "Mining rocks is hard work!",
        productionFunction: () => minerUpgrade.effect().mul(workerBoost()).mul(stoneLuckMultiplier()),
        sellValue: 0.0001,
        isVisible: () => state.milestone >= 0
    });
    new Resource({
        name: "coal",
        description: "What you'll get next christmas...",
        productionFunction: () => minerUpgrade.effect().mul(workerBoost()).mul(coalLuckMultiplier()),
        sellValue: 0.0025,
        isVisible: () => luck().gt(0)
    });
    new Resource({
        name: "diamond",
        description: "A money-lover's best friend",
        recipe: {coal: 1000000, mana: 1000},
        sellValue: 7500,
        isVisible: () => state.milestone >= 6
    });
    new Resource({
        name: "wood",
        description: "A good material for crafting.",
        productionFunction: () => woodcutterUpgrade.effect().mul(0.2).mul(workerBoost()),
        sellValue: 0.001,
        isVisible: () => state.milestone >= 2
    });
    clover = new Resource({
        name: "clover",
        description: "It's believed to bring good luck, and probably also good in a salad?",
        recipe: {money: 1},
        effectFunc: (l) => l.add(5).pow(0.25).mul(5).sub(5 ** 1.25).div(5 * 6 ** 0.25 - 5 ** 1.25),
        effectContent: (r) => `+${r.effect()} Luck`,
        isVisible: () => state.milestone >= 3,
    });
    new Element({type: "br", parent: elementTable, isVisible: () => state.milestone >= 1});
    new Element({
        type: "h3", 
        content: "Metals", 
        parent: elementTable, 
        className: "itemCategoryTitle",
        isVisible: () => state.milestone >= 1
    });
    new Resource({
        name: "iron",
        recipe: {stone: 100, mana: 1},
        description: "A simple metal for an alchemist to create.",
        sellValue: 0.015,
        isVisible: () => state.milestone >= 1
    });
    new Resource({
        name: "silver",
        recipe: {iron: 100, mana: 10},
        description: "A rare metal.",
        sellValue: 3,
        isVisible: () => state.milestone >= 3
    });
    new Resource({
        name: "gold",
        recipe: {silver: 100, mana: 100},
        description: "Expensive shiny butter.",
        sellValue: 600,
        isVisible: () => state.milestone >= 5
    });
    new Element({type: "br", parent: elementTable, isVisible: () => state.milestone >= 2});
    new Element({
        type: "h3", 
        content: "Tools", 
        parent: elementTable, 
        className: "itemCategoryTitle",
        isVisible: () => state.milestone >= 2
    });
    pickaxe = new Resource({
        name: "pick-axe",
        recipe: {iron: 5, wood: 40},
        description: "When a pickaxe and an axe love each other...",
        sellValue: 0.05,
        effectFunc: (l) => l.add(1).pow(0.175),
        effectContent: (r) => `x${r.effect()} mining and woodcutting production`,
        isVisible: () => state.milestone >= 2
    });
    gunpowder = new Resource({
        name: "gunpowder",
        recipe: {iron: 50, coal: 500},
        description: "Explosives!",
        sellValue: 0.75,
        effectFunc: (l) => l.add(1).pow(0.2),
        effectContent: (r) => `x${r.effect()} mining and woodcutting production`,
        isVisible: () => luck().gt(0)
    });
    fsilver = new Resource({
        name: "fulminatingSilver",
        recipe: {silver: 50, gunpowder: 100},
        description: "Expensive, but a very powerful explosive!",
        sellValue: 100,
        effectFunc: (l) => l.add(1).pow(0.225),
        effectContent: (r) => `x${r.effect()} mining and woodcutting production`,
        isVisible: () => state.milestone >= 5
    });
    fgold = new Resource({
        name: "fulminatingGold",
        recipe: {gold: 100, "fulminatingSilver": 100},
        description: "Is it really worth it?",
        sellValue: 40000,
        effectFunc: (l) => l.add(1).pow(0.2625),
        effectContent: (r) => `x${r.effect()} mining and woodcutting production`,
        isVisible: () => state.milestone >= 6
    });
    new Element({type: "br", parent: elementTable, isVisible: () => state.soul.gt(0) || state.prestige > 0});
    new Element({
        type: "h3", 
        content: "Mana", 
        parent: elementTable, 
        className: "itemCategoryTitle",
        isVisible: () => state.soul.gt(0) || state.prestige > 0
    });
    new Resource({
        name: "soul",
        description: "The tortured souls of your poor workers. Very useful for alchemy!",
        isVisible: () => state.soul.gt(0)
    });
    new Resource({
        name: "mana",
        description: "life energy extracted from tortured souls.",
        productionFunction: () => state.soul.div(100).mul(soulPotion.effect()).mul(pu0.effect()).mul(timeBoost()),
        isVisible: () => state.soul.gt(0)
    });
    philosophersStone = new Resource({
        name: "philosophersStone",
        description: "Alchemy stones from the devil. Extremely expensive, rare and useful!",
        effectFunc: (l) => state.prestigeStoneGain.div(50).add(1),
        effectContent: (r) => `Devil's blessing: x${r.effect()} money gain (+2% per stone from resets)`,
        recipe: {diamond: 10, gold: 100, soul: 10},
        isVisible: () => state.prestige > 0
    });
    new Element({type: "br", parent: elementTable, isVisible: () => state.milestone >= 3});
    new Element({
        type: "h3", 
        content: "Potions", 
        parent: elementTable, 
        className: "itemCategoryTitle",
        isVisible: () => state.milestone >= 3
    });
    luckPotion = new Resource({
        name: "luckPotion",
        description: "Lucky.",
        recipe: {silver: 4, clover: 10, mana: 50},
        effectFunc: (l) => l.pow(0.6).mul(7.5),
        effectContent: (r) => `+${r.effect()} luck`,
        isVisible: () => state.milestone >= 3
    });
    soulPotion = new Resource({
        name: "soulPotion",
        description: "A potion which traps the souls of your workers. Fear -> money.",
        recipe: {soul: 1, gold: 1, wood: 200000},
        effectFunc: (l) => l.add(1).pow(0.65),
        effectContent: (r) => `x${r.effect()} mana production, ` + (soulPotion.amount.lt(10000) ? "special effect at 10K potions" : "doesn't need souls"),
        isVisible: () => state.milestone >= 5,
    });
    // special check
    if(soulPotion !== undefined)
    {
        soulPotion.amount.gte(10000)
        soulPotion.recipe.soul = 0;
    }
    allCurePotion = new Resource({
        name: "allCurePotion",
        description: "I'm not sure how ethical is selling this. I also don't care.",
        recipe: {philosophersStone: 1000, gold: 300000, diamond: 20000},
        sellValue: 2500000000,
        isVisible: () => state.milestone >= 6
    });
    new Element({type: "br", parent: elementTable});
    new Element({type: "br", parent: elementTable});

    setupPrestigeUpgrades();

    callUpdates();
})();

// return a string format of a money amount
function formatMoney(money)
{
    if(money.lt(0.1))
    return `${money.mul(100)}&#162;`;
    else
        return `${money}$`;
}

// function for mining
function mine()
{
    state.stone.adda(1)
}

// functions for auto clicker

let intervalID = undefined;

function startClicker()
{
    if(intervalID === undefined)
        intervalID = setInterval(mine, 100);
}

function endClicker()
{
    clearInterval(intervalID);
    intervalID = undefined;
}

function workerBoost()
{
    return pickaxe.effect().mul(gunpowder.effect()).mul(fsilver.effect()).mul(fgold.effect()).mul(pu1.effect()).mul(timeBoost());
}

function timeBoost()
{
    return pu2.effect();
}

function luck()
{
    return clover.effect().add(luckPotion.effect());
}

function coalLuckMultiplier()
{
    let A = 0.0047528252958, B = 1, C = 1.25;
    return luck().add(B).log10().pow(C).mul(A);
}

function stoneLuckMultiplier()
{
    let A = 0.938382214012, B = 13.6659376353, C = 0.5;
    return luck().add(B).log10().pow(C).mul(A);
}

function coalLuckMultiplier()
{
    let A = 0.0047528252958, B = 1, C = 1.25;
    return luck().add(B).log10().pow(C).mul(A);
}

function prestige()
{
    if(!confirm("这样做将重置您的进度。 你确定要这样做吗？\n（大约 5 ??? 推荐第一次）"))
        return;

    state.prestige++;
    state.philosophersStone.adda(stonesOnPrestige());
    state.prestigeStoneGain.adda(stonesOnPrestige());
    // reset everything
    for(const k in state)
    {
        if(k == "prestige" || k == "prestigeStoneGain" || k == "philosophersStone" || 
            k == "pu0" || k == "pu1" || k == "pu2")
            continue;
        if(state[k].c !== undefined && state[k].e !== undefined)
            state[k].set(0);
        else
            state[k] = 0;
    }
    minerUpgrade.level.set(0);
    woodcutterUpgrade.level.set(0);
    soulPotion.recipe.soul = 0;
    save();
}

function stonesOnPrestige()
{
    let gainFunction = (m) => m.mul(1.25).log10().pow(2.6);
    return gainFunction(state.totalMoney).floor().sub(state.prestigeStoneGain).add(0.0001).max(0);
}

function moneyToNextStone()
{
    let inverseGainFunction = (s) => _n(10).pow(s.pow(1/2.6)).div(1.25);
    let next = state.prestigeStoneGain.add(stonesOnPrestige()).add(1);
    return inverseGainFunction(next).sub(state.totalMoney);
}

function setupPrestigeUpgrades()
{
    let prestigeContainer = new Element({
        type: "div",
        parent: generalPurposeContainer,
        isVisible: () => currentItem === philosophersStone,
    });
    new Element({
        type: "h3",
        content: "Philosopher's stone Upgrades",
        parent: prestigeContainer,
    });
    // special philosopher's stone upgrades
    pu0 = new Upgrade({
        saveID: "pu0",
        currency: state["philosophersStone"],
        costFunc: exponentialSum(1, 2),
        inverseCostFunc: inverseExponentialSum(1, 2),
        effectFunc: l => _n(1.8).pow(l),
        contentFunc: u => `Soul Boost lvl ${u.level.toFixed()} (+${u.levelsToBuy().toFixed()})<br/>x${u.effect()} mana production<br/>-${u.cost().toFixed()} Philosopher's Stone`,
        parent: prestigeContainer
    });
    pu1 = new Upgrade({
        saveID: "pu1",
        currency: state["philosophersStone"],
        costFunc: exponentialSum(2, 2),
        inverseCostFunc: inverseExponentialSum(2, 2),
        effectFunc: l => _n(1.5).pow(l),
        contentFunc: u => `Worker Boost lvl ${u.level.toFixed()} (+${u.levelsToBuy().toFixed()})<br/>x${u.effect()} resource production<br/>-${u.cost().toFixed()} Philosopher's Stone`,
        parent: prestigeContainer
    });
    new Element({type: "br", parent: prestigeContainer});
    pu2 = new Upgrade({
        saveID: "pu2",
        currency: state["philosophersStone"],
        costFunc: exponentialSum(4, 2),
        inverseCostFunc: inverseExponentialSum(4, 2),
        effectFunc: l => _n(1.25).pow(l),
        contentFunc: u => `Time Boost lvl ${u.level.toFixed()} (+${u.levelsToBuy().toFixed()})<br/>x${u.effect()} time speed<br/>-${u.cost().toFixed()} Philosopher's Stone`,
        parent: prestigeContainer
    });
    new Element({
        type: "label",
        parent: prestigeContainer,
    });
}

function moneyMultiplier()
{
    return philosophersStone.effect();
}
