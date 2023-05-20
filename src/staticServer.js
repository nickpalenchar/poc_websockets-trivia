// simple way to serve html files from /views.
// does not support nested directories

import fs from 'fs/promises';
import path from 'path';
import * as url from 'url';

const cache = new Map();

async function getContent(file) {

  if (cache.has(file)) {
    return cache.get(file);
  }
  try {
    const content = await fs.readFile(path.join("src", "views", file), "utf-8");
    cache.set(file, content);
    return content;
  } catch (e) {
    cache.set(file, null);
    return null;
  }
}

function sendContent(res, content, contentType = "text/html") {
  if (content === null) {
    res.writeHead(404);
    res.end("Not Found");
    return;
  }
  res.writeHead(200, { "Content-Type": contentType });
  res.end(content);
}

export async function staticServer(req, res) {

  if (!req.url || req.url === "" || req.url === "/") {
    const content = await getContent("index.html");
    return sendContent(res, content);
  }
  
  let reqPath = url.parse(req.url).pathname;
  reqPath = reqPath.endsWith("/") ? reqPath.slice(0, -1) : reqPath;
  const content = await getContent(`${reqPath}.html`);
  return sendContent(res, content);
}

