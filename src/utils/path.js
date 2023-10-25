import dotenv from 'dotenv';
import path from 'path';
const __dirname = process.cwd();

dotenv.config({ path: `${__dirname}` });

export {  __dirname,path };
