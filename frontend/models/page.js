const axios = require("axios");
const mongoose = require("./mongoose");
const parser = require("node-html-parser");
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

pageSchema.virtual('textContent').get(function() {
  let text = '';
  for (let i = 0; i < this.blocks.length; i++) {
    if (this.blocks[i].html) {
      const blockText = parser.parse(this.blocks[i].html).textContent;
      if (!blockText) {
        continue;
      }
      text += `${blockText}\n`;
    }
  };

  return text;
});

pageSchema.pre('save', async function() {
  this.$vector = undefined;
  const text = this.textContent;

  if (text) {
    const $vector = await axios({
      method: 'POST',
      url: 'https://api.openai.com/v1/embeddings',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      data: {
        model: 'text-embedding-ada-002',
        input: text
      }
    }).then(res => res.data.data[0].embedding);
    this.$vector = $vector;
  }
});

module.exports = mongoose.model("Page", pageSchema, "pages", { overwriteModels: true });
