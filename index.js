const connectToMongo = require('./db');
var cors = require('cors');

connectToMongo();
const express = require('express')
const app = express()
const port = 5000


app.use(cors());

// connectToMongo().then(() => console.log("connected to mongo"));
// connectToMongo().catch(err => console.log(err));



// app.get('/', (req, res) => {
//   res.send('Hello World!')
// })  iski jagah hm app.use() ka use karke routes ko access karenge
app.use(express.json());//for using req.body


//available Routes

app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/details', require('./routes/details'));

app.listen(port, () => {
  console.log(`iNotebook backend  listening on port ${port}`)
})

