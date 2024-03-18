const express = require('express');
const app = express();
const math=require("mathjs")
const port = 3002;
const bodyParser = require('body-parser');
const axios=require('axios');
const bcrypt=require('bcryptjs');

const { initializeApp, cert} = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');


var serviceAccount = require("./key.json");

initializeApp({
    credential:cert(serviceAccount),
})
const db=getFirestore();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.get('/about', (req, res) => {
    res.render('about');
});

app.get("/",(req,res) => {
    res.send("hello world!");
})

app.get('/signin', (req, res) => {
  res.render('signin')
})

app.get('/signinsubmit', (req, res) => {
    const email=req.query.email;
    const password=req.query.password;
    
    db.collection("users")
     .where("email","==",email)
     .where("password","==",password)
     .get()
    .then((docs) => {
        if(docs.size>0){
            var userData=[];
                 docs.forEach((doc) => {
                     userData.push(doc.data());
                 })
            
             res.render("home",{userData:userData});
            
          }
          else{
             res.send("login failure");
          }
      })
            
})

app.get('/signupsubmit', (req, res) => {
     const full_name=req.query.full_name;
     //console.log("full_name: ",full_name);
     //const last_name=req.query.last_name;
     //console.log("last_name: ",last_name);
     const email=req.query.email;
     //console.log("email: ",email);
     const password=req.query.password;
     //console.log("password: ",password);
     const dob=req.query.dob;
     const acceptTerms=req.query.acceptTerms;

     db.collection('users').add({
        name: full_name,
        email:email,
        password:password,
        dob:dob,
        acceptTerms:acceptTerms,
     }).then(() => {
        //console.log("User added successfully");
        res.render("home",{ userData: { name: full_name, email: email } });
     })
    //  .catch(error => {
    //     console.error("Error signing up:", error);
    //     res.status(500).send("Error signing up");
    //  });
})
  
app.get('/contact', (req, res) => {
     res.render('contact');
});
app.get('/contactsubmit', (req, res) => {
    const full_name = req.query.full_name;
    const email = req.query.email;
    const password = req.query.password;
    const review = req.query.review;

    db.collection('reviews').add({
        name: full_name || '',
        email: email || '',
        password: password || '',
        review: review || '',
        
    }, { merge: true, ignoreUndefinedProperties: true })
        .then(() => {
            res.render("thankyou");
        }).catch(error => {
            console.error("Error adding review:", error);
            res.status(500).send("Error adding review");
        });
});
app.get('/service', (req, res) => {
    res.render('services');
});
app.get('/servicesubmit', (req, res) => {
    res.render('home');
});

app.get('/signup', (req, res) => {
    res.render('signup')
});
let a=[];
let cost=[];
var amount=0;
app.get('/cart', (req, res) => {
    const value=req.query.itemName;
    var c=req.query.itemPrice;
    if(c){
        cost.push(c);
        c= math.evaluate(c.slice(0,c.length-0));
	amount =amount+c;
   
	a.push(value);
    }
	res.render("about");
});
app.get("/addtocart",(req,res)=>{
	if(typeof(a) !== "undefined"){
		db.collection("Cart").add({
			Cart : a,
			Cost : cost,
			TotalCost : amount,
		}).then(()=>{
			res.render("addtocart",{
                userData: {
                    productsData : a,  
                    cost : cost
                },
                amount : amount
            });
		});
	} else {
        console.error('Cart item is undefined');
    }
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})