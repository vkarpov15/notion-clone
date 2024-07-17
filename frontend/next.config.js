const withImages = require("next-images");

const { execSync } = require("child_process");
require("@mongoosejs/studio/frontend")('/api/studio', true).then(() => {
  execSync(`
  mkdir -p ./public/studio
  cp -r ./node_modules/@mongoosejs/studio/frontend/public/* ./public/studio/
  cp -r ./node_modules/@mongoosejs/studio/frontend/public/* ./public/
  `);
});

module.exports = withImages({});
