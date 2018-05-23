const request = require('request');

module.exports = (app, config) => {
  const googleMapsClient = require('@google/maps').createClient({
    key: config.api_key
  });

  // Look here for further information https://developers.google.com/maps/documentation/utilities/polylinealgorithm
  function decodePolyline(a) {
    for (var c = [], d = 0, e = a.length, f = 0, g = 0; d < e;) {
      var h,
        i = 0,
        j = 0;
      do(h = a.charAt(d++).charCodeAt(0) - 63), (j |= (31 & h) << i), (i += 5);
      while (32 <= h);
      var k = 0 == (1 & j) ? j >> 1 : ~(j >> 1);
      (f += k), (i = 0), (j = 0);
      do(h = a.charAt(d++).charCodeAt(0) - 63), (j |= (31 & h) << i), (i += 5);
      while (32 <= h);
      var l = 0 == (1 & j) ? j >> 1 : ~(j >> 1);
      (g += l), c.push({
        lat: f / 1e5,
        lng: g / 1e5
      });
    }
    return c;
  }

  app.get('/v1/route', (req, res) => {
    // Check if request is valid
    if ('origin' in req.query && 'destination' in req.query) {
      let waypoints = [];
      // Check for waypoints
      if ('waypoints' in req.query) {
        waypoints = req.query.waypoints.split('|');
        for (let i = 0; i < waypoints.length; i++) {
          // Check if waypoint is coordinate
          const parts = waypoints[i].split(',');
          if (parts.length == 2) {
            try {
              parseInt(parts[0]);
              parseInt(parts[1]);
              // Transalte to waypoint
              waypoints[i] = {
                lat: parts[0],
                lng: parts[1]
              };
            } catch (e) {
              // Ignore because it's not a coordinate!
            }
          }
        }
      }
      googleMapsClient.directions({
        optimize: true,
        units: 'metric',
        mode: 'walking',
        origin: req.query.origin,
        destination: req.query.destination,
        waypoints: waypoints
      }, (err, response) => {
        const route = response.json.routes[0];
        let distance = 0;
        let duration = 0;
        let points = null;
        // Decode if enabled
        if ('decode' in req.query) {
          points = decodePolyline(route.overview_polyline.points);
        } else {
          points = route.overview_polyline.points;
        }
        // Summarize distance and duration
        for (let i = 0; i < route.legs.length; i++) {
          const leg = route.legs[i];
          distance += leg.distance.value;
          duration += leg.duration.value;
        }
        res.send({
          distance: {
            value: distance,
            unit: 'meters'
          },
          duration: {
            value: duration,
            unit: 'seconds'
          },
          points: points
        });
      });
    } else {
      res.status(400);
      res.send('Invalid request!');
    }
  });

  app.get('/v1/signals', (req, res) => {
    // Check if request is valid
    if ('latitudes' in req.query && 'longitudes' in req.query) {
      const latitudes = req.query.latitudes.split('|');
      const longitudes = req.query.longitudes.split('|');
      if (latitudes.length == 2 && longitudes.length == 2) {
        // Calculate the bounding box for OSM
        let latitude0, latitude1, longitude0, longitude1;
        if (latitudes[0] < latitudes[1]) {
          latitude0 = latitudes[0];
          latitude1 = latitudes[1];
        } else {
          latitude0 = latitudes[1];
          latitude1 = latitudes[0];
        }
        if (longitudes[0] < longitudes[1]) {
          longitude0 = longitudes[0];
          longitude1 = longitudes[1];
        } else {
          longitude0 = longitudes[1];
          longitude1 = longitudes[0];
        }
        const query = config.interpreter + '?data=[out:json];node[highway=crossing][crossing=traffic_signals](' + latitude0 + ',' + longitude0 + ',' + latitude1 + ',' + longitude1 + ');out;';
        request(query, function(error, response, body) {
          try {
            // Check if request succeeded
            body = JSON.parse(body);
          } catch (e) {
            res.status(400);
            res.send(body);
            return;
          }
          let data = [];
          // Remove unnecessary data
          for (let i = 0; i < body.elements.length; i++) {
            const node = body.elements[i];
            data.push({
              id: node.id,
              lat: node.lat,
              lng: node.lon
            });
          }
          res.send(data);
        });
      } else {
        res.status(400);
        res.send('Invalid request!');
      }
    } else {
      res.status(400);
      res.send('Invalid request!');
    }
  });
};