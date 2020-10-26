/** Multiplayer game example -> https://code.tutsplus.com/tutorials/create-a-multiplayer-pirate-shooter-game-in-your-browser--cms-23311
 *  Github repo -> https://github.com/tutsplus/tutsplus-glitch-multiplayer
 * Types of socket io calls -> https://gist.github.com/OmarShehata/a67499b29c65c8b84f74760652890bd8
 */
var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/public')) //public static files -> necessary to call script with src

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
})

var players = {}
io.on('connect', (socket) => {
    let sprite = () => {
        let length = Object.keys(players).length

        if (length == 1)
            return "player1.png";
        else if (length == 2)
            return "player2.png";
        else if (length == 3)
            return "player3.png";
        else
            return "player1.png";

    };

    console.log("sprite", sprite());
    console.log("New client has connected with id:", socket.id);

    socket.on('new-player', function (payload) {
        players[socket.id] = payload;
        players[socket.id].sprite = sprite();

        socket.emit('create-player', payload);
        io.emit('update-players', players); //emit to ALL connected sockets
        // socket.broadcast.emit('create-player', payload)
        //Calling socket.broadcast.emit sends it to every client connected to the server, except that one socket it was called on.
    })

    socket.on('disconnect', () => {
        console.log("Player disconnected");
        delete players[socket.id];
        io.emit('update-players', players);
    })

    socket.on('update-players-position', (payload) => {
        Object.keys(payload).forEach((key) => {
            if (key !== 'id')
                players[payload.id][key] = payload[key];
        })

        io.emit('update-players-position', players);
    })

    // socket.on('addPoint', (id) => {
    //     socket.emit("addPoint", id);
    // })
})

const port = 8080;
http.listen(port, () => {
    console.log(`Listening on port ${port}`);
})

