var http = require('http'), fs = require('fs');

const error = (message, res) => {
  res.writeHeader(500, { "Content-Type": "application/json" });
  res.write(JSON.stringify({ message, status: 500 }));
  res.end();
}
const badRequest = (message, res) => {
  res.writeHead(400, { "Content-Type": "application/json" })
  res.write(JSON.stringify({ message, status: 500 }));
  res.end();
}
const okJSON = (data, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.write(JSON.stringify(data));
  res.end();
}

const routes = {};

routes[''] = (route, req, res) => {
  try {
    fs.readFile('./client/index.html', function (err, html) {
      if (err) {
        return error(err.message, res);
      }
      res.writeHeader(200, { "Content-Type": "text/html" });
      res.write(html);
      res.end();
    });
  } catch (err) {
    console.error(err);
    return error("internal server error", res);
  }
}

const assetTypes = { ".js": "text/javascript", ".css": "text/css", ".html": "text/html" };
routes['assets'] = (route, req, res) => {
  try {
    if (route[2] && route[2].indexOf("..") > -1) {
      throw ("no going back");
    }

    let contentType = assetTypes[route[2].substring(route[2].lastIndexOf("."))];
    if (!contentType) {
      throw ("unsupported asset");
    }

    fs.readFile(`./client/assets/${route[2]}`, function (err, file) {
      if (err) {
        return error(err.message, res);
      }
      res.writeHeader(200, { "Content-Type": contentType });
      res.write(file);
      res.end();
    });
  } catch (err) {
    console.error(err);
    return error("internal server error", res);
  }
}

http.createServer(function (req, res) {
  const route = (req.url || "").split("/");
  if (!routes[route[1]]) {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.write("<html><body><h1>Not Found</h1></body></html>");
    return res.end();
  }
  routes[route[1]](route, req, res);
}).listen(8080);

let WebSocket = null;
let webSocketServer = null;

try {
  WebSocket = require('ws');
  webSocketServer = new WebSocket.Server({ port: 8081 });
} catch (err) {
  console.error(err);
}

// implement a really simple cache class so the returned data is cached for some time
// cached data should be able to be invalidated both manually and by time

class Cache {
  constructor() {
    this.data = []
  }
  getCache(date = Date.now()) {
    const cacheDate = this.data.filter(d => d.date < date)
    if (cacheDate.length != 0) {
      return cacheDate;
    }
    else {
      const reviews = data.top3().top3Reviews
      this.data.push({ date, reviews })
      return [{ date, reviews }];
    }
  }

}

const cache = new Cache();

const DataSet = require('./dataset.js');
const data = new DataSet();

webSocketServer && webSocketServer.on('connection', (wSocket) => {
  let interval = null;
  wSocket.on("message", (date) => {
    wSocket.send(JSON.stringify(cache.getCache(new Date(parseInt(date)))));
    interval = setInterval(() => {
      wSocket.send(JSON.stringify(cache.getCache(new Date(parseInt(date)))));
    }, 30000);
  })



  wSocket.onclose = () => {
    if (interval)
      clearInterval(interval)
  }
});

routes['task'] = (route, req, res) => {
  // implement me
  // return cached data

  okJSON(cache.getCache(), res);
}