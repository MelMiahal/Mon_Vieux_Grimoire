require('dotenv').config();

const app = require('./src/app');
const connectDatabase = require('./src/config/database');

const port = Number(process.env.PORT) || 4000;

async function startServer() {
  await connectDatabase();

  app.listen(port, () => {
    console.log(`Mon vieux grimoire backend listening on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error('Unable to start the backend:', error);
  process.exitCode = 1;
});
