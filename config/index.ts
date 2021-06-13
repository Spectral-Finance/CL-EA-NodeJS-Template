import { config } from 'dotenv';
config();

export const getConfig = () => {
    if (process.env.API_KEY == null) {
        throw "Failed to retrieve API key!"
    }
    return {
        apiKey: process.env.API_KEY
    }
}