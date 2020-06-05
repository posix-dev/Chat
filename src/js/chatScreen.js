import {Middleware} from "./flux/middlewares/middleware";
import {ChatUserScreen} from "./chatUserScreen";
import {ChatMessagesScreen} from "./utils/chatMessagesScreen";

export class ChatScreen {

    constructor(router, server, authIdHandler) {
        this.middleware = new Middleware(server);
        this.clientServer = server;
        this.chatUserScreen = new ChatUserScreen(server, this.middleware);
        this.chatMessagesScreen = new ChatMessagesScreen(authIdHandler, this.middleware, this.chatUserScreen, server);
        this.initServerListeners();
    }

    initServerListeners() {
        this.clientServer.socket.on('sendImg', user => {
            this.chatUserScreen.handleImg(user);
            this.chatMessagesScreen.renderMessages(user);
        });
    }
}