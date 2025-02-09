require("dotenv").config({
  path: `${__dirname}/.env.local`
});

const mongoose = require("./models/mongoose");
const Page = require("./models/page");
const RateLimit = require("./models/rateLimit");
const User = require("./models/user");

run().catch(error => {
  console.error(error);
  process.exit(-1);
});

async function run() {
  const existingCollections = await mongoose.connection.listCollections()
    .then(collections => collections.map(coll => coll.name));
  console.log("Existing collections", existingCollections);
  if (!existingCollections.includes(Page.collection.collectionName)) {
    console.log("Creating collection", Page.collection.collectionName);
    await Page.createCollection();
  }
  if (!existingCollections.includes(User.collection.collectionName)) {
    console.log("Creating collection", User.collection.collectionName);
    await User.createCollection();
  }
  if (!existingCollections.includes(RateLimit.collection.collectionName)) {
    console.log("Creating collection", RateLimit.collection.collectionName);
    await RateLimit.createCollection();
  }

  console.log("Done");
  process.exit(0);
}