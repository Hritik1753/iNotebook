const mongoose = require('mongoose');
require('dotenv').config();


async function main() {
    await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Error connecting to MongoDB", error));
  
    // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
  }

// const connectToMongo = () => {
//     mongoose.connect('mongodb://127.0.0.1:27017/test', () => {
//         console.log("connected successfully to mongo");
//     });
// }


module.exports = main;