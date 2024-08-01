import 'dotenv/config';
import client from './bot';

client.login(process.env.BOT_TOKEN)
    .catch(error => {
        console.error('Error logging in the bot:', error);
    });
