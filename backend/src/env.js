/**
 * env.js — Must be the FIRST import in server.js.
 * In ES Modules, static imports are hoisted before module body code runs,
 * so dotenv.config() inside server.js runs AFTER route/service modules load.
 * Putting it here ensures .env is populated before anything else imports.
 */
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load backend/.env (one directory above src/)
dotenv.config({ path: path.resolve(__dirname, '../.env') })
// Fallback: also try process cwd
dotenv.config()

