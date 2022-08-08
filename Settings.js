let settingsVisible = false;
let settingsTab;

function setupSettings()
{
    new Button({
        content: "Settings",
        style: {
            position: "absolute",
            top: "55px",
            right: "15px",
            padding: "10px",
        },
        onclick: () => settingsTab.toggleVisibility(),
    });

    settingsTab = new Element({
        type: "div",
        style: {
            border: "2px solid black",
            borderRadius: "5px",
            backgroundColor: "#fff",
            position: "absolute",
            zIndex: 25,
            padding: "20px",
            paddingRight: "80px",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)"
        }
    });
    settingsTab.setVisible(settingsVisible);

    new Button({
        content: "X",
        parent: settingsTab,
        style: {
            position: "absolute",
            top: "15px",
            right: "15px",
            width: "45px",
            height: "45px",
            padding: 0
        },
        onclick: () => settingsTab.toggleVisibility(),
    });

    // save system
    new Button({
        content: "Save",
        parent: settingsTab,
        style: { padding: "10px" },
        onclick: save
    });
    new Button({
        content: "Export",
        parent: settingsTab,
        style: { padding: "10px" },
        onclick: () => {
            navigator.clipboard.writeText(exportState());
            alert("Export code copied to clipboard!");
        }
    });
    new Button({
        content: "Import",
        parent: settingsTab,
        style: { padding: "10px" },
        onclick: () => {
            let exportCode = prompt("Paste export code here:", "");
            importState(exportCode);
        }
    });
    new Button({
        content: "Hard Reset",
        parent: settingsTab,
        style: { padding: "10px" },
        onclick: () => {
            if(confirm("Are you sure you want to reset all settings?"))
            {
                deleteSave();
                location.reload();
            }
        }
    });

    new Element({type: "br", parent: settingsTab});
    // font selector
    new Element({type: "label", content: "Font: ", parent: settingsTab});
    let fontSelector = new Selector({
        parent: settingsTab,
        oninput: () => setFont(fontSelector.element.value),
        options: [
            "MedievalSharp",
            "Arial",
            "David",
            "Comic Sans MS",
            "Courier New",
            "Monospace",
        ]
    });

    new Element({type: "br", parent: settingsTab});
    // theme selector
    new Element({type: "label", content: "Theme: ", parent: settingsTab});
    let themeSelector = new Selector({
        parent: settingsTab,
        oninput: () => setStylesheet(themeSelector.element.value),
        options: [
            "light",
            "dark",
        ]
    });
}

// function changes font of all elements
function setFont(font)
{
    document.body.style.fontFamily = font;
}

// function changes current theme stylesheet
function setStylesheet(theme)
{
    document.getElementById("themeStylesheet").href = `Themes/${theme}.css`;
}