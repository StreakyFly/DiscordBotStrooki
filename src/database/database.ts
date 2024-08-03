import fs from 'fs';
import path from 'path';
// import { fileURLToPath, pathToFileURL } from 'node:url';
import { Sequelize, importModels, Model } from '@sequelize/core';
import { PostgresDialect } from '@sequelize/postgres';

// const __dirname = path.dirname(fileURLToPath(import.meta.url));

const models = [];
const modelsPath = path.join(__dirname, 'models');
const modelFiles = fs.readdirSync(modelsPath).filter(file => file.endsWith('.js') || file.endsWith('.ts'));

for (const file of modelFiles) {
    const modelPath = path.join(modelsPath, file);
    let model = require(modelPath);
    // let model = await import(pathToFileURL(modelPath).href);
    // "temporary" fix/workaround until who knows what happens
    for (const key in model) {
        // if (model.hasOwnProperty(key) && model[key].prototype instanceof Model) {
        if (model[key].prototype instanceof Model) {
            model = model[key];
            break;
        }
    }
    // model = model.default;  // if each module is exported as default
    models.push(model);
}

const sequelize = new Sequelize({
    dialect: PostgresDialect,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT!),
    logging: false,  // console.log
    // https://sequelize.org/docs/v7/models/defining-models/
    // models: await importModels(__dirname + '/models/RPSPlayerStats.model.ts'),
    models: models
});

export default sequelize;
