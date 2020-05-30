import {Server} from "./server";
import {Auth} from "./auth";
import {QueryParams} from "./queryparams";
import {Middleware, Reducer, Router, Store} from "./store";
import {Screens} from "./screens";

init()

function init() {
    const server = new Server()
    const auth = new Auth()
    const queryParams = new QueryParams()
    const store = new Store()
    const middleware = new Middleware()
    const reducer = new Reducer()
    const router = new Router()
    const screens = new Screens()
    const authInputSubmit = document.querySelector('.auth-dialog__form-input_submit');

    authInputSubmit.addEventListener('click', e => {
        e.preventDefault()
        router.saveScreenAndNavigateTo(screens.chatScreen)
    })

    window.addEventListener('popstate', e => {
        if(e.state && e.state.page) {
            router.navigateTo(e.state.page)
        }
    })

    window.onbeforeunload = () => router.back();
}


