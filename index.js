const fs = require('fs');
const path = require('path');
const express = require('express');
const cache = require('apicache').middleware;

// Load config if it exists
if (fs.existsSync('config.json')) {
  const config = JSON.parse(fs.readFileSync('config.json', 'utf-8'));
  const app = express();
  app.use(cache('1 year'));

  app.get('/', function(req, res) {
    res.send('<!DOCTYPE html><html><head><title>OpenTrafficSignals API</title></head><body><h1>OpenTrafficSignals API</h1><a href="https://github.com/OpenTrafficSignals/API">Documentation</a></body></html>');
  });

  app.listen(config.port, function() {
    console.log('API listening on port ' + config.port + '!');
  });

  // Search all API versions
  fs.readdirSync(__dirname).forEach(file => {
    if (fs.lstatSync(path.join(__dirname, file)).isDirectory()) {
      if (file.match(/^v[0-9]{1,}/gm)) {
        // And load them
        require(path.join(__dirname, file, 'index.js'))(app, config);
      }
    }
  });
} else {
  throw new Error('Please create the config file');
}