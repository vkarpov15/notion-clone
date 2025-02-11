require("dotenv").config({
  path: `${__dirname}/.env.local`
});

const mongoose = require("./models/mongoose");
const Page = require("./models/page");
const RateLimit = require("./models/rateLimit");
const User = require("./models/user");

const { tableDefinitionFromSchema } = require('stargate-mongoose');

run().catch(error => {
  console.error(error);
  process.exit(-1);
});

async function run() {
  const tableNames = await mongoose.connection.listTables({ nameOnly: true });
  if (!tableNames.includes(Page.collection.collectionName)) {
    const pageTableDefinition = tableDefinitionFromSchema(Page.schema);
    pageTableDefinition.columns.vector = { type: 'vector', dimension: 1536 };
    await mongoose.connection.createTable(Page.collection.collectionName, pageTableDefinition);
    await Page.syncIndexes();
    await mongoose.connection.collection(Page.collection.collectionName).runCommand({
        createVectorIndex: {
            name: 'pagesvector',
            definition: {
                column: 'vector'
            }
        }
    });
  }
  if (!tableNames.includes(RateLimit.collection.collectionName)) {
     await mongoose.connection.createTable(RateLimit.collection.collectionName, tableDefinitionFromSchema(RateLimit.schema));
  }
  if (!tableNames.includes(User.collection.collectionName)) {
    await mongoose.connection.createTable(User.collection.collectionName, tableDefinitionFromSchema(User.schema));
  }

  console.log("Done");
  process.exit(0);
}
