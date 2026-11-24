// Jest: an image require() becomes its repo-relative path (enough for layout tests/previews).
const path = require('path');
module.exports = {
  process(_src, filename) {
    return { code: `module.exports = ${JSON.stringify(path.relative(process.cwd(), filename))};` };
  },
};
