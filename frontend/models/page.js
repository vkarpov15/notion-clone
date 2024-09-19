const mongoose = require("./mongoose");
const Schema = mongoose.Schema;

const pageSchema = new Schema(
  {
    blocks: {
      type: String,
      get(v) {
        return v == null ? v : JSON.parse(v);
      },
      set(v) {
        if (v == null) {
          return v;
        }
        return typeof v === 'string' ? v : JSON.stringify(v);
      },
      default: "[]"
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    createdAt: {
      type: Number,
      default: () => Date.now(),
      get(v) {
        return v == null ? v : new Date(v)
      }
    },
    updatedAt: {
      type: Number,
      default: () => Date.now(),
      get(v) {
        return v == null ? v : new Date(v)
      }
    },  
  },
  { timestamps: true, versionKey: false, toObject: { getters: true }, toJSON: { getters: true } }
);

module.exports = mongoose.model("Page", pageSchema, "pages", { overwriteModels: true });
