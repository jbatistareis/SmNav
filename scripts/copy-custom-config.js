const existingConfig = require('../node_modules/@ionic/app-scripts/config/copy.config');
module.exports = Object.assign(existingConfig, {
    copyConfigFile: {
      src: ['{{ROOT}}/config.json'],
      dest: '{{WWW}}/assets'
    }
  }
);
