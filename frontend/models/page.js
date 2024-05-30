const mongoose = require("./mongoose");
const parser = require("node-html-parser");
const Schema = mongoose.Schema;

const astraOpenAIKey = process.env.ASTRA_OPENAI_KEY;

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
    $vectorize: String
  },
  {
    timestamps: true,
    collectionOptions: {
      vector: {
        dimension: 1536,
        metric: 'cosine',
        service: {
          provider: 'openai',
          modelName: 'text-embedding-ada-002',
          authentication: {
            providerKey: `${astraOpenAIKey}.providerKey`
          }
        }  
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
  const text = this.textContent;

  if (text) {
    this.$vectorize = text;
  }
});

module.exports = mongoose.model("Page", pageSchema, "Page", { overwriteModels: true });
