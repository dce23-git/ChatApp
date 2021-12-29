const express = require("express");
const { read } = require("fs");
const path = require("path");
const ejsMate = require("ejs-mate");
const app = express();
const server = require("http").createServer(app);
const io = require('socket.io')(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.engine("ejs", ejsMate);
app.set("views", path.join(__dirname, "views"));


app.get("/", (req, res) => {
    res.render("home");
});


const data = [
    {
        user: "dhiren",
        password: "password"
    },
    {
        user: "ram",
        password: "password"
    },
    {
        user: "paul",
        password: "password"
    },
]


let auth  = [];


app.get("/login/:id", (req, res) => {
    const {id} = req.params;
    res.render("login", {id : id});
})


app.post("/login", (req, res) => {

    const { user, password, id } = req.body;
    console.log(req.body);

    if (!user || !password) {
        res.json({ status: "username or password not provided" });
    }
    else {
        if (data.some(cred => (cred.user == user && cred.password === password)) ) {
            // res.json({ status: "login succesfull" });
            auth[id] = true;
            res.redirect(`chat/${id}`);
        }
        else {
            res.json({ status: "invalid credentials" });
        }
    }
});


app.get("/chat/:id", (req, res) => {
    const {id} = req.params;
    if(!auth[id]){
        res.redirect(`/login/${id}`);
    }
    else res.render("chat");
})


// socket logic

io.on("connect", (socket) => {

    const socketId = socket.id;

    socket.emit("joined", socketId);

    socket.on("sendMessage", (data) => {
        console.log("message received");
        io.emit("receiveMessage", data, socketId);
    })

    socket.on("disconnect", (socket) => {
        console.log(`Socket with Id: ${socketId} disconnected`);
    })

})




server.listen(3000, () => {

    console.log("listening");
})


