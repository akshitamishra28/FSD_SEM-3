console.log("Script start");

setTimeout(() => {
    console.log("setTimeout");
}, 0);

setImmediate(() => {
    console.log("setImmediate");
});

Promise.resolve().then(() => {
    console.log("Promise");
});

process.nextTick(() => {
    console.log("process.nextTick");
});

console.log("Script end");