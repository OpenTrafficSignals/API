# OpenTrafficSignals API

The API offers a REST API for routing and traffic signal finding.  

It uses the Google Directions API for routing and OpenStreetMaps' Overpass API for traffic signal finding.  

The API is create for the OpenTraffisSignals [app](https://github.com/OpenTrafficSignals/app).  

# Installation

```bash
git clone https://github.com/OpenTrafficSignals/API
cd API
npm i
cp config.sample.json config.json
```

Change the configs in the config.json file (You have to place your Google Directions API key there).  

```bash
npm start
```

# Usage

## v1

### Coordinates and lists

Coordinates are always split by a ",".  
The 1st part of the coordinate is always the latitude and the 2nd is always the longitude.  
Lists (e.g. waypoints) are always split by a "|".

### Routing

The routing API takes 2 required parameters which are "origin" and "destination" and 2 optional parameters which are "decode" and "waypoints".  

A simple request could look like this:  
<http://localhost:8000/v1/route?origin=New%20York%20City&destination=Jersey%20City>

But this gives only encoded latitudes and longitudes, but maybe we want them decoded.  
If this is the case just add a "&decode" to the request:  
<http://localhost:8000/v1/route?origin=New%20York%20City&destination=Jersey%20City&decode>

You also can add waypoints by the waypoints parameter seperated by a "|". This is a route which leads over the "Central Park Zoo" and the "Liberty State Park":  
<http://localhost:8000/v1/route?origin=New%20York%20City&destination=Jersey%20City&waypoints=Central%20Park%20Zoo|Liberty%20State%20Park>

### Traffic signals

A request for the traffic signals on the above generated route could look like this:  
<http://localhost:8000/v1/signals?latitudes=40.712168|40.794872&longitudes=-74.081497|-73.970947>

The given coordinates should correspond to the borders of the route.
