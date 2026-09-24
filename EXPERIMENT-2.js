const fs = require('fs');
fs.writeFile('example.txt','Hello Everyone I am Akshita Mishra, an engineering student',(err) => {
    if(err) throw err;
    console.log('File created!!');

    fs.readFile('example.txt','utf8',(err,data) => {
        console.log('File content: ',data);
    });

fs.appendFile('example.txt','\nThis line was added',(err)=> {
    if(err) throw err;
    console.log('File updated (appended)!');
});
fs.unlink('example.txt',(err) => {
    if(err) throw err;
    console.log('File deleted!!');
});
});
// console.log('1: Start(sync)');
// setTimeout(() => {
//     console.log('2: Inside setTimeout(macrotask - runs LAST');
// },0);
// Promise.resolve().then(() =>{
//     console.log('3: Inside Promise.then(microtask - runs BEFORE setTimeout)');
// });
// fs.readFile(__filename,() => {
//     console.log('4: Inside fs.readFile callback(I/O - runs with marotasks)');

// });

