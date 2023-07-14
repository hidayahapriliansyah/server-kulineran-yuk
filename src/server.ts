import app from './app';
import db from './db';
import config from './config';

db.on('connected',() => {
  console.log('Terhubung ke MongoDB');

  if (db.readyState === 1) {
    console.log('Koneksi ke MongoDB berhasil!');
    app.listen(config.port, () => {
      console.log(`Server running on http://localhost:${config.port}`);
    });
  }
});

db.on('error', (error) => {
  console.error('Koneksi MongoDB gagal:', error);
});

db.on('disconnected', () => {
  console.log('Koneksi MongoDB terputus');
});