import {Router} from "./router/router";
import {Auth} from "./auth";
import {Chat} from "./chat";
import {ClientServer} from "./network/clientserver";
import {AuthIdHandler} from "./network/authIdHandler";

init();

function init() {
    const router = new Router();
    const clientServer = new ClientServer();
    const authIdHandler = new AuthIdHandler();
    const auth = new Auth(router, clientServer, authIdHandler);
    const chat = new Chat(router, clientServer, authIdHandler);
    // let pug = require('pug');
    // pug.renderFile('./src/pug/incudes/modules/message.pug',{}, () => {
    //     console.log('okay');
    // })

    clientServer.getSocket().on('connect', function (m) {
        console.log(`connect ${m}`);
    });
    clientServer.getSocket().on('connection', function (m) {
        console.log(`connection ${m}`);
    });
    clientServer.getSocket().on('disconnect', function () {
        console.log('disconnect');
    });

    window.addEventListener('popstate', e => {
        if (e.state && e.state.page) {
            router.navigateTo(e.state.page);
        }
    });

    window.onbeforeunload = () => router.back();

}


