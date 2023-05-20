// simple way to serve html files from /views.
// does not support nested directories

import fs from 'fs/promises';
import path from 'path';

const cache = new Map();

async function getContent(file) {

  if (cache.has(file)) {
    return cache.get(file);
  }
  const content = await fs.readFile(path.join("src", "views", file), "utf-8");
  cache.set(file, content);
  return content;
}

function sendContent(res, content, contentType = "text/html") {

  res.writeHead(200, { "Content-Type": contentType });
  res.end(content);
}

export async function staticServer(req, res) {

  if (!req.path || req.path === "" || req.path === "/") {
    const content = await getContent("index.html");
    return sendContent(res, content);
  }

  const reqPath = req.path.endsWith("/") ? req.path.slice(0, -1) : req.path;
  const content = await getContent(`${reqPath}.html`);
  return SendContent(res, content);
}
