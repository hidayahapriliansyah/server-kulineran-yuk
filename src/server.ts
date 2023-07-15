import app from './app';
import db from './db';
import config from './config';

db.on('connected',() => {
  console.log('Connecting to MongoDB ...');

  if (db.readyState === 1) {
    console.log('Successed to connect to MongoDB!');
    app.listen(config.port, () => {
      console.log(`Server running on http://localhost:${config.port}`);
    });
  }
});

db.on('error', (error) => {
  console.error('MongoDB connection is fail:', error);
});

db.on('disconnected', () => {
  console.log('MongoDB connection is lost');
});