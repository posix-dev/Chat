class Server {
    constructor() {
        this.PORT = 3015;
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

            io.sockets.emit('usersCount', Object.keys(io.sockets.sockets).length);

            socket.on('disconnect', () => {
                clients = clients.filter(item => item.id !== socket.id);
                socket.broadcast.emit('usersCount', Object.keys(io.sockets.sockets).length);
                socket.broadcast.emit('userList', clients);
            });

            socket.on('auth', () => {
                io.sockets.sockets[socket.id].emit('auth', socket.id);
            });

            socket.on('message', messageData => {
                console.dir(`just message`);
                const objIndex = clients.findIndex((user => user.id === socket.id));
                clients[objIndex].messages.push(messageData.message);
                io.sockets.emit('message', {...messageData, fio: socket.username, avatar: clients[objIndex].avatar});
            });

            socket.on('sendImg', async img => {
                const objIndex = clients.findIndex((user => user.id === socket.id));
                clients[objIndex].avatar = img;
                clients.forEach(item => {
                    const exist = item.avatar.length > 0;
                })
                io.sockets.emit('sendImg', clients[objIndex]);
            });

            socket.on('addUser', user => {
                if (user['fio']) {
                    socket.username = user['fio'];
                }
                const userData = {
                    ...user,
                    fio: user['fio'] ? user['fio'] : socket.username,
                    id: socket.id,
                    avatar: '',
                    messages: []
                };
                clients.push(userData);
                io.sockets.emit('addUser', userData);
            })

            socket.on('userList', data => {
                io.sockets.emit('userList', clients);
            });

            socket.on('typing', () => {
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