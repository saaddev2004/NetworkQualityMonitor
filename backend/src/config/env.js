import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Loads .env BEFORE anything else reads process.env.
// ES module imports are hoisted, so this file must be imported first
// (db.js and server.js both do that). dotenv never overrides variables
// that are already set, so the first file that defines a key wins.
const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, '../../../.env') }); // <repo root>/.env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });    // backend/.env
