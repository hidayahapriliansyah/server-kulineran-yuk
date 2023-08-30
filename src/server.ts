import app from './app';
import prisma from './db';
import config from './config';

prisma.$connect()
  .then(() => {
    console.log('Connected to PostgreSQL database');

    app.listen(config.port, () => {
      console.log(`Server running on http://localhost:${config.port}`);
    });
  })
  .catch(error => {
    console.error('Failed to connect to PostgreSQL database:', error);
  });

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('Disconnected from PostgreSQL database');
  process.exit();
});
