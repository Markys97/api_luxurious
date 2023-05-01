const express = require('express')
var cors = require('cors')
const mysql= require('mysql');
const app = express();
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');


require('dotenv').config()

const port = process.env.PORT||3500;

const  sendEmail = async (myMail,MyEmailPassword,to,subject,message)=>{
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: myMail,
      pass: MyEmailPassword
    }
  });

  const mailOptions = {
    from:myMail,
    to: to,
    subject: subject,
    text: message,
    html:message
  };
   let info = await transporter.sendMail(mailOptions);
   return info
}





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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));


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

app.post('/user/confirm-email',(req,res)=>{
  let data = req.body.body;
  let currentLang = req.body.header.lang
  console.log(currentLang)
  data = JSON.parse(data);
  const userEmail= data.email;

 let token = Date.now().toString().slice(9,13)

  const emailRegex = new RegExp(/^[A-Za-z0-9_!#$%&'*+\/=?`{|}~^.-]+@[A-Za-z0-9.-]+$/, "gm");

  if(!emailRegex.test(userEmail))  res.status(400).send('bad email')

  sendEmail(process.env.EMAIL,process.env.EMAIL_PASSWORD,process.env.EMAIL,'juste a test ',`ton code est <b>${token}</b>`)
  .then(data => {
    if(data.messageId){
      res.status(200).json({"code":`${token}`})
    }
  })
  
})


// run server
app.listen(port , ()=> console.log(`app run on port ${port}`))
