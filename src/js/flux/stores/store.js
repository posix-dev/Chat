import {ClientServer} from "../../network/clientserver";
import {
    initChatAction,
    authCloseAction,
    authSubmitAction,
    chatCloseAction,
    chatSendMessageAction, chatMessageWriting, chatMessageStopWriting
} from "../actions";

// export class CommonStore {
//     constructor() {
//         this.stores = [{
//             type: 'auth',
//             store: store
//         }, {
//
//         }];
//         // this.clientServer = new ClientServer();
//         this.init();
//     }
//
//
//     dispatch() {
//
//     }
//
//     addStore(store) {
//         this.stores.push(store);
//     }
// }

export class Store {
    constructor(reducer, middleware, view) {
        this.reducer = reducer;
        this.middleware = middleware;
        this.currentState = {};
        this.effect = '';
        this.view = view;
    }

    dispatch(action) {
        // if ('internalAction' in action) {
        //     action.internalAction()
        // }
        /*this.effect = */
        this.middleware.invoke(action/*, this.currentState*/);
        // this.currentState = this.reducer.reduce(action, this.currentState);
        // this.view.render(this.currentState);
    }
}

export class Reducer {

    constructor() {
    }

    reduce(action, state) {
        switch (action.type) {
            case initChatAction.type:
                return {...state, messages: action.data};
            // this.actions.authCloseAction.type:
            // this.actions.authSubmitAction.type:
            // this.actions.chatCloseAction.type:
            // this.actions.chatSendMessageAction.type:
            // case ROW_DELETE_ACTION:
            // case ROW_ADD_ACTION:
            //     return { ...state, cookies: getParsedCookies() };
            // case ROW_FILTER_ACTION:
            //     return { ...state, cookies: action.payload };
            default:
                return state;
        }
    }
}

export class Middleware {

    constructor(server) {
        this.clientServer = server;
    }

    invoke(action/*, state*/) {
        switch (action.type) {
            case initChatAction.type:
                this
                    .clientServer
                    .getSocket()
                    .emit('userList');
                return;
            case chatSendMessageAction.type:
                if (action.data) {
                    this
                        .clientServer
                        .getSocket()
                        .emit('message', action.data);
                }
                return;
            case authSubmitAction.type:
                if (action.data) {
                    this
                        .clientServer
                        .getSocket()
                        .emit('addUser', action.data);

                    this
                        .clientServer
                        .getSocket()
                        .emit('auth');
                }
                return;
            case chatMessageWriting.type:
                this
                    .clientServer
                    .getSocket()
                    .emit('typing');
                return;
            case chatMessageStopWriting.type:
                this
                    .clientServer
                    .getSocket()
                    .emit('untyping');
                return;
            default:
                return;
        }
    }

}