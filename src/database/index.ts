import sequelize from "./database";

class Database {
    private static instance: Database;
    public models: { [key: string]: any } = {};
    public sequelize = sequelize;

    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    public async initialize() {
        try {
            await sequelize.authenticate();
            // console.log('Database connection has been established successfully.');
        } catch (error) {
            console.error('Unable to connect to the database:\n', error);
        }

        await sequelize.sync()
            .then(() => {
                // console.log('Database synchronized successfully.');
            })
            .catch((error: any) => {
                console.error('Error synchronizing the database:', error);
            });
    }
}

const db = Database.getInstance();
export default db;
