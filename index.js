require('dotenv').config()
const bodyParser = require("body-parser");
const express = require("express");
const redis = require("redis");
const getJSON = require("get-json");
const { location } = require("georedis");

const app = express();
const client = redis.createClient({
  host: "redis-server",
  port: 6379,
});

//body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const geo = require("georedis").initialize(client);
const disaster = geo.addSet("disaster");
const evacuation = geo.addSet("evacuation");

//set location evacuation
const locationSetEvacuation = {
  //is debug zone evacuation
  "gunung sula": { latitude: -3.56, longitude: 129.05 },
  sukarame: { latitude: 39.9523, longitude: -75.1638 },
  sukabumi: { latitude: 37.4688, longitude: -122.1411 },
  waydadi: { latitude: 37.7691, longitude: -122.4449 },
  rupi: { latitude: 47.55, longitude: -52.6667 },
  "gunung terang": { latitude: -5.7965411, longitude: 105.5963913 },
  "teluk betung": { latitude: 49.65, longitude: -54.75 },
  "tanjung karang": { latitude: 45.4167, longitude: -75.7 },
  "teluk tuba": { latitude: 51.0833, longitude: -114.0833 },
  sabahbalau: { latitude: 18.975, longitude: 72.8258 },
};

evacuation.addLocations(locationSetEvacuation, function (err, reply) {
  if (err) console.error(err);
  else console.log("added locations evacuation:", reply);
});

//set location disaster
let latitude_Disaster = 0;
let longitude_Disaster = 0;
setInterval(() => {
  //sumber data (Badan Meteorologi, Klimatologi, dan Geofisika)
  getJSON("https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json")
    .then((res) => {
      const coordinates = res.Infogempa.gempa.Coordinates.split(",");
      latitude_Disaster = coordinates[0];
      longitude_Disaster = coordinates[1];
      const locationSetDisaster = {
        "Disaster1": {
          latitude: latitude_Disaster,
          longitude: longitude_Disaster,
        },
      };

      disaster.addLocations(locationSetDisaster, function (err, reply) {
        if (err) console.error(err);
        else console.log("added locations disaster:", reply);
      });
    })
    .catch((error) => {
      console.log("query failed" + error);
    });
}, 20000);

//case 2 response coordinate user and processed to geo radius or geo distance
bodyParser.urlencoded({ extended: false });
app.post("/user", (req, res) => {
  latitudeUser = req.body.latitude;
  longitudeUser = req.body.longitude;
  try {
    // case 3 running search radius disaster
    const options = {
      withCoordinates: true, // Will provide coordinates with locations, default false
      withHashes: true, // Will provide a 52bit Geohash Integer, default false
      withDistances: true, // Will provide distance from query, default false
      order: "ASC", // or 'DESC' or true (same as 'ASC'), default false
      units: "m", // or 'km', 'mi', 'ft', default 'm'
      count: 100, // Number of results to return, default undefined
      accurate: true, // Useful if in emulated mode and accuracy is important, default false
    };

    // look for all points within ~5000m.
    disaster.nearby(
      { latitude: latitudeUser, longitude: longitudeUser },
      5000,
      options,
      function (err, locations) {
        if (err) console.error(err);
        else {
          if (locations.length === 0) {
            res.send("no disaster on your radius");
          } else {
            //find zone evacuation
            // look for all points within ~5000m.
            evacuation.nearby(
              { latitude: latitudeUser, longitude: longitudeUser },
              5000,
              options,
              (err, locations) => {
                if (err) console.error(err);
                else {
                  // res.send(locations[0]);
                }
              }
            );
          }
        }
      }
    );
  } catch (err) {
    res.json(err);
  }
});

//sos
const helpme = require('./routes/sos');
app.use('/sos', helpme);

app.listen(3000, function () {
  console.log("server running on port 3000.");
});
