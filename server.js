/**
 * Simple cloud proxy web server.
 */
/*jslint node: true, goodparts: true, es5: true, white: true, onevar: true,
  undef: true, nomen: false, regexp: true, plusplus: true, bitwise: true,
  newcap: true, indent: 2, maxlen: 80 */

(function () {
  var http = require('http'),
    mime = require('mime'),
    sunny = require('sunny'),
    sunnyCfg = sunny.Configuration.fromEnv(), // Configuration.
    connection = sunnyCfg.connection,
    ADDR = "127.0.0.1",                       // Server settings.
    PORT = 2000,
    CONTAINER = "sunny-proxy-demo",           // Serve this bucket.
    request;

  // Get our container and create server inside to get blobs.
  request = connection.getContainer(CONTAINER, { validate: true });
  request.on('error', function (err) {
    console.log(err);
    throw err;
  });
  request.on('end', function (results) {
    // We have a valid container, so let's create the server now.
    http.createServer(function (req, res) {
      var path = req.url.replace(/\/$/, "/index.html").replace(/^\/*/, ""),
        status = 200,
        logResult = function () { console.log("[%s] %s", status, path); },
        stream;

      // Header based on MIME type (re-write on error).
      res.writeHead(status, { 'content-type': mime.lookup(path) });

      // Get blob and pass through error or pipe stream to response.
      stream = results.container.getBlob(path);
      stream.on('error', function (err) {
        status = err.statusCode || 500;
        res.writeHead(status, { 'content-type': "text/html" });
        res.end("<html><h1>" + status + ": " + err.message + "</h1></html>");
        logResult();
      });
      stream.on('end', logResult);
      stream.pipe(res);
      stream.end();
    }).listen(PORT, ADDR);

    console.log("Server running at http://%s:%s/", ADDR, PORT);
  });
  request.end();
}());
