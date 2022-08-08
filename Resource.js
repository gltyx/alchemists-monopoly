var elementTable;
var popupWindow;
var popupVisible = false;
var currentItem;
var resources = [];

function setupResourceUI()
{
    elementTable = new Element({
        type: "div",
    });

    // pop up window at the bottom of the screen
    popupWindow = new Element({
        type: "div",
        style: { 
            position: "absolute",
            bottom: "1%",
            left: "50%",
            transform: "translate(-50%)",
            width: "96%",
            border: "2px solid black",
            borderRadius: "5px",
            minHeight: "50px",
            padding: "0.75%",
            zIndex: 20,
            backgroundColor: "#fff",
            boxShadow: "0px 0px 12px #000",
        },
        isVisible: () => popupVisible
    });
    // close button
    new Button({
        content: "X",
        onclick: closePopup,
        parent: popupWindow,
        style: {
            position: "absolute",
            top: "0px",
            right: "0px",
            margin: "5px",

        }
    });
    // item name
    new Element({
        type: "label",
        parent: popupWindow,
        contentUpdate: () => {
            if(currentItem)
                return `${capitalize(currentItem.name)}&emsp;x${currentItem.amount.toFixed()}` + 
                    (currentItem?.productionFunction?.()?.gt(0) ? `&emsp;(+${currentItem.productionFunction()}/s)` : "") + 
                    `<br/><i>${currentItem.description}</i><br/>`;
        },
    });
    new Element({
        type: "label",
        parent: popupWindow,
        isVisible: () => currentItem?.effectContent,
        contentUpdate: () => currentItem?.effectContent?.(currentItem)
    });
    new Element({type: "br", parent: popupWindow});
    // transmutation and selling divs
    let tabs = new Element({
        type: "div",
        parent: popupWindow,
        style: {
            display: "flex",
        }
    });
    let sellingContainer = new Element({
        type: "span",
        parent: tabs,
        isVisible: () => currentItem?.canBeSold,
        style: { width: "40%", margin: "10px"},
    });
    let transmutationContainer = new Element({
        type: "span",
        parent: tabs,
        isVisible: () => currentItem?.recipe,
        style: { margin: "10px" }
    });
    generalPurposeContainer = new Element({
        type: "span",
        parent: tabs,
        style: { margin: "10px" }
    });
    // selling
    new Element({
        type: "label",
        parent: sellingContainer,
        contentUpdate: () => currentItem && `Sell price: ${formatMoney(currentItem.sellValue())}`,
    });
    for(let i = 0; i < 2; i++)
        new Element({type: "br", parent: sellingContainer});
    new Button({
        parent: sellingContainer,
        contentUpdate: () => currentItem && `Sell ${currentItem.sellAmount().toFixed()} ${currentItem.name}<br/>+${formatMoney(currentItem.sellAmount().mul(currentItem.sellValue()))}`,
        onclick: () => {
            let amount = currentItem.sellAmount();
            state.money.adda(amount.mul(currentItem.sellValue()));
            state.totalMoney.adda(amount.mul(currentItem.sellValue()));
            currentItem.amount.suba(amount);
        },
        isEnabled: () => currentItem?.sellAmount()?.lte?.(currentItem?.amount),
    });
    // recipe
    initRecipe(transmutationContainer);
    // Transmutation
    for(let i = 0; i < 2; i++)
        new Element({type: "br", parent: transmutationContainer});
    new Button({
        parent: transmutationContainer, 
        contentUpdate: () => currentItem && `Transmute x${currentItem.amountToTransmute().toFixed()}`,
        onclick: () => currentItem.transmute(),
        isEnabled: () => currentItem?.canTransmute?.(),
    });

    updateList.push(updateRecipe);
}

// class for resource icon
class Icon
{
    constructor({name, amount, parent, onclick, isVisible})
    {
        this.name = name;
        this.amount = amount;
        this.url = () => `Resources/${this.name}.png`;
        this.visible = true;

        let iconElement = new Element({
            type: "div",
            parent: parent,
            className: "iconContainer",
            styleUpdate: () => ({
                backgroundImage: `url(${this.url()})`,
            }),
            elementOptions: {
                onclick: onclick,
            },
            isVisible: () => this.visible && (isVisible?.() ?? true),
        });
        // item count
        new Element({
            type: "label",
            parent: iconElement,
            contentUpdate: () => `${this.amount?.toFixed()}`,
            style: {
                position: "absolute",
                bottom: 0,
                right: "2px",
            },
            className: "textOutline2",
        });
    }
}

// class for alchemy resource, which can be created from other resources or sold.
class Resource
{
    constructor({name, recipe, description, productionFunction, sellValue, effectFunc, effectContent, isVisible})
    {
        resources.push(this);

        if(!(name in state))
            state[name] = _n(0);
        this.amount = state[name];

        this.recipe = recipe;
        this.name = name;
        this.description = description;
        this.productionFunction = productionFunction;
        this.baseSellValue = _n(sellValue);
        this.effectFunc = effectFunc;
        this.effectContent = effectContent;
        this.canBeSold = sellValue != null;

        let icon = `./Resources/${name}.png`;
        let itemIndex = elementTable.element.children.length;

        if(productionFunction)
            updateList.push(() => this.update(dt));

        // create icon
        new Icon({
            name: name, 
            amount: this.amount,
            parent: elementTable,
            onclick: () => itemClick(this),
            isVisible: isVisible
        });
    }

    // method performs a transmutation based on the recipe
    transmute()
    {
        if(!this.canTransmute())
            return;

        let amount = this.amountToTransmute();

        for(const k in this.recipe)
        {
            state[k].suba(amount.mul(this.recipe[k]));
        }
        this.amount.adda(amount);

        // special checks
        if(currentItem === soulPotion)
        {
            if(soulPotion.amount.gte(10000))
                soulPotion.recipe.soul = 0;
        }
    }

    // method returns amount to transmute on click
    amountToTransmute()
    {
        if(buyAmount.max)
            return this.maxAmount().mul(buyAmount.amount).floor().max(1);
        else
            return _n(buyAmount.amount);
    }

    // method checks if a transmutation is possible (enough resources for recipe)
    canTransmute()
    {
        let amount = this.amountToTransmute();
        for(const k in this.recipe)
        {
            // check if not enough resources for recipe
            if(state[k]?.lt(amount.mul(this.recipe[k])))
                return false;
        }
        return true;
    }

    // method returns max amount of this resource that can be bought
    maxAmount()
    {
        let amount;
        // min amount based on each ingredient
        for(const k in this.recipe)
        {
            let newAmount = state[k].div(this.recipe[k]);
            if(!amount || newAmount.lt(amount))
                amount = newAmount;
        }
        return amount ?? _n(0);
    }

    // function updates resource based on production function
    update(dt)
    {
        let inc = this.productionFunction().mul(dt);
        this.amount.adda(inc);
        this.total?.adda?.(inc);
    }

    // returns current effect of this resource
    effect()
    {
        return this.effectFunc?.(this.amount);
    }

    sellValue()
    {
        return this.baseSellValue && this.baseSellValue.mul(moneyMultiplier());
    }

    sellAmount()
    {
        if(buyAmount.max)
            return this.amount.mul(buyAmount.amount).max(1);
        else
            return _n(buyAmount.amount);
    }
}

// function handles click on item
function itemClick(item)
{
    if(currentItem == item)
    {
        closePopup();
        return;
    }

    // select item
    popupVisible = true;
    currentItem = item;

    updateRecipe();
}

// function closes popup window
function closePopup()
{
    popupVisible = false;
    currentItem = undefined;
}

// fucntion capitalizes first letter of string
function capitalize(string) 
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// function returns html image as string
function img(name, size)
{
    return `<img style="width: ${size}px; height: ${size}px; image-rendering: pixelated;" src="Resources/${name}.png" />`;
}

// function initializes recipe UI for resource info
const MAX_INGREDIENTS = 3;
let icons = [];
function initRecipe(parent)
{
    // create recipe elements (upto 3 ingredients)
    for(let i = 0; i < MAX_INGREDIENTS; i++)
    {
        let icon = new Icon({
            parent: parent,
        });
        icons.push(icon);
        if(i != MAX_INGREDIENTS - 1)
            new Element({
                type: "img", 
                parent: parent, 
                style: { bottom: "16px" },
                elementOptions: {
                    src: "Resources/plus.png"
                },
                isVisible: () => icons[i + 1].visible,
            });
    }
    // show product
    new Element({
        type: "img", 
        parent: parent, 
        style: {
            margin: "16px",
        },
        elementOptions: {
            src: "Resources/rarrow.png"
        },
    });
    let icon = new Icon({
        parent: parent,
    });
    icons.push(icon);
}

function updateRecipe()
{
    if(!currentItem)
        return;

    let amount = currentItem.amountToTransmute();

    let ingredients = currentItem.recipe ? Object.keys(currentItem.recipe) : [];
    for(let i = 0; i < MAX_INGREDIENTS; i++)
    {
        if(i < ingredients.length)
        {
            icons[i].visible = true;
            icons[i].name = ingredients[i];
            icons[i].amount = amount.mul(currentItem.recipe[ingredients[i]]);
        }
        else
        {
            icons[i].visible = false;
        }
    }
    // product
    icons[MAX_INGREDIENTS].name = currentItem?.name;
    icons[MAX_INGREDIENTS].amount = amount;
}
