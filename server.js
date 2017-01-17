/**
 * Created by MR on 10.01.2017.
 */

var express = require('express');
var app = require('express')();
//sockets
var server = require('http').Server(app);
var io = require('socket.io')(server);

//server.listen(80);
app.use(express.static('public'));
server.listen(80, '0.0.0.0', function () {
    console.log('Example app listening on port 80!');
});
//app.use('/favicon.ico', express.static('images/favicon.ico'));
app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});

//var layer = {id: 0, x: 0, y: 0};
var player = {
    id: 0,
    x: 0,
    y: 0,
    velocity: 0,
    rightArrowPressing: false,
    leftArrowPressing: false,
    upArrowPressing: false,
    downArrowPressing: false,
    moveX: () => {
        "use strict";
        this.x += this.velocity;
    },
    moveY: () => {
        "use strict";
        this.y += this.velocity
    }
}

var VELOCITY_X=32;
var VELOCITY_Y=32;

var SOCKETS = {};
var PLAYERS = {};

var count = 0;

io.on('connection', function (socket) {
    /*
     socket.emit('news', { hello: 'world' });
     socket.on('my other event', function (data) {
     console.log(data);
     });

     socket.on('rm', function (data) {
     console.log(count++);
     console.log(data);

     socket.emit('move',{v:640})
     });
     */
    socket.id = Math.random();
    SOCKETS[socket.id] = socket;//заносим соединение в массив
    PLAYERS[socket.id] = {
        id: socket.id,
        x:288 /*96Math.floor(Math.random() * 6400 / 64) * 64 - 32*/,
        y: 5664/*6176/*5766Math.floor(Math.random() * 6400 / 64) * 64 - 32*/,
        velocity:0,
        rightArrowPressing: 'false',
        leftArrowPressing: 'false',
        upArrowPressing: 'false',
        downArrowPressing: 'false',
        moveX: () => {
            this.x += this.velocity;
        },
        moveY: () => {
            this.y += this.velocity;
        }
    };
    socket.emit('spawn', {id: socket.id, x: PLAYERS[socket.id].x, y: PLAYERS[socket.id].y});
    console.log('Подключен игрок с id ' + socket.id);

    socket.on('disconnect', () => {
        "use strict";
        delete SOCKETS[socket.id];
        delete PLAYERS[socket.id];
        console.log('Отсоединился игрок с id ' + socket.id);
    })

    socket.on('keyEvent', function (key) {//кнопка ужерживвается
        console.log(key.name + ' ' + key.state);
        switch (key.name) {
            case 'right':
                PLAYERS[socket.id].rightArrowPressing = key.state;
                break;
            case 'left':
                PLAYERS[socket.id].leftArrowPressing = key.state;
                break;
            case 'up':
                PLAYERS[socket.id].upArrowPressing = key.state;
                break;
            case 'down':
                PLAYERS[socket.id].downArrowPressing = key.state;
                break;
        }
        PLAYERS[socket.id].x=key.x;
        PLAYERS[socket.id].y=key.y;


    });
    /*socket.on('Xnm', function (data) {//остановить
     socket.emit('move', {v: 0});
     });*/
});

setInterval(() => {
    var packet = [];

    for (var i in PLAYERS) {
        /*if (PLAYERS[i].rightArrowPressing==='true' || PLAYERS[i].leftArrowPressing==='true') {
            //PLAYERS[i].x+=PLAYERS[i].velocity;
            //PLAYERS[i].moveX;
        }*/
        packet.push({id: PLAYERS[i].id, x: PLAYERS[i].x, y: PLAYERS[i].y});
    }
    io.sockets.emit('newPositions', packet);

}, 1000 / 10);


