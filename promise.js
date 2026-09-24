const http = require('http');
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

// ============================================================
// 1. CUSTOM EVENT EMITTER
// ============================================================

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();

myEmitter.on('greet', (name) => {
    console.log(`[greet event] Hello, ${name}!`);
});

myEmitter.on('exit', () => {
    console.log('[exit event] Server says goodbye. Cleaning up...');
});

// ============================================================
// 2. FILE PATHS (for fs CRUD)
// ============================================================

const DATA_FILE = path.join(__dirname, 'data.txt');
const HTML_FILE = path.join(__dirname, 'index.html');

// Make sure data.txt exists the first time the server runs
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(
        DATA_FILE,
        'Welcome! This is the initial content of data.txt\n'
    );
}

// ============================================================
// 3. EVENT LOOP DEMO
// Shows the order: sync code -> process.nextTick -> Promises
// -> setTimeout -> setImmediate
// ============================================================

function eventLoopDemo() {
    const log = [];

    log.push('1. Synchronous code runs first');

    setTimeout(() => {
        log.push('4. setTimeout callback (Timers phase)');
    }, 0);

    setImmediate(() => {
        log.push('5. setImmediate callback (Check phase)');
    });

    process.nextTick(() => {
        log.push('2. process.nextTick callback (microtask, runs before Promises)');
    });

    Promise.resolve().then(() => {
        log.push('3. Promise.then callback (microtask, runs after nextTick)');
    });

    return log;
}

// ============================================================
// Small helper to send JSON responses
// ============================================================

function sendJSON(res, statusCode, data) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    });

    res.end(JSON.stringify(data, null, 2));
}

// ============================================================
// 4. HTTP SERVER
// ============================================================

const server = http.createServer((req, res) => {
    const { method, url } = req;

    console.log(`${method} ${url}`);

    // Serve the HTML page at the root
    if (method === 'GET' && url === '/') {
        fs.readFile(HTML_FILE, 'utf8', (err, content) => {
            if (err) {
                res.writeHead(500, {
                    'Content-Type': 'text/plain'
                });

                return res.end('Error loading index.html');
            }

            res.writeHead(200, {
                'Content-Type': 'text/html'
            });

            res.end(content);
        });

        return;
    }

    // ---- EventEmitter demo ----
    if (method === 'GET' && url.startsWith('/greet')) {
        const name =
            new URL(
                url,
                `http://${req.headers.host}`
            ).searchParams.get('name') || 'Guest';

        myEmitter.emit('greet', name);

        return sendJSON(res, 200, {
            message: `Greet event emitted for "${name}". Check the server console!`
        });
    }

    if (method === 'GET' && url === '/exit') {
        myEmitter.emit('exit');

        return sendJSON(res, 200, {
            message: 'Exit event emitted. Check the server console!'
        });
    }

    // ---- Event loop demo ----
    if (method === 'GET' && url === '/eventloop') {
        const log = eventLoopDemo();

        setTimeout(() => {
            sendJSON(res, 200, {
                order: log,
                note: 'The exact order was also printed live in the server console.'
            });
        }, 50);

        return;
    }

    // ---- fs CRUD: READ ----
    if (method === 'GET' && url === '/read') {
        fs.readFile(DATA_FILE, 'utf8', (err, data) => {
            if (err) {
                return sendJSON(res, 500, {
                    error: 'Read failed'
                });
            }

            sendJSON(res, 200, {
                content: data
            });
        });

        return;
    }

    // ---- fs CRUD: CREATE (overwrite file) ----
    if (method === 'POST' && url === '/create') {
        let body = '';

        req.on('data', chunk => (body += chunk));

        req.on('end', () => {
            const { text } = JSON.parse(body || '{}');

            fs.writeFile(
                DATA_FILE,
                (text || '') + '\n',
                (err) => {
                    if (err) {
                        return sendJSON(res, 500, {
                            error: 'Create failed'
                        });
                    }

                    sendJSON(res, 201, {
                        message: 'File created/overwritten',
                        content: text
                    });
                }
            );
        });

        return;
    }

    // ---- fs CRUD: UPDATE (append a line) ----
    if (method === 'PUT' && url === '/update') {
        let body = '';

        req.on('data', chunk => (body += chunk));

        req.on('end', () => {
            const { text } = JSON.parse(body || '{}');

            fs.appendFile(
                DATA_FILE,
                (text || '') + '\n',
                (err) => {
                    if (err) {
                        return sendJSON(res, 500, {
                            error: 'Update failed'
                        });
                    }

                    sendJSON(res, 200, {
                        message: 'Content appended',
                        added: text
                    });
                }
            );
        });

        return;
    }

    // ---- fs CRUD: DELETE (clear file content) ----
    if (method === 'DELETE' && url === '/delete') {
        fs.writeFile(DATA_FILE, '', (err) => {
            if (err) {
                return sendJSON(res, 500, {
                    error: 'Delete failed'
                });
            }

            sendJSON(res, 200, {
                message: 'File content cleared'
            });
        });

        return;
    }

    // ---- 404 fallback ----
    sendJSON(res, 404, {
        error: 'Route not found'
    });
});

const PORT = 3000;

server.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
    console.log(
        '    Open that URL in your browser to use the activity page.'
    );
});