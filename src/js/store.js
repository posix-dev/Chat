export class Store {
    constructor(reducer, middleware) {
        this.reducer = reducer
        this.middleware = middleware
    }

    dispatch() {

    }
}

export class Reducer {
    constructor(action) {
    }

    reduce(action, state) {

    }
}

export class Middleware {
    constructor() {
    }
}

export class Router {

    constructor() {
        this.pageMap = {
            '#auth': '.auth-dialog-wrapper',
            '#chat': '.chat-wrapper'
        }
        this.currentPage = document.querySelector(this.pageMap['#auth'])
    }

    saveScreenAndNavigateTo(screen) {
        this.saveScreenInHistory(screen);
        this.navigateTo(screen);
    }

    navigateTo(screen) {
        debugger;
        const pageName = this.pageMap[screen];

        if(pageName) {
            const page = document.querySelector(pageName);

            if(page) {
                if(this.currentPage) {
                    this.currentPage.classList.add('hide');
                }

                page.classList.remove('hide');
                this.currentPage = page;
            }
        }
    }

    back() {
        history.back()
    }

    saveScreenInHistory(newPage) {
        history.pushState({
            page: newPage
        }, `${newPage} new page`)
        console.dir(history)
    }

}