const mongoose = require("./mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      required: true,
      default: false,
    },
    activationToken: {
      type: String,
    },
    resetToken: {
      type: String,
    },
    resetTokenExpiry: {
      type: Number,
    },
    pages: {
      type: String,
      get(v) {
        return v == null ? [] : JSON.parse(v);
      },
      set(v) {
        if (v == null) {
          return v;
        }
        return typeof v === 'string' ? v : JSON.stringify(v);
      },
      default: "[]"
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

module.exports = mongoose.model("User", userSchema, "users", { overwriteModels: true });
