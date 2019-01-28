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
        res.render("index", {animals: results});
        console.log(results)
    })
})

console.log("app is listening")
app.listen(8282);
