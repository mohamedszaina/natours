const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const { Tour } = require('./models/tourModel');

// DB CONNECTION
const DB = process.env.DATABASE.replace('<password>', process.env.DATABASE_PAS);

mongoose.set('strictQuery', false);
mongoose.connect(DB).then((con) => {
  // console.log(con.connections);
  console.log('DB successfully connected! 👍');
});

// Add the data
const importData = async () => {
  try {
    const data = JSON.parse(
      fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, 'utf-8')
    );
    await Tour.create(data);
    console.log('Imported');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

// Delete the data
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Deleted');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

// console.log(process.argv);

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
