import {Middleware} from "./flux/middlewares/middleware";
import {chatScreen} from "./utils/screens";
import {authSubmitAction, initChatAction} from "./flux/actions";

export class AuthScreen {

    constructor(router, server, authIdHandler) {
        this.middleware = new Middleware(server);
        this.clientServer = server;
        this.router = router;
        this.authIdHandler = authIdHandler;

        const authInputSubmit = document.querySelector('.auth-dialog__form-input_submit');

        this.clientServer.socket.on('auth', authId => {
            this.authIdHandler.id = authId;
            this.router.saveScreenAndNavigateTo(chatScreen);
        });

        this.clientServer.socket.on('addUser', user => {
            this.middleware.invoke(initChatAction)
        });

        authInputSubmit.addEventListener('click', e => {
            e.preventDefault();
            const data = this.convertAndGetFormData();
            this.login(data)
        });
    }

    convertAndGetFormData() {
        const form = document.querySelector('.auth-dialog__form');
        return Array
            .from(form.elements)
            .reduce((obj, item) => {
                if (item.name !== '') {
                    obj[item.name] = item.value;
                }
                return obj;
            }, {});
    }

    login(data) {
        const action = {
            ...authSubmitAction,
            data: data
        }
        this.middleware.invoke(action)
    }

}