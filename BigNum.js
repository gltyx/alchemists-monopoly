// class for large numbers. limit ~1ee308
const _n = (c, e) => new num(c, e);
class num
{
    constructor (c, e)
    {
        if (e != undefined)
            this.c = c, this.e = e;
        else if (c instanceof num)
            this.c = c.c, this.e = c.e;
        else if (c == 0)
            this.c = this.e = 0;
        else
        {
            this.e = Math.floor(Math.log10(Math.abs(c)));
            this.c = c / 10 ** this.e;
        }
    }
    // operators
    add(n)
    {
        if (n instanceof num && n.e < this.e + 15 || n < this * 1e15)
            return _n(this.c + _n(10).pow(-this.e).mul(n), this.e).fix();
        else
            return _n(n);
    }
    adda(n)
    {
        this.set(this.add(n));
    }
    sub(n)
    {
        return this.add(_n(-1).mul(n));
    }
    suba(n)
    {
        this.set(this.sub(n));
    }
    mul(n)
    {
        if (n instanceof num)
            return _n(n.c * this.c, n.e + this.e).fix();
        else
            return _n(n * this.c, this.e).fix();
    }
    mula(n)
    {
        this.set(this.mul(n));
    }
    div(n)
    {
        if (n instanceof num)
            return _n(this.c / n.c, this.e - n.e).fix();
        else
            return _n(this.c / n, this.e).fix();      
    }
    diva(n)
    {
        this.set(this.div(n));
    }
    pow(n)
    {
        return this.c == 0 ? _n(0) : _n(1, n.valueOf() * this.log10().valueOf()).fix();
    }
    powa(n)
    {
        this.set(this.pow(n));
    }
    sqrt()
    {
        return _n(Math.sqrt(this.c), this.e / 2).fix();
    }
    log10()
    {
        return _n(Math.log10(this.c) + this.e, 0).fix();
    }
    floor()
    {
        return this.e < 15 ? _n(Math.floor(this)) : this;
    }
    ceil()
    {
        return this.e < 15 ? _n(Math.ceil(this)) : this;
    }
    round()
    {
        return this.e < 15 ? _n(Math.round(this)) : this;
    }
    min(n)
    {
        return this.gt(n) ? _n(n) : this;
    }
    max(n)
    {
        return this.gt(n) ? this : _n(n);
    }
    clamp(minimum, maximum)
    {
        return this.min(maximum).max(minimum);
    }
    set(n)
    {
        Object.assign(this, _n(n));
    }
    get()
    {
        return this;
    }
    // logic
    cmp(n)
    {
        n = _n(n);
        if (Math.sign(this.c) < Math.sign(n.c))
            return -1;
        else if (Math.sign(this.c) > Math.sign(n.c))
            return 1;
        let d = this.e == n.e ? this.sub(n) : this.e - n.e;
        return d > 0 ? 1 : d < 0 ? -1 : 0;
    }
    eq(n)
    {
        return this.cmp(n) == 0;
    }
    neq(n)
    {
        return !this.eq(n);
    }
    gt(n)
    {
        return this.cmp(n) == 1;
    }
    lt(n)
    {
        return this.cmp(n) == -1;
    }
    gte(n)
    {
        return !this.lt(n);
    }
    lte(n)
    {
        return !this.gt(n);
    }
    // other
    fix()
    {
        if (this.c == 0)
            this.e = 0;
        else
        {
            let de = this.e % 1;    // exponent fix
            de -= Math.floor(Math.log10(Math.abs(this.c)) + de);  // coefficient fix
            this.c *= 10 ** de;
            this.e -= de;
        }
        return this;
    }
    toString(precision=2)
    {
        if (this.lt(1))
            return this.valueOf().toFixed(precision);
        else if (this.e <= 14)
            return (this.c * 10 ** (this.e % 3)).toFixed(Math.max(0, precision - this.e % 3)) + ["", "K", "M", "B", "T"][Math.floor(this.e / 3)];
        else
            return this.c.toFixed(2) + "e" + this.e;
    }
    toFixed()
    {
        if(this.lt(1000))
            return this.floor().toString(0);
        else
            return this.toString();
    }
    valueOf()
    {
        return this.c * 10 ** this.e;
    }
    copy()
    {
        return _n(this.c, this.e);
    }
}