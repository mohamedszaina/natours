const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  process.exit(1);
});

const mongoose = require('mongoose');
const app = require('./app');

//DB
const DB = process.env.DATABASE.replace('<password>', process.env.DATABASE_PAS);

mongoose.set('strictQuery', false);
mongoose.connect(DB).then((con) => {
  // console.log(con.connections);
  console.log('DB successfully connected! 👍');
});

// server
const port = process.env.PORT || 3000;
const message = () => {
  console.log(`http://localhost:${port}`);
};
const server = app.listen(port, message);

// for Errors Outside Express: Unhandled Rejections
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
