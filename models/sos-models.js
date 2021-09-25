const mongoose = require("mongoose");
mongoose.connect(process.env.MONGOURI, { useNewUrlParser: true });

const sos = mongoose.model(
  "SOS",
  {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    created_date: {
      type: Date,
      default: Date.now,
    },
  },
  "SOS"
);

module.exports = {
  sos,
};
