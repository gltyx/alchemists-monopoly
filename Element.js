let updateList = [];
// Class wraps up an html element
class Element
{
    constructor ({ type, id, parent = document.body, content, contentUpdate, isVisible, style, styleUpdate, className, defaultPos = true, elementOptions = {} } = {})
    {
        if (type === undefined && id === undefined)
        {
            throw new Error("Element must be created with a type or from an ID of an existing html DOM element");
        }
        if (id !== undefined)   // get existing element
            this.element = document.getElementById(id);
        else
        {
            // create element and assign parent
            this.element = document.createElement(type);
            if ((parent instanceof Element ? parent.element : parent).appendChild?.(this.element) === undefined)
                throw new Error("Can't append element to parent \"" + parent.toString() + "\" of type \"" + typeof (parent) + "\"");
        }
        // set content and updates
        this.element.innerHTML = content || "";
        if (contentUpdate !== undefined)
            updateList.push(() => this.element.innerHTML = contentUpdate());
        if (isVisible !== undefined)
            updateList.push(() => this.setVisible(isVisible()));
        // style
        // default
        if (defaultPos)
        {
            this.element.style.position = "relative";
            this.element.style.zIndex = "10";
        }
        // additional
        Object.assign(this.element.style, style);
        if (styleUpdate !== undefined)
            updateList.push(() => Object.assign(this.element.style, styleUpdate()));
        if (className !== undefined)
            this.element.className = className;
        // additional behavior
        Object.assign(this.element, elementOptions);
    }
    delete()
    {
        this.element.remove();
    }
    clearContent()
    {
        this.element.textContent = "";
    }
    setVisible(visible)
    {
        this.element.classList.toggle("hidden", !visible);
    }
    toggleVisibility()
    {
        this.element.classList.toggle("hidden", !this.element.classList.contains("hidden"));
    }
}

// Class provides button functionality
class Button extends Element
{
    constructor ({ onclick = () => { }, isEnabled,  // button additions
        parent = document.body, content, contentUpdate, isVisible, style, styleUpdate, elementOptions = {} })
    {
        // add on click and generate Element
        let args = { ...arguments[0], type: "button" };
        args.elementOptions = { ...args.elementOptions, onclick: onclick };
        super(args);
        // add button enabled update
        if (isEnabled !== undefined)
            updateList.push(() => this.element.disabled = !isEnabled());
    }
}

// Class creates a visual progress bar
class ProgressBar extends Element
{
    constructor ({ getProgress = () => 0, fillStyle, fillStyleUpdate = () => { },   // progress bar addition
        parent = document.body, content, contentUpdate, isVisible, style, styleUpdate, elementOptions = {} })
    {
        // add on click and generate Element
        let args = { ...arguments[0], type: "progress" };
        args.elementOptions = { ...args.elementOptions, value: 0, max: 1 };
        super(args);
        // add child
        updateList.push(() => { this.element.value = getProgress(); });
    }
}

// Class for a checkbox
class Checkbox extends Element
{
    constructor({ onclick = () => { }, isEnabled,  // button additions
        parent = document.body, content, contentUpdate, isVisible, style, styleUpdate, elementOptions = {} })
    {
        // add on click and generate Element
        let args = { ...arguments[0], type: "input" };
        args.elementOptions = { ...args.elementOptions, onclick: onclick, type: "checkbox", checked: true };
        super(args);
        // add button enabled update
        if (isEnabled !== undefined)
            updateList.push(() => this.element.disabled = !isEnabled());
    }
}

// Class for selector
class Selector extends Element
{
    constructor({parent, oninput, options})
    {
        super({
            type: "select", 
            parent: parent, 
            elementOptions: {
                oninput: oninput
            }
        });
        options.forEach(option => {
            new Element({
                type: "option",
                parent: this,
                content: option,
            });
        });
    }
}
    
// Function calls all Element updates. Should be called once per frame.
UPDATES_PER_SECOND = 15;
function callUpdates()
{
    updateList.forEach(update => update());
}
setInterval(callUpdates, 1e3 / UPDATES_PER_SECOND);
