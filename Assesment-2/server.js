const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const FILES_DIR = path.join(__dirname, "files");

if (!fs.existsSync(FILES_DIR)) {
    fs.mkdirSync(FILES_DIR, { recursive: true });
}

function getFilePath(fileName) {
    const safeName = path.basename(fileName);
    return path.join(FILES_DIR, safeName);
}

function getBody(req) {
    return new Promise((resolve, reject) => {
        let body = "";

        req.on("data", chunk => {
            body += chunk;
        });

        req.on("end", () => {
            resolve(body);
        });

        req.on("error", reject);
    });
}

const server = http.createServer(async (req, res) => {
    try {
        const url = new URL(req.url, `http://localhost:${PORT}`);
        const fileName = url.searchParams.get("name");

        res.setHeader("Content-Type", "application/json");

        if (!fileName) {
            res.statusCode = 400;
            return res.end(JSON.stringify({
                message: "File name is required"
            }));
        }

        const filePath = getFilePath(fileName);

        if (req.method === "POST") {
            const body = await getBody(req);

            if (fs.existsSync(filePath)) {
                res.statusCode = 409;
                return res.end(JSON.stringify({
                    message: "File already exists"
                }));
            }

            await fs.promises.writeFile(filePath, body, "utf8");

            res.statusCode = 201;
            return res.end(JSON.stringify({
                message: "File created successfully"
            }));
        }

        if (req.method === "GET") {
            if (!fs.existsSync(filePath)) {
                res.statusCode = 404;
                return res.end(JSON.stringify({
                    message: "File not found"
                }));
            }

            const data = await fs.promises.readFile(filePath, "utf8");

            res.statusCode = 200;
            return res.end(JSON.stringify({
                file: fileName,
                content: data
            }));
        }

        if (req.method === "PUT") {
            if (!fs.existsSync(filePath)) {
                res.statusCode = 404;
                return res.end(JSON.stringify({
                    message: "File not found"
                }));
            }

            const body = await getBody(req);

            await fs.promises.writeFile(filePath, body, "utf8");

            res.statusCode = 200;
            return res.end(JSON.stringify({
                message: "File updated successfully"
            }));
        }

        if (req.method === "DELETE") {
            if (!fs.existsSync(filePath)) {
                res.statusCode = 404;
                return res.end(JSON.stringify({
                    message: "File not found"
                }));
            }

            await fs.promises.unlink(filePath);

            res.statusCode = 200;
            return res.end(JSON.stringify({
                message: "File deleted successfully"
            }));
        }

        res.statusCode = 405;
        res.end(JSON.stringify({
            message: "Method not allowed"
        }));

    } catch (error) {
        res.statusCode = 500;
        res.end(JSON.stringify({
            message: "Server error",
            error: error.message
        }));
    }
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});