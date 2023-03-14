const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const { Tour } = require('./models/tourModel');
const { User } = require('./models/userModel');
const { Review } = require('./models/reviewModel');

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
    const dataTours = JSON.parse(
      fs.readFileSync(`${__dirname}/dev-data/data/tours.json`, 'utf-8')
    );
    const dataUsers = JSON.parse(
      fs.readFileSync(`${__dirname}/dev-data/data/users.json`, 'utf-8')
    );
    const dataReviews = JSON.parse(
      fs.readFileSync(`${__dirname}/dev-data/data/reviews.json`, 'utf-8')
    );
    await Tour.create(dataTours);
    /* 
    To prevent the error when we are adding the user becuse thier is a validation on passwordConfirm filed.
    By default, documents are automatically validated before they are saved to the database. This is to prevent saving an invalid document. If you want to handle validation manually, and be able to save objects which don't pass validation, you can set validateBeforeSave to false.

    And we also need to comment the save validator meddlewair in the user model as well 
    */
    await User.create(dataUsers, {validateBeforeSave:false}); 
    await Review.create(dataReviews);
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
    await User.deleteMany();
    await Review.deleteMany();
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
