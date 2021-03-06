const express = require("express");
const app = express();
const mongoose = require('mongoose')
const server = require("http").Server(app);
const Message = require('./models/Message')
app.set("view engine", "ejs");
const io = require("socket.io")(server, {
  cors: {
    origin: '*'
  }
});
app.use(express.static('public'));
mongoose.connect('mongodb+srv://fogdealer:kupol275@cluster0.eetey.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', (err) => {
  console.log("Database connection ", err)
})


const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.use("/peerjs", peerServer);
app.use(express.static("public"));

app.get('/', function(req,res){
	res.render('index');
}); 

app.get('/room', function (req, res){
  let roomn = req.query.room
  let usern = req.query.user

  Message.find({room: roomn}, (error, messages) => {
    res.render('room',{room:roomn, user:usern, msgs: messages})
  })
})

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId, userName) => {
    socket.join(roomId);

    socket.to(roomId).broadcast.emit("user-connected", userId);
    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message, userName);
      Message.create({ room: roomId, user: userName, text: message});
    });
  });
});

port = process.env.PORT || 3030
server.listen(port);
console.log("server starting on " + port)