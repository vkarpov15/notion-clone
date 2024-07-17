const withImages = require("next-images");

const { execSync } = require("child_process");
require("@mongoosejs/studio/frontend")('/api/studio', true).then(() => {
  execSync(`
  cp -r ./node_modules/@mongoosejs/studio/frontend/public/* ./public/
  `);
});

module.exports = withImages({});
