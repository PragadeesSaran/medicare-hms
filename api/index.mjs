/**
 * Vercel serverless function entry point.
 * Imports the Express app bundle (built by artifacts/api-server/build.mjs)
 * and exports it as the default handler for Vercel's Node.js runtime.
 */
export { default } from '../artifacts/api-server/dist/app.mjs';
