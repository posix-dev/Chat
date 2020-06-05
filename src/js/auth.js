import {Middleware, Reducer, Store} from "./flux/stores/store";
import {Screens} from "./utils/screens";
import {View} from "./flux/view";
import {authSubmitAction, initChatAction} from "./flux/actions";
import {AuthIdHandler} from "./network/authIdHandler";

export class Auth extends View {

    constructor(router, server, authIdHandler) {
        super();
        this.reducer = new Reducer();
        this.middleware = new Middleware(server);
        this.clientServer = server;
        this.store = new Store(this.reducer, this.middleware, this);
        this.router = router;
        this.authIdHandler = authIdHandler;
        this.screens = new Screens();

        this.clientServer.socket.on('auth', authId => {
            console.log(`auth event ${authId}`);
            this.authIdHandler.setId(authId);
            this.router.saveScreenAndNavigateTo(this.screens.chatScreen);
        });

        this.clientServer.socket.on('addUser', user => {
            console.log(`addUser event ${user}`);
            this.store.dispatch(initChatAction)
        });

        const authInputSubmit = document.querySelector('.auth-dialog__form-input_submit');

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
        this.store.dispatch(action)
    }

    render(state) {
        super.render(state);
        console.log('auth')
    }


}