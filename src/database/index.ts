import { Sequelize } from 'sequelize';
import * as fs from 'node:fs';
import * as path from 'node:path';

class Database {
    private static instance: Database;
    public sequelize: Sequelize;
    public models: { [key: string]: any } = {};

    private constructor() {
        this.sequelize = new Sequelize(
            process.env.DB_NAME!,
            process.env.DB_USER!,
            process.env.DB_PASS,
            {
                host: process.env.DB_HOST,
                dialect: 'postgres',
                logging: false,
            }
        );
    }

    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    public async initialize() {
        await this.sequelize.authenticate();

        const modelsPath = path.join(__dirname, 'models');
        const modelFiles = fs.readdirSync(modelsPath).filter(file => file.endsWith('.js') || file.endsWith('.ts'));

        for (const file of modelFiles) {
            const modelPath = path.join(modelsPath, file);
            const model = require(modelPath).default;
            const modelName = path.basename(file, path.extname(file));
            this.models[modelName] = model(this.sequelize);
        }

        await this.sequelize.sync()
            .catch(error => {
                console.error('Error synchronizing the database:', error);
            });
    }
}

const db = Database.getInstance();
export default db;
