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

var players = {};
var scores = {};
var foods = [];
io.on('connect', (socket) => {
    let sprite = () => {
        let ids = [];
        let highestID = 0;

        for (var socketId in players) {
            if (socket.id != socketId) { //dont count the current player
                ids.push(players[socketId].id); //stores ids (sprites) that are being used
                if(highestID < players[socketId].id) highestID = players[socketId].id; //store highest id
            }
        }

        if (!ids.includes(1)) {
            players[socket.id].id = 1; //this is going to be player 1
            return "player1.png";
        } else if (!ids.includes(2)) {
            players[socket.id].id = 2; //this is going to be player 2
            return "player2.png";
        } else if (!ids.includes(3)) { 
            players[socket.id].id = 3; //this is going to be player 3
            return "player3.png";
        }

        //if not player 1, 2 or 3 default to mario skin
        players[socket.id].id = highestID + 1;
        return "player1.png";
    };

    console.log("New client has connected with id: ", socket.id);

    socket.on('new-player', function (payload) {
        players[socket.id] = payload;
        players[socket.id].sprite = sprite(); //gets sprites and sets player id
        
        scores[socket.id] = Object.assign({}, { score: 0, text: `Player ${players[socket.id].id}: 0 points`, id: players[socket.id].id});

        socket.emit('create-player', payload);
        io.emit('update-scores', scores);
        io.emit('update-players', players); //emit to ALL connected sockets
        // socket.broadcast.emit('create-player', payload)
        //Calling socket.broadcast.emit sends it to every client connected to the server, except that one socket it was called on.
    });

    socket.on('new-food', function (payload) {
        foods.push(payload);

        io.emit('update-foods', foods);
    })

    socket.on('disconnect', () => {
        console.log("Player disconnected");

        delete players[socket.id];
        delete scores[socket.id];
        foods.pop();

        io.emit('update-players', players);
        io.emit('update-foods', foods);
        io.emit('update-scores', scores);
    })

    socket.on('update-players-status', (payload) => {
        Object.keys(payload).forEach((key) => {
            if (key !== 'id')
                players[payload.id][key] = payload[key];
        })

        io.emit('update-players-status', players);
    })

    socket.on('update-foods', function (payload) {
        let index = payload.index;
        foods[index].x = payload.x;
        foods[index].y = payload.y;

        io.emit('update-foods', foods);
    })

    socket.on('add-point', (id) => {
        scores[id].score++;
        scores[id].text = `Player ${scores[id].id}: ${scores[id].score} points`

        io.emit('update-scores', scores);
    })
})

const port = 8080;
http.listen(port, () => {
    console.log(`Listening on port ${port}`);
})

