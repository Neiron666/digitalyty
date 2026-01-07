// Minimal static dev server that supports Netlify-style pretty URLs.
// - /pages/portfolio/   -> /pages/portfolio.html (if exists)
// - /about/             -> /about.html (if exists)
// - /foo/               -> /foo/index.html (if exists)
// - /foo                -> /foo.html (if exists)
// This is ONLY for local development. Netlify handles rewrites in production.

const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const rootDir = path.resolve(__dirname);
const port = Number(process.env.PORT || 8888);

const MIME = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".xml": "application/xml; charset=utf-8",
    ".webmanifest": "application/manifest+json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".mp4": "video/mp4",
    ".webp": "image/webp",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
};

function safeJoin(root, urlPath) {
    const decoded = decodeURIComponent(urlPath);
    const normalized = path.posix.normalize(decoded);
    const resolved = path.resolve(root, "." + normalized);
    if (!resolved.startsWith(root)) return null;
    return resolved;
}

function fileExists(filePath) {
    try {
        const st = fs.statSync(filePath);
        return st.isFile();
    } catch {
        return false;
    }
}

function dirExists(dirPath) {
    try {
        const st = fs.statSync(dirPath);
        return st.isDirectory();
    } catch {
        return false;
    }
}

function resolveRequestToFile(urlPath) {
    // 1) Direct file match
    const direct = safeJoin(rootDir, urlPath);
    if (direct && fileExists(direct)) return direct;

    // 2) If it's a directory or ends with '/', try index.html
    if (urlPath.endsWith("/")) {
        const candidate = safeJoin(rootDir, urlPath + "index.html");
        if (candidate && fileExists(candidate)) return candidate;

        // Netlify-style: /pages/portfolio/ -> /pages/portfolio.html
        const withoutTrailing = urlPath.replace(/\/+$/, "");
        const htmlCandidate = safeJoin(rootDir, withoutTrailing + ".html");
        if (htmlCandidate && fileExists(htmlCandidate)) return htmlCandidate;
    }

    // 3) If it has no extension, try .html
    if (!path.posix.extname(urlPath)) {
        const htmlCandidate = safeJoin(rootDir, urlPath + ".html");
        if (htmlCandidate && fileExists(htmlCandidate)) return htmlCandidate;

        // 4) If it maps to a directory, try /index.html
        const dirCandidate = safeJoin(rootDir, urlPath);
        if (dirCandidate && dirExists(dirCandidate)) {
            const indexCandidate = path.join(dirCandidate, "index.html");
            if (fileExists(indexCandidate)) return indexCandidate;
        }
    }

    return null;
}

const server = http.createServer((req, res) => {
    try {
        const url = new URL(
            req.url,
            `http://${req.headers.host || "localhost"}`
        );
        const pathname = url.pathname;

        const filePath = resolveRequestToFile(pathname);
        if (!filePath) {
            res.statusCode = 404;
            res.setHeader("Content-Type", "text/plain; charset=utf-8");
            res.end(`Cannot GET ${pathname}`);
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        res.statusCode = 200;
        res.setHeader("Content-Type", MIME[ext] || "application/octet-stream");

        const stream = fs.createReadStream(filePath);
        stream.on("error", () => {
            res.statusCode = 500;
            res.setHeader("Content-Type", "text/plain; charset=utf-8");
            res.end("Internal server error");
        });
        stream.pipe(res);
    } catch (e) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.end("Internal server error");
    }
});

server.listen(port, () => {
    console.log(`Dev server running at http://127.0.0.1:${port}/`);
    console.log("Pretty URLs supported (e.g., /pages/portfolio/)");
});
