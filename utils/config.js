const path = require('path');
const dotenv = require('dotenv');
const { cleanEnv, str, port } = require('envalid');

// Determine which environment file to use based on the NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';

// Load the common environment variables
dotenv.config({
  path: path.resolve(__dirname, '.env'),
});

// Load the environment specific variables
dotenv.config({
  path: path.resolve(__dirname, envFile),
});

// Validate the environment variables
const env = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'production'] }),
  ASSET_PATH: str(),
  PORT: port(), 
  NPM_PACKAGE_DESCRIPTION: str(),
  NPM_PACKAGE_VERSION: str(),
});

module.exports = env;
