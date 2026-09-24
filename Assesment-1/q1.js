const EventEmitter = require('events');

class SessionManager extends EventEmitter {
    constructor() {
        super();

        // greet event
        this.on('greet', (username) => {
            console.log(`Hello, ${username}! Welcome.`);
        });

        // exit event
        this.on('exit', (code) => {
            console.log(`Session closed with code ${code}. Goodbye!`);
        });

        // once listener for first login
        this.once('greet', () => {
            console.log('First login of the day!');
        });

        // error listener
        this.on('error', (message) => {
            console.log(`Error: ${message}`);
        });
    }

    trigger(command, ...args) {
        if (command === 'greet' || command === 'exit') {
            this.emit(command, ...args);
        } else {
            console.log(`Unknown event: ${command}`);
        }
    }
}

// Create object
const session = new SessionManager();

// Emit greet three times
session.trigger('greet', 'Akshita');
session.trigger('greet', 'Rahul');
session.trigger('greet', 'Priya');

// Print current listener count for greet
console.log(`Greet listener count: ${session.listenerCount('greet')}`);

// Emit exit
session.trigger('exit', 0);

// Unknown event
session.trigger('login');

// Emit error event
session.emit('error', 'Invalid session detected.');