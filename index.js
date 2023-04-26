const express = require('express')
var cors = require('cors')
const mysql= require('mysql');
const app = express();
require('dotenv').config()

const port = process.env.PORT||3500;



//database set up
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
app.use(express.static(__dirname+'/public'))

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


app.get('/listCategory', (req, res) => {
    let listproduct;
     connection.query('SELECT * FROM `category`',
      function (error, results, fields) {
        if(error) throw error
        listproduct= results
        res.json(listproduct)
     })
})


app.get('/recentProduct', (req, res) => {
    let listproduct;
     connection.query('SELECT id, imgs->>"$.preview" AS img_preview FROM `product` ORDER BY `date_in` DESC  LIMIT 3',
      function (error, results, fields) {
        if(error) throw error
        listproduct= results
        res.json(listproduct)
     })
})

app.get('/product/:id',(req,res)=>{
  const id = req.params.id;
  const isGoodId = /^[0-9]+$/;
  let data;
  
  if(!isGoodId.test(id)){
    res.status(404).send('bad params')
    return 
  }

  connection.query('SELECT id,colors,name,price,genre,description, JSON_EXTRACT(imgs,"$.size") AS size, JSON_EXTRACT(imgs,"$.all") AS imgs,JSON_EXTRACT(imgs,"$.preview") as preview FROM `product` WHERE `id`=?',[id],(err,results,fields)=>{
    if(err) throw err

    res.status(200).json(results)
  })
  

 
})


// run server
app.listen(port , ()=> console.log(`app run on port ${port}`))
