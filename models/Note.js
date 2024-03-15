const mongoose = require('mongoose');
const { Schema } = mongoose;

const NotesSchema = new Schema({
    user: {
        //it is work as foriegn key to access particular notes
        type: mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    title: {
        type: String,
        required:true
    }, // String is shorthand for {type: String}
    description: {
        type: String,
        required:true
    },
    tag: {
        type: String,
        default:"General"
    },
    date: {
        type: Date,
        default:Date.now
    }
});
  
module.exports = mongoose.model('notes', NotesSchema);
