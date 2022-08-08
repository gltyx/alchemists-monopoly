class BuyAmountSelector
{
    constructor (parent)
    {
        this.amount = 1;
        this.max = false;

        this.button = new Button({
            onclick: () => this.next(),
            contentUpdate: () => this.toString(),
            parent: parent,  
            className: "buyAmountSelector",
        });
    }
    next()
    {
        this.amount *= 10;
        if (!this.max && this.amount == 1000)
        {
            this.max = true;
            this.amount = 0.01;
        }
        else if (this.max && this.amount > 1)
        {
            this.max = false;
            this.amount = 1;
        }
    }
    toString()
    {
        if (!this.max)
            return `x${this.amount}`;
        else if (this.amount === 1)
            return "MAX"
        else
            return `${this.amount * 100}%`;
    }
}