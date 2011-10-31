# Sunny Proxy Web Server
This is a very simple demo proxy web server for serving up a static website
stored in the cloud using [Node.js](http://nodejs.org) and the [Sunny.js](http://sunnyjs.org) cloud library.

The proxy server basically translates web server requests to blob (e.g.,
S3 key) names, from any root container (e.g., S3 bucket) specified by the user.

Nothing too fancy or amazing, but this shows a basic example of using the
Sunny.js cloud library with Node.js streams and pipes.

# Installation
Clone the repository and install the dependencies:

    $ git clone git@github.com:ryan-roemer/sunny-proxy.git
    $ cd sunny-proxy
    $ npm install

# Run the Server
Then configure the following environment variables:

    # Name of bucket/container to serve files from.
    export SUNNY_PROXY_CONTAINER="<NAME>"

    # Provider options: "aws" (S3) or "google" (Google Storage)
    export SUNNY_PROVIDER="<PROVIDER>"
    export SUNNY_ACCOUNT="<ACCOUNT NAME>"
    export SUNNY_SECRET_KEY="<SECRET KEY>"

You should now be able to run the server:

    $ node server.js
    Server running at http://0.0.0.0:2000/

Or, if you are feeling
[CoffeeScript](http://jashkenas.github.com/coffee-script/) inclined, try:

    $ coffee server.coffee
    Server running at http://0.0.0.0:2000/

... and we're off!

Open a browser to http://127.0.0.1:2000/ and you should be able to browse files
according to the directory hierarchy with which they were uploaded.
