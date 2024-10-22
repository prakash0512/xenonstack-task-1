const dotenv = require('dotenv');
const multer = require('multer');
var express = require("express");
const cookieParser = require("cookie-parser");
const cookie = require("js-cookie");
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');
const fs = require('fs');
var app = express();
const register = require("./model/user");
dotenv.config({ path: './config.env' });
const PORT = process.env.PORT || 3000;
//isse connection ho jayega
require('./db/connection');

const auth = require('./middleware/auth');


//app.use(require('./router/auth'));
const User = require('./model/user');
// for hotel schema
const Hotel = require('./model/hotel');


const bodyParser = require("body-parser");

const path = require("path");
//var popup = require('popups');
let alert = require('alert');

app.set("view engine", "ejs");


// change 2

app.use(cookieParser());

// middleware



app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());


// for payment integration

var stripe = require('stripe')('sk_test_51MnHvySBHuevM7gjiPvdcc5eAVYH6AZ7cnIVlwDM0pfB6vUxbgzXFX8HeKYxRwpIztDuFYsFxOcofE6ghLL83fU9003poyH0My');
var Publishable_Key = 'pk_test_51MnHvySBHuevM7gjBSCCPY1G9ejS0qGvUJw1Do0T9nAUyvbeosfsv6pZ0z9I2CvXCEXgpu4OHKZRGXZ3j2ppYgvL00kLD93Mu3';



app.get("/book",auth, async (req, res) => {
    
    app.use(express.static("../frontend"));
    res.render(path.join(__dirname, "../frontend", "/book.ejs"));
});



app.post("/bookme",auth, async (req, res) => {
    
    app.use(express.static("../frontend"));
    res.render(path.join(__dirname, "../frontend", "/book.ejs"));
});



app.post('/book',auth, function (req, res) {
    // Moreover you can take more details from user
    // like Address, Name, etc from form
    //console.log("in get");
    stripe.customers.create({

        email: req.body.stripeEmail,
        source: req.body.stripeToken,
        name: 'Gourav Hammad',
        address: {
            line1: 'TC 9/4 Old MES colony',
            postal_code: '452331',
            city: 'Indore',
            state: 'Madhya Pradesh',
            country: 'India',
        }
    })
        .then((customer) => {

            return stripe.charges.create({
                amount: 2500,     // Charging Rs 25
                description: 'Web Development Product',
                currency: 'INR',
                customer: customer.id
            });
        })
        .then((charge) => {
            res.send("Success")  // If no error occurs
        })
        .catch((err) => {
            res.send(err)       // If some error occurs
        });
})






app.get("/", async (req, res) => {

    // for checking for user login or not
    fl = 0;


    try {



        const token = req.cookies.jwt;

        const varifyUser = jwt.verify(token, '12345678qwertyui');

        //console.log(varifyUser);
        const user = await register.findOne({ _id: varifyUser._id });
        //console.log("heyyy");
        //console.log(user);
        fl = 1;

    } catch (error) {
        fl = 0;

    }



    const hotel = await Hotel.find({});



    // change for search bar
    const city_data = [];
    for (i = 0; i < hotel.length; i++) {
        city_data.push(hotel[i].city);
    }
    app.use(express.static("../frontend"));
    res.render(path.join(__dirname, "../frontend", "/home.ejs"), { hotel: hotel, city_data: city_data, flag: fl });

});



app.post("/", async (req, res) => {

    // for checking for user login or not
    fl = 0;


    try {



        const token = req.cookies.jwt;

        const varifyUser = jwt.verify(token, 'mynameisdeepakduveshbackendwebdeveloper');

        //console.log(varifyUser);
        const user = await register.findOne({ _id: varifyUser._id });
        //console.log("heyyy");
        //console.log(user);
        fl = 1;

    } catch (error) {
        fl = 0;

    }



    const hotel = await Hotel.find({});



    // change for search bar
    const city_data = [];
    for (i = 0; i < hotel.length; i++) {
        city_data.push(hotel[i].city);
    }
    app.use(express.static("../frontend"));
    res.render(path.join(__dirname, "../frontend", "/home.ejs"), { hotel: hotel, city_data: city_data, flag: fl });

});



app.post("/signin", async function (req, res) {
    try {
        // check if the user exists
        const user = await User.findOne({ email: req.body.email });
        if (user) {
            //check if password matches
            const result = req.body.psw === user.password;
            // for token    ---->>>>
            const token = await user.generateAuthToken();
            //console.log("the token part" + token);
            res.cookie("jwt", token, {
                expires: new Date(Date.now() + 10000000),
                httpOnly: true
                //secure:true
            });

            // yaha tak ---->>>>>>

            if (result) {
                //changes are here
                const hotel = await Hotel.find({});


                // change for search bar
                const city_data = [];
                for (i = 0; i < hotel.length; i++) {
                    city_data.push(hotel[i].city);
                }
                fl = 1;

                res.render(path.join(__dirname, "../frontend", "/home.ejs"), { hotel: hotel, city_data: city_data, fl: fl });
                //res.sendFile(path.join(__dirname,"../frontend", "/home.html"));
            } else {
                // if password not match
                return res.json({ error: "invalid details !!" });
            }
        } else {


            // if user email is not exist 
            res.sendFile(path.join(__dirname, "../frontend", "/signup.html"));

        }
    } catch (error) {
        res.status(400).json({ error });
    }
});

// for search page




app.get("/search", async (req, res) => {
    fl = 0;


    try {




        const token = req.cookies.jwt;

        const varifyUser = jwt.verify(token, 'mynameisdeepakduveshbackendwebdeveloper');

        //console.log(varifyUser);
        const user = await register.findOne({ _id: varifyUser._id });
        //console.log("heyyy");
        //console.log(user);
        fl = 1;

    } catch (error) {
        fl = 0;

    }
    app.use(express.static("../frontend"));
    res.sendFile(path.join(__dirname, "../frontend", "/search.ejs", { fl: fl }));
});


app.post("/search", async function (req, res) {

    var search_data = req.body.query;
    const hotel = await Hotel.find({ city: search_data });
    const hotel2 = await Hotel.find({});
    // change for search bar 
    const city_data = [];
    for (i = 0; i < hotel2.length; i++) {
        city_data.push(hotel2[i].city);
    }
    res.render(path.join(__dirname, "../frontend", "/search.ejs"), { hotel: hotel, city_data: city_data });


});


// for my account

app.post("/myaccount", async function (req, res) {
    var user;
    try {



        const token = req.cookies.jwt;

        const varifyUser = jwt.verify(token, 'mynameisdeepakduveshbackendwebdeveloper');

        //console.log(varifyUser);
        user = await register.findOne({ _id: varifyUser._id });
        //console.log("heyyy");
        //console.log(typeof(user.email));
        //email=user.email;
        //res.render(path.join(__dirname,"../frontend", "/myaccount.ejs",{email:user.email}));



    } catch (error) {
        console.log("problem hai");

    }


    res.render(path.join(__dirname, "../frontend", "/myaccount.ejs"), { user: user });



});

// for hotel wala page


app.get("/hotel", async (req, res) => {
    fl = 0;


    try {



        const token = req.cookies.jwt;

        const varifyUser = jwt.verify(token, 'mynameisdeepakduveshbackendwebdeveloper');

        //console.log(varifyUser);
        const user = await register.findOne({ _id: varifyUser._id });
        //console.log("heyyy");
        //console.log(user);
        fl = 1;

    } catch (error) {
        fl = 0;

    }
    app.use(express.static("../frontend"));
    res.sendFile(path.join(__dirname, "../frontend", "/hotel.ejs", { fl: fl }));
});



app.post("/hotel", async function (req, res) {

    var search_data = req.body.query2;
    const hotel = await Hotel.findOne({ name: search_data });

    res.render(path.join(__dirname, "../frontend", "/hotel.ejs"), { hotel: hotel });


});



app.use(express.static('../frontend/static'));


var storage = multer.diskStorage({
    destination: "../frontend/static",
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname))

    }
})



var upload = multer({
    storage: storage
}).single('file');




// for signup page




app.get("/signup", (req, res) => {
    app.use(express.static("../frontend"));
    res.sendFile(path.join(__dirname, "../frontend", "/signup.html"));
});




app.post('/signup', upload, (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const cpassword = req.body.cpassword;
    const name = req.body.name;
    const contact = req.body.contact;
    const image = req.file.filename;

    if (!email || !password || !cpassword) {

        return res.json({ error: "fill properly!!" });

    }
    if (password != cpassword) {

        return res.json({ error: "password not match!!" });
    }


    con = String(contact);
    if (con.length != 10)
        return res.json({ error: "not a valid number" });

    User.findOne({ email: email, password: password })
        .then(async (userExist) => {
            if (userExist)
                return res.status(422).json({ error: "email exists already" });

            const user = new User({ name: name, email: email, password: password, contact: contact, image: image });


            user.save().then(() => {
                res.status(201).json({ message: "registered !! " });
            }).catch((err) => res.status(500).json({ error: "failed to register !! " }));


        }).catch(err => { console.log(err); });

    //console.log(req.body);
    //res.json({message:req.body});
});




// for hotal signup page

// for image 



app.get("/signuphotel", (req, res) => {
    app.use(express.static("../frontend"));
    res.sendFile(path.join(__dirname, "../frontend", "/signuphotel.html"));
});




app.post('/signuphotel', upload, (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const cpassword = req.body.cpassword;
    const name = req.body.name;
    const price = req.body.price;
    const city = req.body.city;
    const address = req.body.address;
    const contact = req.body.contact;
    const rating = 3;
    const image = req.file.filename;
    if (password != cpassword) {

        return res.json({ error: "password not match!!" });
    }

    // checking for correct number


    con = String(contact);
    if (con.length != 10)
        return res.json({ error: "not a valid number!!" });



    Hotel.findOne({ email: email, password: password })
        .then((userExist) => {
            if (userExist)
                return res.status(422).json({ error: "email exists already" });

            const hotel = new Hotel({ email: email, password: password, name: name, price: price, city: city, address: address, contact: contact, rating: rating, image: image });

            hotel.save().then(() => {
                res.status(201).json({ message: "registered !! " });
            }).catch((err) => res.status(500).json({ error: "failed to register !! " }));


        }).catch(err => { console.log(err); });

    //console.log(req.body);
    //res.json({message:req.body});
});



app.get("/signinhotel", (req, res) => {
    app.use(express.static("../frontend"));
    res.sendFile(path.join(__dirname, "../frontend", "/signinhotel.html"));
});





app.post("/signinhotel", async function (req, res) {
    try {
        // check if the user exists
        const hotel = await Hotel.findOne({ email: req.body.email });
        if (hotel) {
            //check if password matches
            // console.log("mil gya");
            const result = req.body.psw === hotel.password;
            if (result) {
                res.sendFile(path.join(__dirname, "../frontend", "/homehotel.html"));
            } else {
                return res.status(422).json({ error: "email password does not match !!!!" });
            }

        } else {

            // hotel register hi ni to go to register page
            return res.sendFile(path.join(__dirname, "../frontend", "/signuphotel.html"));
        }
    } catch (error) {
        res.status(400).json({ error });
    }
});





////////////////////////
app.post("/logout", auth, async function (req, res) {
    try {
        res.clearCookie("jwt");
        fl = 0;
        const hotel = await Hotel.find({});



        // change for search bar
        const city_data = [];
        for (i = 0; i < hotel.length; i++) {
            city_data.push(hotel[i].city);
        }
        app.use(express.static("../frontend"));
        res.render(path.join(__dirname, "../frontend", "/home.ejs"), { hotel: hotel, city_data: city_data, flag: fl });

    } catch (error) {
        res.status(500).send(error);
    }
});






app.listen(PORT, () => {
    console.log("Server listening on port " + `${PORT}`);
});