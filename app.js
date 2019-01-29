// dum dum dum..... no generator
// first, well this is an express app. Maybe we should get......EXPRESS!??!?

const express = require("express");
// Make an express app
let app = express();

// bcrypt must be installed for security hashing
const bcrypt = require("bcrypt-nodejs");
// put our helmet on!
const helmet = require("helmet");
// app.use means, add some middleware
// middleware = any function that has access to req and res
app.use(helmet());

// set up mysql connection
const mysql = require("mysql");
const config = require("./config");
let connection = mysql.createConnection(config.db);
// we have a connection, lets connect
connection.connect();
// go into sql and create new db with name wildOrNot
// go into sql and give user x schema privelges for this database

// add ejs, so we can render!
app.set("views", "views");
app.set("view engine", "ejs");

// set up public folder
app.use(express.static("public"))


// we need the body parser and urlencode middleware
// so we can get data from post reequests
const bodyParser = require("body-parser");
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({extended: false}));

app.get("/", (req,res,next)=>{
    // res.send("sanity check");
    const animalQuery = "SELECT * FROM animals;";
    connection.query(animalQuery,(error,results)=>{
        if(error){
            throw error
        }
        // results is an array of all rows in animals
        // grab a random one
        const rand = Math.floor(Math.random() * results.length);
        res.render("index", {animal: results[rand]});
        console.log(results)
    });
});



// add a new route to handle the votes
// ex /vote/wild/1
app.get("/vote/:value/:id", (req,res,next)=>{
    const value = req.params.value;
    const id = req.params.id;
    const insertQuery = `INSERT INTO votes (id,aid,value)
    VALUES
    (DEFAULT,?,?);`;
    // console.log(value);
    // console.log(id);
    connection.query(insertQuery,[id,value],(error,results)=>{
        if(error){
            throw error
        }
        res.redirect("/");
    });
});

app.get("/standings", (req,res,next)=>{
    // this is a specific query to only get the data that you want to JS
    const selectQuery = `SELECT SUM(IF(value='domestic',1,-1)) AS domesticCount, 
    MAX(animals.species) as species FROM votes     
    INNER JOIN animals ON votes.aid = animals.id   
    GROUP BY animals.species
    ORDER BY domesticCount;` 

    // const giveMeAllTheDataAndJSWillFigureItOUT = `
    // SELECT * FROM votes
    // INNER JOIN animals ON votes.aid = animals.id;`;

    connection.query(selectQuery, (error,results)=>{
        if(error){
            throw error
        }
        res.render("standings",{results})
        console.log(results);
    });
});
// make route /standings
// that will show current votes for each side

app.get("/register", (req,res,next)=>{
    res.render("register", {});
})

app.post("/registerProcess", (req,res,next)=>{
    // res.json(req.body);
    const hashedPass = bcrypt.hashSync(req.body.password);  
    // const match = bcrypt.compareSync('x','$2a$10$/AIQo3.ojIKlv8hF2Zzo/uKuktqWO9skd8kun2YECFHl2WhnsZuW2');   
    // const match2 = bcrypt.compareSync('x','$2a$10$us61i0sFyjFXDz2kwdnpyuxnfHvsB2t6l9GvJzHMKdhuYm0a3WQWG');
    // res.json({match,match2});
    res.json(hashedPass);
    // before we insert a new user into the users table
    // we need to make sure this email isnt already in the db
    const checkUserQuery = `SELECT * FROM users WHERE email = ?;`;
    connection.query(checkUserQuery,[req.body.email],(error,results)=>{
        if(error){throw error;}
        if(results.length != 0){
            // our query returned a row, this means this email is already registered
            res.redirect("/register?msg=register");
        } else {

        }
    });
});

app.listen(8282);