import {Server} from "./network/server";
import {Router} from "./router/router";
import {Auth} from "./auth";
import {Chat} from "./chat";
import {View} from "./flux/view";

init();

function init() {
    const server = new Server();
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


