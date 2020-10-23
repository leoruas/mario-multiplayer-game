var socket = io();

var gameArea = {
    canvas: document.getElementById("canvas"),
    start: function () {
        this.canvas.width = 512;
        this.canvas.height = 512;
        this.ctx = this.canvas.getContext("2d");

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
var food;

function startGame() {
    this.gameArea.start();
    player = new Player(0, 0, 7, "assets/player1.png");
    food = new Food(100, 100);
};

function Player(x, y, speed, src) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.speedX = 0;
    this.speedY = 0;
    this.src = src;
    this.image = new Image();
    this.image.src = this.src;

    this.newPos = function () {
        this.x += this.speedX;
        this.y += this.speedY;
    }
    
    this.update = function () {
        ctx = gameArea.ctx;
        
        ctx.drawImage(this.image, this.x, this.y);
    }    
}

function Food(x, y) {
    this.x = x;
    this.y = y;
    this.image = new Image();
    this.image.src = "assets/food.png"

    this.update = function() {
        ctx = gameArea.ctx;

        ctx.drawImage(this.image, this.x, this.y);
    }
}

function updateGameArea() {
    gameArea.clear();

    checkKeys();
    player.newPos();
    player.update();
    food.update();
}

function checkKeys (){
    player.speedX = 0;
    player.speedY = 0;

    if(gameArea.keys["ArrowUp"]) player.speedY = -player.speed;
    if(gameArea.keys["ArrowDown"]) player.speedY = player.speed;
    if(gameArea.keys["ArrowRight"]) player.speedX = player.speed;
    if(gameArea.keys["ArrowLeft"]) player.speedX = -player.speed
}

function log() {
    console.log(gameArea);
}