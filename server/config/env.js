// server/config/env.js
// Load environment variables FIRST before any other imports
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Go up one directory from config/ to server/
const envPath = join(__dirname, '..', '.env');

const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('❌ Error loading .env file:', result.error);
  console.error('   Looking for .env at:', envPath);
} else {
  console.log('✅ Environment variables loaded');
}

export default process.env;
