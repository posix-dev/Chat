import io from 'socket.io-client'
import {CLIENT_SERVER_PORT} from "../utils/constants";

export class ClientServer {
    constructor() {
        this.clientServer = `http://localhost:${CLIENT_SERVER_PORT}`;
        this.socket = io(this.clientServer);
    }
}