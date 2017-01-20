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

///Declarations
var parse = require('csv-parse');
var fs = require('fs');
fs.readFile('./public/assets/map3.csv', (err, data) => {
    if (err) throw err;
    parse(data, function (err, output) {
        tileMap = output.slice();//console.log(tileMap);
    });
});

var player = {
    id: 0,
    x: 0,
    y: 0,
    velocityX: 0,
    velocityY: 0,
    rightArrowPressing: false,
    leftArrowPressing: false,
    upArrowPressing: false,
    downArrowPressing: false/*
     moveX: () => {
     "use strict";
     this.x += this.velocity;
     },
     moveY: () => {
     "use strict";
     this.y += this.velocity
     }*/
}


var clienMessage = {
    id: 0,
    clientId: 0
}
var tileMap = [];
var requestQueue = [];
var socketsList = [];
var playersList = [];

///Connection events
io.on('connection', function (socket) {
    requestQueue.push({type: 'connect', socket: socket});

    socket.on('disconnect', () => {
        "use strict";
        requestQueue.push({type: 'disconnect', socket: socket});
    })

    socket.on('keys', (data) => {//data.key, data.state, data.clientID
        "use strict";
        if (data.key === 'right'
            || data.key === 'left'
            || data.key === 'up'
            || data.key === 'down'
            || data.key === 'x'
            || data.key === 'z')
            requestQueue.push({
                type: 'keys',
                clientID: data.clientID,
                key: data.key,
                state: data.state,
                x: data.x,
                y: data.y,
                velocityX: data.velocityX,
                velocityY: data.velocityY
            })
    });
    /*
     socket.on('keyState', function (key) {//кнопка ужерживвается
     console.log(key.name + ' ' + key.state);
     switch (key.name) {
     case 'right':
     playersList[socket.id].rightArrowPressing = key.state;
     break;
     case 'left':
     playersList[socket.id].leftArrowPressing = key.state;
     break;
     case 'up':
     playersList[socket.id].upArrowPressing = key.state;
     break;
     case 'down':
     playersList[socket.id].downArrowPressing = key.state;
     break;
     case 'x':
     playersList[socket.id
     }
     playersList[socket.id].x = key.x;
     playersList[socket.id].y = key.y;\
     });*/
});

//Server loop
setInterval(() => {
        "use strict";

        for (let i in requestQueue) {
            let message = requestQueue.shift();
            switch (message.type) {
                case'connect':
                    connect(message);//добавили игрока
                    break;
                case 'disconnect':
                    disconnect(message);
                    break;
                case 'keys':
                    keys(message);//            requestQueue.push({type: 'keys', socket: socket, key: data.key, state: data.state})
                    break;
            }
        }

        let packet = [];
        for (let i in playersList) {
            packet.push({
                id: playersList[i].id,
                x: playersList[i].x,
                y: playersList[i].y,
                velocityX: playersList[i].velocityX,
                velocityY: playersList[i].velocityY,
            });
        }
        /*
         let isMapChanged = false;

         if (isMapChanged) {
         packet.push(tileMap);
         }*/
        io.sockets.emit('players', packet);
    console.log(packet);

    },
    1000 / 10 //milliseconds
);

var connect = (message) => {
    'use strict';    //requestQueue.push({type: 'connect', socket: socket});
    message.socket.id = Math.random();
    socketsList[message.socket.id] = message.socket;//заносим соединение в массив
    playersList[message.socket.id] = {
        id: message.socket.id,
        x: 288 /*96Math.floor(Math.random() * 6400 / 64) * 64 - 32*/,
        y: 5664/*6176/*5766Math.floor(Math.random() * 6400 / 64) * 64 - 32*/,
        velocityX: 0,
        velocityY: 0,
        rightArrowPressing: 'false',
        leftArrowPressing: 'false',
        upArrowPressing: 'false',
        downArrowPressing: 'false'
        /*,
         moveX: () => {
         this.x += this.velocity;
         },
         moveY: () => {
         this.y += this.velocity;
         }
         */
    };
    message.socket.emit('connected', {id: message.socket.id});
    console.log('Подключен игрок с id ' + message.socket.id);
};
var disconnect = (message) => {
    'use strict';    //requestQueue.push({type: 'disconnect', socket: socket});
    //delete socketsList[message.socket.id];
    delete playersList[message.socket.id];

    /*
     let sock=new Promise(()=>{
     socketsList.slice(message.socket.id,1);
     });
     let pla=new Promise(()=>{
     playersList.slice(message.socket.id,1);
     });
     Promise.all([sock,pla]).then(()=>{
     message.socket.disconnect();
     console.log('Отсоединился игрок с id ' + message.socket.id);
     });
     */ //console.log('Отсоединился игрок с id ' + message.socket.id);



};
var keys = (message) => {
    'use strict';
    //            requestQueue.push({type: 'keys', clientID: data.clientID, key: data.key, state: data.state,   data.velocityX, data.velocityY})
    if (playersList[message.clientID]) {
        playersList[message.clientID].x = message.x;
        playersList[message.clientID].y = message.y;
        playersList[message.clientID].velocityX = message.velocityX;
        playersList[message.clientID].velocityY = message.velocityY;
        switch (message.key) {
            case 'right':
                playersList[message.clientID].rightArrowPressing = message.state;
                break;
            case 'left':
                playersList[message.clientID].leftArrowPressing = message.state;
                break;
            case 'up':
                playersList[message.clientID].upArrowPressing = message.state;
                break;
            case 'x':
                /*
                 playersList[message.clientID].downArrowPressing = message.state;
                 break;case 'down':
                 playersList[message.clientID].downArrowPressing = message.state;
                 */
                break;
            case 'z':
                //playersList[message.clientID].downArrowPressing = message.state;
                break;
        }
    }
};

/*
 1.Spawn
 Клиент отправляет запрос на подключение
 ->сервер добавляет в очередь сообщений




 ->генерирует позицию и добавляет игрока в массив игроков
 ->отправляет ID
 //массив адресов всех игроков(с их состояниями нажатой клавиши), массив координат сундуков

 Клиент отправляет команду на сервер
 ->сервер добавляет в очередь сообщений
 ->проверяет (...на расстояние,velocity,collision b2players)
 ->устаналиает новые координаты игрока и velocity
 ->отправляе массив адресов всех игроков (с их нажатой клавишей и velocity)




 Команды игрока(нажата или была отпущена)
 1. Вправо 2
 2. Влево 2
 3. Вверх 2
 4. Вниз 2
 5. Копать справа- 1 состояние
 6. Копать слева - 1 состояние








 //отправлять координаты игроков только в четверти часьи мира
 1. подключается
 сервер отправляет ему id
 и добавляет его в список игроков

 2.




 цикл сервера
 отправка  параметров всем игроков всем








 */
