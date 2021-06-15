import { config } from 'dotenv';

config();

export default () => {
  if (process.env.API_KEY == null) {
    throw new Error('Failed to retrieve API key!');
  }
  return {
    apiKey: process.env.API_KEY,
  };
};
