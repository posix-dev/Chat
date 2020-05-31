import io from 'socket.io-client'
// import io from 'socket.io'

export class ClientServer {
    constructor() {
        let socket = io('http://localhost:3001');
        socket.on('connect', function(){
            console.log('connect');
        });
        socket.on('event', function(data){
            console.log(`event ${data}`);
        });
        socket.on('disconnect', function(){
            console.log('disconnect');
        });
    }
}