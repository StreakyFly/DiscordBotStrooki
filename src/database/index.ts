import { Sequelize } from 'sequelize';
import * as fs from 'node:fs';
import * as path from 'node:path';

const models: { [key: string]: any } = {};

const initDatabase = async () => {
    // Initialize sequelize and connect to the PostgreSQL database
    const sequelize = new Sequelize(
        process.env.DB_NAME!,
        process.env.DB_USER!,
        process.env.DB_PASS,
        {
            host: process.env.DB_HOST,
            dialect: 'postgres',
        }
    );

    try {
        await sequelize.authenticate();
    } catch (error) {
        console.error('Error connecting to the database:', error);
        process.exit(1);
    }

    // Load all models
    const modelsPath = path.join(__dirname, 'models');
    const modelFiles = fs.readdirSync(modelsPath).filter(file => file.endsWith('.js') || file.endsWith('.ts'));

    for (const file of modelFiles) {
        const modelPath = path.join(modelsPath, file);
        const model = require(modelPath).default;
        const modelName = path.basename(file, path.extname(file));
        models[modelName] = model(sequelize);
    }

    // Synchronize the database
    sequelize.sync()
        .then(() => {
            console.log('Database synchronized successfully.');
        })
        .catch(error => {
            console.error('Error synchronizing the database:', error);
        });
}

export { models, initDatabase };
