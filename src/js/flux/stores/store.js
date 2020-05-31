export class Store {
    constructor(reducer, middleware) {
        this.reducer = reducer
        this.middleware = middleware
        this.currentState = ''
        this.effect = ''
    }

    dispatch(action) {
        // if ('internalAction' in action) {
        //     action.internalAction()
        // }
        this.effect = this.middleware.invoke(action, this.currentState)
        this.currentState = this.reducer(action, this.currentState, this.effect)
        this.render(this.currentState)
    }
}

export class Reducer {

    constructor(action) {
    }

    reduce(action, state) {

    }
}

export class Middleware {

    constructor(server) {
        this.clientServer = server;
        this.init()
    }

    init() {

    }


    invoke(action, state) {

    }

}