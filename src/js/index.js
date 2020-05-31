import {Router} from "./router/router";
import {Auth} from "./auth";
import {Chat} from "./chat";
import {View} from "./flux/view";
import {ClientServer} from "./network/clientserver";

init();

function init() {
    const server = new ClientServer();
    const router = new Router();
    const view = new View();
    // const store = new Store();
    const auth = new Auth(server, router, view);
    const chat = new Chat(server, router, view);

    window.addEventListener('popstate', e => {
        if (e.state && e.state.page) {
            router.navigateTo(e.state.page);
        }
    });

    window.onbeforeunload = () => router.back();

}


