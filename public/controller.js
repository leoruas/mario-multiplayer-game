var socket = io();

var gameArea = {
    canvas: document.getElementById("canvas"),
    setup: function () {
        this.canvas.width = 512;
        this.canvas.height = 512;
        this.ctx = this.canvas.getContext("2d");
    },
    start: function () {
        this.interval = setInterval(updateGameArea, 20);

        this.keys = [];
        window.addEventListener('keydown', function (e) {
            // this.keys.push(e.key)
            gameArea.keys[e.key] = true;
        })

        window.addEventListener('keyup', function (e) {
            gameArea.keys[e.key] = false;
        })

        // this.frameNo = 0;
    },
    clear: function () {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

var player;
var otherPlayers = {};
var foods = [];
var scoreList = document.getElementById("scoreList");

socket.on('connect', function () {
    gameArea.setup();
    //maybe make it responsive to sprite?
    let spriteW = 30;
    let spriteH = 39;

    let x = Math.floor(Math.random() * gameArea.canvas.width);
    if (x >= spriteW) x -= spriteW;
    let y = Math.floor(Math.random() * gameArea.canvas.height);
    if (y >= spriteH) y -= spriteH;

    socket.emit('new-player', {
        x: x,
        y: y,
        speed: 6
    });

    spriteH = 16;
    spriteW = 16;
    x = Math.floor(Math.random() * gameArea.canvas.width);
    if (x >= spriteW) x -= spriteW;
    y = Math.floor(Math.random() * gameArea.canvas.height);
    if (y >= spriteH) y -= spriteH;

    socket.emit('new-food', {
        x: x,
        y: y
    })
})

socket.on('addPoint', function (id) {
    player.score++;
    scoreList.childNodes[id].innerText = `Player ${id + 1}: ${player.score} pontos`
});

socket.on('create-player', function (pl) {
    player = new Player(pl.x, pl.y, pl.speed, "assets/" + pl.sprite);

    gameArea.start();
})

socket.on('update-foods', function (payload) {
    foods = [];

    payload.forEach((food) => {
        foods.push(new Food(food.x, food.y));
    })
})

socket.on('update-players', function (players) {
    var playersFound = {};
    for (var id in players) {
        if (!Object.keys(otherPlayers).includes(id) && socket.id !== id) {
            var data = players[id];
            console.log("add new player", data);
            var newPlayer = new Player(data.x, data.y, data.speed, "assets/" + data.sprite);
            otherPlayers[id] = newPlayer;
        }
        playersFound[id] = true;
    };

    for (var id in otherPlayers) {
        if (!Object.keys(playersFound).includes(id)) {
            console.log("player disconnected ", id);
            delete otherPlayers[id];
        }
    }
});

socket.on('update-players-status', function (players) {
    for (var id in players) {
        if (socket.id !== id) {
            Object.keys(players[id]).forEach(key => {
                otherPlayers[id][key] = players[id][key]
            })
        }
    }
})

function Player(x, y, speed, src) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.speedX = 0;
    this.speedY = 0;
    this.src = src;
    this.image = new Image();
    this.image.src = this.src;
    this.width = this.image.width;
    this.height = this.image.height;
    this.isFlipped = false;
    this.score = 0;

    this.newPos = function () {
        this.x += this.speedX;
        this.y += this.speedY;
    }

    this.update = function () {
        this.width = this.image.width;
        this.height = this.image.height;
        ctx = gameArea.ctx;
        if (this.isFlipped) {
            ctx.save();
            ctx.scale(-1, 1);
        }

        ctx.drawImage(this.image, this.isFlipped ? -this.x : this.x, this.y);

        if (this.isFlipped) ctx.restore();
    }

    this.addPoint = function (id) {
        socket.emit('addPoint', id)
    }
}

function Food(x, y) {
    this.x = x;
    this.y = y;
    this.image = new Image();
    this.image.src = "assets/food.png"
    this.width = this.image.width;
    this.height = this.image.height;

    this.respawn = function (index) {
        this.x = Math.floor(Math.random() * (gameArea.canvas.width - this.width));
        this.y = Math.floor(Math.random() * (gameArea.canvas.height - this.height));
        
        socket.emit('update-foods', {
            index: index,
            x: this.x,
            y: this.y
        });
        // socket.emit('respawn-food', {
        //     index: index,
        //     x: x,
        //     y: y
        // })

        ctx = gameArea.ctx;

        ctx.drawImage(this.image, this.x, this.y);
    }

    this.wasEaten = function () {
        var myLeft = this.x;
        var myRight = this.x + this.width;

        var myTop = this.y;
        var myBottom = this.y + this.height;

        var pLeft = player.x;
        var pRight = player.x + player.width;

        var pTop = player.y;
        var pBottom = player.y + player.height;

        if (myBottom >= pTop &&
            myTop <= pBottom &&
            myRight >= pLeft &&
            myLeft <= pRight
        ) {
            // pl.addPoint(0);
            return true;
        }

        return false;
    }

    this.update = function () {
        this.width = this.image.width;
        this.height = this.image.height;

        ctx = gameArea.ctx;
        ctx.drawImage(this.image, this.x, this.y);
    }
}

function updateGameArea() {
    gameArea.clear();

    foods.forEach((food, i) => {
        if (food.wasEaten()) {
            // console.log("eaten");
            food.respawn(i);
        }
    })

    checkKeys();
    player.newPos();
    player.update();
    foods.forEach(food => {
        food.update();
    })

    for (var id in otherPlayers)
        otherPlayers[id].update();
}

function checkKeys() {
    player.speedX = 0;
    player.speedY = 0;
    var hasMoved = false;

    if (gameArea.keys["ArrowUp"]) {
        hasMoved = true;
        player.speedY = -player.speed;
    }
    if (gameArea.keys["ArrowDown"]) {
        hasMoved = true;
        player.speedY = player.speed;
    }
    if (gameArea.keys["ArrowRight"]) {
        hasMoved = true;
        player.speedX = player.speed;
        player.isFlipped = false;
    }
    if (gameArea.keys["ArrowLeft"]) {
        hasMoved = true;
        player.speedX = -player.speed;
        player.isFlipped = true;
    }

    if (hasMoved)
        socket.emit('update-players-status', {
            id: socket.id,
            x: player.x,
            y: player.y,
            isFlipped: player.isFlipped
        })
}

// function log() {
//     console.log(gameArea);
// }