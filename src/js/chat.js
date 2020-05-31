import {Middleware, Reducer, Store} from "./flux/stores/store";

export class Chat {

    constructor(server, router, view) {
        this.reducer = new Reducer();
        this.middleware = new Middleware(server);
        this.store = new Store(this.reducer, this.middleware);
        this.view = view;
        this.router = router;
    }

}