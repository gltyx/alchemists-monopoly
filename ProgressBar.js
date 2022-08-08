let milestones = [
    _n(0.02),   // iron
    _n(0.25),   // wood
    _n(2),      // luck, coal, silver
    _n(20),     // prestige ??
    _n(750),    // gold
    _n(50000),  // diamond
    _n(25000000),  // all cure potion
    _n(1e300),
];

function createProgressBar()
{
    state.milestone = 0;

    let container = new Element({
        type: "div",
        style: {
            width: "100%",
            height: "25px",
            backgroundColor: "#555",
            margin: "10px 0",
            border: "2px solid #000",
            borderRadius: "5px",
        },
    });

    let text = new Element({
        type: "label",
        parent: container,
        contentUpdate: () => `Get ${formatMoney(currentMilestone())}&emsp;(${milestoneProgress()}%)`,
        style: {
            position: "absolute",
            top: "2px",
            left: "5px",
            zIndex: 15,
        },
        className: "textOutline"
    });

    let content = new Element({
        type: "div",
        parent: container,
        style: {
            backgroundColor: "#09e",
            height: "100%",
            width: "0%",
        },
        styleUpdate: () => ({
            width: `${milestoneProgress()}%`,
        })
    });

    updateList.push(progressBarUpdate);
}

// function updates progress bar and milestone progress
function progressBarUpdate()
{
    if(state.totalMoney.gte(currentMilestone()))
    {
        state.milestone++;
    }
}

// function returns current milestone requirement
function currentMilestone()
{
    return milestones[state.milestone];
}

// function returns progress of current milestone (in percentages)
function milestoneProgress()
{
    return state.totalMoney.div(currentMilestone()).mul(100);
}