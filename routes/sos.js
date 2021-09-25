const express = require("express");
const router = express.Router();
const { sos } = require('../models/sos-models');

router.post("/", async (req, res) => {
  const dataSOSPost = new sos({
    latitude: req.body.latitude,
    longitude: req.body.longitude,
  });

  try {
    const dataSOS = await dataSOSPost.save();
    res.json(dataSOS);
  } catch (err) {
    res.json([
      {
        message: err,
      },
    ]);
  }
});

router.get("/", async (req, res) => {
  try {
    const dataSOS = await sos.find();
    res.json(dataSOS);
  } catch (err) {
    res.json([
      {
        message: err,
      },
    ]);
  }
});

router.delete("/:iddstr", async (req, res) => {
  try {
    const dataSOSDelete = await sos.deleteOne({
      _id: req.params.iddstr,
    });
    res.json("delete success");
  } catch (err) {
    res.json([
      {
        message: err,
      },
    ]);
  }
});

module.exports = router;