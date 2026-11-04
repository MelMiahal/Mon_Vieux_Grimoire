require('dotenv').config();

const app = require('./src/app');
const connectDatabase = require('./src/config/database');

const port = Number(process.env.PORT) || 4000;

async function startServer() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured in backend/.env');
  }

  await connectDatabase();

  app.listen(port, () => {
    console.log(`Mon vieux grimoire backend listening on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error('Unable to start the backend:', error);
  process.exitCode = 1;
});
