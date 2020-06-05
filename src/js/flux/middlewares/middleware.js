import {
    initChatAction,
    authCloseAction,
    authSubmitAction,
    chatCloseAction,
    chatSendMessageAction, chatMessageWriting, chatMessageStopWriting, sendImage
} from "../actions";

export class Middleware {

    constructor(server) {
        this.clientServer = server;
    }

    invoke(action) {
        switch (action.type) {
            case initChatAction.type:
                this
                    .clientServer
                    .socket
                    .emit('userList');
                return;
            case chatSendMessageAction.type:
                if (action.data) {
                    this
                        .clientServer
                        .socket
                        .emit('message', action.data);
                }
                return;
            case authSubmitAction.type:
                if (action.data) {
                    this
                        .clientServer
                        .socket
                        .emit('addUser', action.data);

                    this
                        .clientServer
                        .socket
                        .emit('auth');
                }
                return;
            case chatMessageWriting.type:
                this
                    .clientServer
                    .socket
                    .emit('typing');
                return;
            case chatMessageStopWriting.type:
                this
                    .clientServer
                    .socket
                    .emit('untyping');
                return;
            case sendImage.type:
                if (action.data) {
                    this
                        .clientServer
                        .socket
                        .emit('sendImg', action.data);
                }
                return;
            default:
                return;
        }
    }

}