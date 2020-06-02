import io from 'socket.io-client'

export class ClientServer {
    constructor() {
        const PORT = 3103;
        this.clientServer = `http://localhost:${PORT}`;
        this.socket = io(this.clientServer);
    }

    getSocket() {
        return this.socket;
    }
}