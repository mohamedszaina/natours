const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { use } = require('../routes/userRoutes');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  role: {
    type: String,
    required: [true, 'A user must have a role'],
    enum: {
      values: ['admin', 'guide', 'lead-guide', 'user'],
      message: 'roles are either: admin, guide, lead-guide, user',
    },
    default: 'user',
  },
  // active: { type: Boolean, default: true },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 7,
    select: false, // now will not appear in the send request
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    //this only works with create and save
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'passwords are not the same!',
    },
  },
  passwordChangedAt: {
    type: Date,
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetExpires: {
    type: Date,
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  // only when the password is changed or also created new
  /*means that (we will do the hashing when only create a new password or updating it 
  not when ever we updating other fields 
  such as email for example or name 
  so we must not re value the password field with a new hash)*/
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  //delete that passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  /* (I think it will work without it too but lets do it like that) 
  -1000 It is to prevent any time delays in creating the token and updating the changed at field. By saying the changed at field was done a second earlier the chances of any network delays creating a bug where the new token appears to be created before the time changedAt value. */
  next();
});

// this will show all the users with the property active=true only when the getAllUsers middleware called
userSchema.pre(/^find/, function (next) {
  // this.find({active:true}) not the same
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (
  bodyPassword,
  userPassword
) {
  return await bcrypt.compare(bodyPassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (jwtTimeStamp) {
  if (this.passwordChangedAt) {
    const parseChangedPasswordTime = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    // console.log(parseChangedPasswordTime, jwtTimeStamp);
    return parseChangedPasswordTime > jwtTimeStamp;
  }

  //false means that the password didn't change
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  /*
1. User forgot / wants to change his password

2. We create a new, temporary password for the user using node's crypto module:

const resetToken = crypto.randomBytes(36).toString('hex');
3. This creates a 72 characters long, cryptographically strong (very random) password using hexadecimal encoding (numbers 0-9, letters A-F). Try running this in the terminal to understand the returned value:

node -e "console.log(require('crypto').randomBytes(4).toString('hex'));"

4. We create the hashed version of this password using the crypto module's createHash function, since we never want to store the plain text password in the database.

5. We chose "sha256" hashing function, which is a very fast operation (as opposed to bcrypt's slow hashing function), which is why we don't need to do this operation asynchronously, as it takes less than a millisecond to complete. The downside to this is that possible attackers can compare our hash to a list of commonly used passwords a lot more times in a given time frame then if using bcrypt, which is a slow operation. So you can do millions of password checks in the same amount of time that it takes to make 1 check using bcrypt. However, this is not a problem here as: a) we used a very long and very random password (as opposed to user generated passwords, which usually have meaning and are far from random) and b) our password is only valid for 10 minutes, so there is literally zero chance for the attacker to guess the password in that short amount of time.

6. We send a plain-text version of our password back to the user so he/she can use it to log-in for the next 5 minutes.
 */

  // create a random characters and convert them to hex type using node's crypto module
  const resetToken = crypto.randomBytes(32).toString('hex');

  // crypt the restToken I just create randomly
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  console.log({ resetToken }, this.passwordResetToken);
  // set an expiration time to it
  this.passwordResetExpires = Date.now() + 5 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = { User };
