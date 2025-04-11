const fs = require('fs');
const path = require('path');
const successColor = '\x1b[32m%s\x1b[0m';
const checkSign = '\u{2705}';
const dotenv = require('dotenv').config({path: 'src/.env'});

// Try to load from .env file, but don't fail if it doesn't exist
require('dotenv').config();

// Get API key from environment variables (works with both local .env and Vercel env vars)
const apiKey = process.env.COINCAP_API_KEY || 'default-key-for-development';

const envFile = `export const environment = {
    COINCAP_API_KEY: '${apiKey}'
};
`;

// Create development environment file
const targetPath = path.join(__dirname, './src/environments/environment.development.ts');
fs.writeFile(targetPath, envFile, (err) => {
    if (err) {
        console.error(err);
        throw err;
    } else {
        console.log(successColor, `${checkSign} Successfully generated environment.development.ts`);
    }
});

// Create production environment file
const prodTargetPath = path.join(__dirname, './src/environments/environment.prod.ts');
fs.writeFile(prodTargetPath, envFile, (err) => {
    if (err) {
        console.error(err);
        throw err;
    } else {
        console.log(successColor, `${checkSign} Successfully generated environment.prod.ts`);
    }
});

// Create default environment file
const defaultTargetPath = path.join(__dirname, './src/environments/environment.ts');
fs.writeFile(defaultTargetPath, envFile, (err) => {
    if (err) {
        console.error(err);
        throw err;
    } else {
        console.log(successColor, `${checkSign} Successfully generated environment.ts`);
    }
});