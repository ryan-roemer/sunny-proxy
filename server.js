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
    conn = sunny.Configuration.fromEnv().connection,  // Configuration.
    ADDR = process.env.ADDRESS || "0.0.0.0",          // Server settings.
    PORT = process.env.PORT || 2000,
    CONTAINER = process.env.SUNNY_PROXY_CONTAINER;    // Serve this bucket.

  // Get our container and create server inside to get blobs.
  conn.getContainer(CONTAINER, { validate: true })
    .on('error', function (err) {
      console.log(err);
      throw err;
    })
    .on('end', function (results) {
      // We have a valid container, so let's create the server now.
      http.createServer(function (req, res) {
        var path = req.url.replace(/\/$/, "/index.html").replace(/^\/*/, ""),
          status = 200,
          logResult = function () { console.log("[%s] %s", status, path); },
          stream;

        // Header based on MIME type (re-write on error).
        res.writeHead(status, { 'content-type': mime.lookup(path) });

        // Get blob and pass through error or pipe stream to response.
        stream = results.container.getBlob(path)
        stream.pipe(res);
        stream
          .on('error', function (err) {
            status = err.statusCode || 500;
            res.writeHead(status, { 'content-type': "text/html" });
            res.end("<h1>" + status + ": " + err.message + "</h1>");
            logResult();
          })
          .on('end', logResult)
          .end();
      }).listen(PORT, ADDR);
      console.log("Server running at http://%s:%s/", ADDR, PORT);
    })
    .end();
}());
