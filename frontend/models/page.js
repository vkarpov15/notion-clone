const axios = require("axios");
const mongoose = require("./mongoose");
const parser = require("node-html-parser");
const Schema = mongoose.Schema;

const pageSchema = new Schema(
  {
    blocks: [
      {
        tag: {
          type: String,
          required: true,
        },
        html: {
          type: String,
          required: false,
        },
        imageUrl: {
          type: String,
          required: false,
        },
      },
    ],
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    $vector: {
      type: [Number],
      default: undefined
    },
  },
  {
    timestamps: true,
    collectionOptions: {
      vector: {
        dimension: 1536,
        metric: 'cosine'
      }
    }
  }
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
