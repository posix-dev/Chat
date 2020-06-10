import {Router} from "./router/router";
import {AuthScreen} from "./authScreen";
import {ChatScreen} from "./chatScreen";
import {ClientServer} from "./network/clientserver";
import {AuthIdHandler} from "./network/authIdHandler";

init();

function init() {
    const router = new Router();
    const clientServer = new ClientServer();
    const authIdHandler = new AuthIdHandler();
    const auth = new AuthScreen(router, clientServer, authIdHandler);
    const chat = new ChatScreen(router, clientServer, authIdHandler);

    window.addEventListener('popstate', e => {
        if (e.state && e.state.page) {
            router.navigateTo(e.state.page);
        }
    });

    window.onbeforeunload = () => router.back();

}


