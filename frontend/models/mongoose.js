const mongoose = require("mongoose");

mongoose.set('autoCreate', false);
mongoose.set('autoIndex', false);

const stargateMongoose = require("stargate-mongoose");
mongoose.setDriver(stargateMongoose.driver);

mongoose.connect(process.env.ASTRA_CONNECTION_STRING, { isAstra: process.env.DATA_API_LOCAL ? false : true, username: 'cassandra', password: 'cassandra' });

module.exports = mongoose;
