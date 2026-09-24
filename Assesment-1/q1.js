const EventEmitter = require('events');

const session = new EventEmitter();

// greet event
session.on('greet', (username) => {
    console.log(`Hello, ${username}! Welcome.`);
});

// exit event
session.on('exit', (code) => {
    console.log(`Session closed with code ${code}. Goodbye!`);
});

// First login - only once
session.once('greet', () => {
    console.log('First login of the day!');
});

// error event
session.on('error', (message) => {
    console.log(`Error: ${message}`);
});

// trigger function
function trigger(command, ...args) {
    if (command === 'greet' || command === 'exit') {
        session.emit(command, ...args);
    } else {
        console.log(`Unknown event: ${command}`);
    }
}

// Greet three times
trigger('greet', 'Akshita');
trigger('greet', 'Rahul');
trigger('greet', 'Priya');

// Listener count
console.log("Greet listener count:", session.listenerCount('greet'));

// Exit
trigger('exit', 0);

// Unknown event
trigger('login');

// Error event
session.emit('error', 'Invalid session detected.');