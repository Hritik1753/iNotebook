const mongoose = require('mongoose');
const { Schema } = mongoose;
const UserdetailsSchema = new Schema({
    user: {
        //it is work as foriegn key to access particular notes
        type: mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    photo: {
        type:String
    },
    Phone: {
        type: String
        // required:true
    },
    address: {
        type: String
        // required: true,
    },
    country: {
        type: String, 
        required:true
    },
    links: {
        type: String
        // required:true
    }
    
});
const Userdetail = mongoose.model('details', UserdetailsSchema);
//for uniqueness of users with email
// User.createIndexes;
  
module.exports = Userdetail;