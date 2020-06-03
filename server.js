class Server {
    constructor() {
        this.PORT = 3002;
        const express = require('express');
        const app = express();
        let server = require('http').createServer(app);
        let io = require('socket.io').listen(server);
        let path = require('path');
        app.use(express.static(path.join(__dirname, 'src')));
        app.set('view engine', 'ejs');
        let clients = [];

        io.on('connection', socket => {
            socket.username = 'Anonymous';

            //send user's count
            io.sockets.emit('usersCount', Object.keys(io.sockets.sockets).length);

            socket.on('disconnect', () => {
                io.sockets.emit('usersCount', Object.keys(io.sockets.sockets).length);
                clients = clients.filter(item => item.id !== socket.id)
                socket.broadcast.emit('userList', clients);
            });

            socket.on('auth', () => {
                io.sockets.sockets[socket.id].emit('auth', socket.id);
            });

            socket.on('message', message => {
                console.dir(`message - ${message}`);
                // const user = clients.filter(c => c.id === socket.id)[0];
                io.sockets.emit('message', {...message, fio: socket.username});
            });
            socket.on('addUser', user => {
                console.dir(`addUser - ${user['fio']} ${user['nickname']}`);
                if (user['fio']) {
                    socket.username = user['fio'];
                }
                const userData = {
                    ...user,
                    fio: user['fio'] ? user['fio'] : socket.username,
                    id: socket.id
                };
                clients.push(userData);
                io.sockets.emit('addUser', userData);
            })

            socket.on('userList', data => {
                console.dir(`userList ${clients}`);
                io.sockets.emit('userList', clients);
            });

            socket.on('typing', () => {
                console.dir(`typing ${socket.username}`);
                socket.broadcast.emit('typing', {username: socket.username});
            });

            socket.on('untyping', () => {
                socket.broadcast.emit('untyping');
            });
        })


        app.get('/', (req, res) => {
            res.send('<h1>Hello world2</h1>');
        });

        server.listen(this.PORT, () => {
            console.log('server started');
        });
    }
}

const server = new Server();