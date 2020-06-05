import {
    AUTH_CLOSE,
    AUTH_SUBMIT,
    CHAT_CLOSE,
    CHAT_MESSAGE_STOP_WRITING,
    CHAT_MESSAGE_WRITING,
    CHAT_SEND_MESSAGE,
    INIT, SEND_IMAGE
} from '../utils/constants'

const initChatAction = {
    type: INIT
}
const authCloseAction = {
    type: AUTH_CLOSE
}
const authSubmitAction = {
    type: AUTH_SUBMIT
}
const chatCloseAction = {
    type: CHAT_CLOSE
}
const chatSendMessageAction = {
    type: CHAT_SEND_MESSAGE
}
const chatMessageWriting = {
    type: CHAT_MESSAGE_WRITING
}
const chatMessageStopWriting = {
    type: CHAT_MESSAGE_STOP_WRITING
}
const sendImage = {
    type: SEND_IMAGE
}

export {
    initChatAction,
    authCloseAction,
    authSubmitAction,
    chatCloseAction,
    chatSendMessageAction,
    chatMessageWriting,
    chatMessageStopWriting,
    sendImage
}