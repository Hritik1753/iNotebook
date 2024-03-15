const mongoose = require('mongoose');
const { Schema } = mongoose;
const UserSchema = new Schema({
    name: {
        type: String,
        required:true
    },
    email: {
        type: String,
        required: true,
        unique:true
    },
    password: {
        type: String,
        required:true
    }
    
});
const User = mongoose.model('user', UserSchema);
//for uniqueness of users with email
// User.createIndexes;
  
module.exports = User;