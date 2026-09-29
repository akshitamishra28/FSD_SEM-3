const EventEmitter = require("events");

class Element extends EventEmitter {
    constructor(name, parent = null) {
        super();
        this.name = name;
        this.parent = parent;
    }

    addEventListener(type, handler) {
        this.on(type, handler);
    }

    removeEventListener(type, handler) {
        this.off(type, handler);
    }

    dispatchEvent(type, data) {
        let event = {
            type: type,
            target: this,
            currentTarget: this,
            data: data,
            stop: false,

            stopPropagation() {
                this.stop = true;
            }
        };

        let current = this;

        while (current != null) {
            event.currentTarget = current;
            current.emit(type, event);

            if (event.stop) {
                break;
            }

            current = current.parent;
        }
    }
}

let documentElement = new Element("document");
let form = new Element("form", documentElement);
let button = new Element("button", form);

function buttonClick(event) {
    console.log("Button clicked");
    console.log("Target:", event.target.name);
    console.log("Current Target:", event.currentTarget.name);
}

function formClick(event) {
    console.log("Form clicked");
    console.log("Target:", event.target.name);
    console.log("Current Target:", event.currentTarget.name);
}

function documentClick(event) {
    console.log("Document clicked");
    console.log("Target:", event.target.name);
    console.log("Current Target:", event.currentTarget.name);
}

button.addEventListener("click", buttonClick);
form.addEventListener("click", formClick);
documentElement.addEventListener("click", documentClick);

console.log("Scenario A");
button.dispatchEvent("click", "Hello");

console.log("\nScenario B");

form.removeEventListener("click", formClick);

form.addEventListener("click", function(event) {
    console.log("Form clicked");
    console.log("Target:", event.target.name);
    console.log("Current Target:", event.currentTarget.name);

    event.stopPropagation();
});

button.dispatchEvent("click", "Hello");

console.log("\nScenario C");

button.removeEventListener("click", buttonClick);

button.dispatchEvent("click", "Hello");

console.log("\nKeypress");

form.addEventListener("keypress", function(event) {
    console.log("Key pressed:", event.data);
});

form.dispatchEvent("keypress", "A");