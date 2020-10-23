var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/public')) //public static files -> necessary to call script with src

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
})

io.on('connect', (socket) => {
    console.log("New player connected");

    socket.on('disconnect', () => {
        console.log("Player disconnected");
    })
})

const port = 4000;
http.listen(port, () => {
    console.log(`Listening on port ${port}`);
})

