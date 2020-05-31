import {Middleware, Reducer, Store} from "./flux/stores/store";
import {Screens} from "./utils/screens";

export class Auth {

    constructor(server, router, view) {
        this.reducer = new Reducer();
        this.middleware = new Middleware(server);
        this.store = new Store(this.reducer, this.middleware);
        this.view = view;
        this.router = router;
        this.screens = new Screens();

        const authInputSubmit = document.querySelector('.auth-dialog__form-input_submit');

        authInputSubmit.addEventListener('click', e => {
            e.preventDefault();
            const data = this.convertAndGetFormData();
            console.dir(data)
            this.login(data)
            this.router.saveScreenAndNavigateTo(this.screens.chatScreen);
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

    }
}