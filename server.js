// import express from 'express'
// import http from 'http'
// import path from 'path'

class Server {
    constructor() {
        this.PORT = 3000
        const app = require('express')();
        let server = require('http').createServer(app);
        let io = require('socket.io').listen(server);
        let path = require('path');
        // app.use(app.static(path.join(__dirname, 'public')));
        // app.set('view engine', 'ejs');
        //
        // app.get('/', (req, res) => {
        //     res.send('<h1>Hello world</h1>');
        // });
        //
        // http.listen(this.PORT, () => {
        //     console.log('listening on *:3000');
        // });
    }
}