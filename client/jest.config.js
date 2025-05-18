// jest.setup.js
const { TextEncoder, TextDecoder } = require('util');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;


module.exports = {
  moduleNameMapper: {
    '^react-router-dom$': 'react-router',
  },
};
