import { defineConfig } from 'cypress';
require('dotenv').config()

export default defineConfig({
  viewportWidth: 1920,
  viewportHeight: 1080,
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  env: {
    auth0_domain: process.env.REACT_APP_AUTH0_DOMAIN,
    auth0_username: process.env.AUTH0_USERNAME,
    auth0_password: process.env.AUTH0_PASSWORD,
    auth0_client_id: process.env.REACT_APP_AUTH0_ID,
    auth0_audience: process.env.REACT_APP_AUTH0_AUDIENCE,
    auth0_secret: process.env.REACT_APP_AUTH0_SECRET,
    REACT_APP_AUTH0_MANAGEMENT_API_ACCESS_TOKEN: process.env.REACT_APP_AUTH0_MANAGEMENT_API_ACCESS_TOKEN,
    REACT_APP_AWS_ACCESS_KEY: process.env.REACT_APP_AWS_ACCESS_KEY,
    REACT_APP_AWS_SECRET_KEY: process.env.REACT_APP_AWS_SECRET_KEY,
    REACT_APP_AWS_BUCKET_NAME: process.env.REACT_APP_AWS_BUCKET_NAME
  }
});
