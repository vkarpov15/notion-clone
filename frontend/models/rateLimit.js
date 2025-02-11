const mongoose = require("./mongoose");
const Schema = mongoose.Schema;

const rateLimitSchema = new Schema(
  {
    functionName: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      required: true
    }
  },
  { timestamps: true, autoCreate: false, autoIndex: false }
);

module.exports = mongoose.model("RateLimit", rateLimitSchema, "ratelimits", { overwriteModels: true });
