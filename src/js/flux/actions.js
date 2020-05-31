import {AUTH_CLOSE, AUTH_SUBMIT, CHAT_CLOSE, CHAT_SEND_MESSAGE, INIT} from '../utils/constants'

export class Actions {
    constructor() {
        this.initAction = {
            type: INIT
        }
        this.authCloseAction = {
            type: AUTH_CLOSE
        }
        this.authSubmitAction = {
            type: AUTH_SUBMIT
        }
        this.chatCloseAction = {
            type: CHAT_CLOSE
        }
        this.chatSendMessageAction = {
            type: CHAT_SEND_MESSAGE
        }
    }
}