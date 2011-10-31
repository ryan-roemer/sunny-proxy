# Simple cloud proxy web server.
http = require('http')
mime = require('mime')
sunny = require('sunny')
conn = sunny.Configuration.fromEnv().connection  # Configuration.
ADDR = process.env.ADDRESS or "0.0.0.0"          # Server settings.
PORT = process.env.PORT or 2000
CONTAINER = process.env.SUNNY_PROXY_CONTAINER    # Serve this bucket.

# Get our container and create server inside to get blobs.
request = conn.getContainer(CONTAINER, { validate: true })
request.on 'error', (err) ->
  console.log(err)
  throw err

request.on 'end', (results) ->
  # We have a valid container, so let's create the server now.
  server = http.createServer (req, res) ->
    path = req.url.replace(/\/$/, "/index.html").replace(/^\/*/, "")
    status = 200
    logResult = () -> console.log "[%s] %s", status, path

    # Header based on MIME type (re-write on error).
    res.writeHead(status, { 'content-type': mime.lookup(path) })

    # Get blob and pass through error or pipe stream to response.
    stream = results.container.getBlob path
    stream.on 'error', (err) ->
      status = err.statusCode || 500
      res.writeHead status, { 'content-type': "text/html" }
      res.end "<h1>" + status + ": " + err.message + "</h1>"
      logResult()
    stream.on 'end', logResult
    stream.pipe res
    stream.end()

  server.listen PORT, ADDR
  console.log "Server running at http://%s:%s/", ADDR, PORT

request.end()
