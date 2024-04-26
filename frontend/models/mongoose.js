const mongoose = require("mongoose");

const stargateMongoose = require("stargate-mongoose");
mongoose.setDriver(stargateMongoose.driver);

mongoose.connect(process.env.ASTRA_CONNECTION_STRING, { isAstra: true, useHTTP2: false });

module.exports = mongoose;