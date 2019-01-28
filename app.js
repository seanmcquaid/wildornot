// dum dum dum..... no generator
// first, well this is an express app. Maybe we should get......EXPRESS!??!?

const express = require("express");
// Make an express app
let app = express();
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
        // console.log(results)
    })
})



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

app.get("/standings/:value", (req,res,next)=>{
    const value = req.params.value;
    res.json(value);
    res.render("standings", {});
})
// make route /standings
// that will show current votes for each side



app.listen(8282);
