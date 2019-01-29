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
        // see if there is anything in the query string for msg
        let msg;
        if(req.query.msg == "regSuccess"){
            msg = "You Have Successfully Registered";
            // console.log(msg);
        }
        // results is an array of all rows in animals
        // grab a random one
        const rand = Math.floor(Math.random() * results.length);
        res.render("index", {
            animal: results[rand],
            msg
        });
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
        // console.log(results);
    });
});
// make route /standings
// that will show current votes for each side

app.get("/register", (req,res,next)=>{
    let msg;
    if(req.query.msg == "register"){
        msg = "this email is already registered";
    }
    res.render("register", {msg});
})

app.post("/registerProcess", (req,res,next)=>{
    // res.json(req.body);
    const hashedPass = bcrypt.hashSync(req.body.password);  
    // const match = bcrypt.compareSync('x','$2a$10$/AIQo3.ojIKlv8hF2Zzo/uKuktqWO9skd8kun2YECFHl2WhnsZuW2');   
    // const match2 = bcrypt.compareSync('x','$2a$10$us61i0sFyjFXDz2kwdnpyuxnfHvsB2t6l9GvJzHMKdhuYm0a3WQWG');
    // res.json({match,match2});
    // res.json(hashedPass);
    // before we insert a new user into the users table
    // we need to make sure this email isnt already in the db
    const checkUserQuery = `SELECT * FROM users WHERE email = ?;`;
    connection.query(checkUserQuery,[req.body.email],(error,results)=>{
        if(error){throw error;}
        if(results.length != 0){
            // our query returned a row, this means this email is already registered
            res.redirect("/register?msg=register");
        } else {
            // this is a new user! Insert them
            const insertUserQuery = `INSERT INTO users (name,email, hash)
            VALUES
            (?,?,?);`;
            connection.query(insertUserQuery,[req.body.name, req.body.email, hashedPass],(error2,results2)=>{
                if(error2){throw error2}
                res.redirect("/?msg=regSuccess");
            })
        }
    });
});

app.get("/login", (req,res,next)=>{
    res.render("login", {});
});

app.post("/loginProcess", (req,res,next)=>{
    // res.json(req.body);
    const email = req.body.email;
    // this is the english version of the password
    // we need to get the hashed version from the db
    const password = req.body.password;
    const checkPasswordQuery = `SELECT * FROM users
    WHERE email = ?`
    connection.query(checkPasswordQuery,[email], (error,results)=>{
        if(error){throw error}
        // possibilities
        // 1. no match - the user inst in the db
        if(results.length == 0){
            // we don't care waht password they gave us, send them back to login
            res.redirect("/login?msg=NoUser")
        }
        else{
            // user exists...
            // 2. we found the user but password doesnt match
            const passwordsMatch = bcrypt.compareSync(password,results[0].hash);
            if(!passwordsMatch){
                res.redirect("/login?msg=badPass");
            } else {
                // 3. we found the user and the password matches
                res.redirect("/?msg=loginSuccess");
            }
        }
    })
})

app.listen(8282);