const express = require('express')
var cors = require('cors')
const mysql= require('mysql');
const app = express();
require('dotenv').config()

const port = process.env.PORT||3500;



//database set upclear
const connection = mysql.createConnection({
    host     :process.env.DB_HOST,
    user     : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    database : process.env.DB_NAME,
});


connection.connect(function(err) {

    if (err) {
      console.error('error connecting: ' + err.stack);
      return;
    }
   
    console.log('connected as id ' + connection.threadId);
});

// middleware
app.use(cors())

// route
app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/listProduct', (req, res) => {
    let listproduct;
     connection.query('SELECT * FROM `product`',
      function (error, results, fields) {
        if(error) throw error
        listproduct= results
        res.json(listproduct)
     })
})


// run server
app.listen(port , ()=> console.log(`app run on port ${port}`))
