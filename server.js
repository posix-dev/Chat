// import express from 'express'
// import http from 'http'
// import path from 'path'

class Server {
    constructor() {
        this.PORT = 3001
        const express = require('express');
        const app = express();
        let server = require('http').createServer(app);
        let io = require('socket.io').listen(server);
        let path = require('path');
        app.use(express.static(path.join(__dirname, 'public')));
        app.set('view engine', 'ejs');

        app.get('/', (req, res) => {
            res.send('<h1>Hello world2</h1>');
        });

        server.listen(this.PORT, () => {
            console.log('listening on *:3001');
        });
    }
}

const server = new Server();