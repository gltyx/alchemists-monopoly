const STORAGE_ENTRY = "alchemyGameSave";

// function exports game state to string
function exportState()
{
    return btoa(JSON.stringify(state));
}

// function imports game state from string
function importState(importStr, firstLoad = false)
{
    let newData = JSON.parse(atob(importStr))
    if(firstLoad)
    {
        Object.assign(state, newData);
        for(const k in newData)
        {
            if(k in state && state[k].c !== undefined && state[k].e !== undefined)
                state[k] = _n(state[k].c, state[k].e);
        }
        return;
    }
    // already loaded, update data
    for(const k in newData)
    {
        if(k in state && state[k].c !== undefined && state[k].e !== undefined)
            state[k].set(_n(newData[k].c, newData[k].e));
        else
            state[k] = newData[k];
    }
}

// function saves game state to permenant storage
function save()
{
    localStorage.setItem(STORAGE_ENTRY, exportState());
}

soulPotion = undefined;
// function loads game state from permanent storage
function load()
{
    let t = performance.now();
    let item;
    if(item = localStorage.getItem(STORAGE_ENTRY))
    {
        importState(item, true);
    }

    if(soulPotion !== undefined)
    {
        soulPotion.amount.gte(10000)
        soulPotion.recipe.soul = 0;
    }
}

// function deletes save from storage
function deleteSave()
{
    localStorage.removeItem(STORAGE_ENTRY);
}

// function starts autosave
function startAutosave()
{
    setInterval(save, 4000);
}
