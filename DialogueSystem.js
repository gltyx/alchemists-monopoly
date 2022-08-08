let dialogueWindow;
let dialogueContent;
let dialogueIcon;
let currentDialogMessage;

function setupDialogueUI()
{
    // pop up window at the bottom of the screen
    dialogueWindow = new Element({
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
        elementOptions: {
            onclick: () => currentDialogMessage.end(),
        }
    });
    dialogueWindow.setVisible(false);

    dialogueContent = new Element({
        type: "label",
        parent: dialogueWindow,
    });

    // temp
    /*let m = [];
    for(let i = 0; i < 10; i++)
    {
        m.push(
            new DialogueMessage("i: " + i)
        );    
    }
    // set nexts
    for(let i = 0; i < m.length - 1; i++)
    {
        m[i].next = m[i + 1];
    }

    m[0].show();*/
}

class DialogueMessage
{
    constructor(content, icon, next)
    {
        this.content = content;
        this.icon = icon;
        this.next = next;
    }

    // shows dialogue message
    show()
    {
        currentDialogMessage = this;

        dialogueWindow.setVisible(true);
        dialogueContent.element.innerText = this.content;
    }

    // ends current dialogue message
    end()
    {
        currentDialogMessage = undefined;

        dialogueWindow.setVisible(false);

        this.next?.show?.();
    }
}