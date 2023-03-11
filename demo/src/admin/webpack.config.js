'use strict';

const path = require('path')

/* eslint-disable no-unused-vars */
module.exports = (config) => {
  // Note: we provide webpack above so you should not `require` it
  // Perform customizations to webpack config
  // Important: return the modified config
  config.resolve.alias['styled-components$'] = path.resolve(__dirname, '../../../node_modules/styled-components/dist/styled-components.js')
  return config;
};
