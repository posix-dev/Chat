import {chatMessageStopWriting, chatMessageWriting, chatSendMessageAction} from "../flux/actions";
import selfMessage from "../../pug/includes/modules/message.pug";

export class ChatMessagesScreen {

    constructor(authIdHandler, middleware, chatUserScreen, clientServer) {
        this.initVariables(authIdHandler, middleware, chatUserScreen, clientServer);
        this.initUiVariables();
        this.initUiListeners();
        this.initServerListeners();
    }

    initVariables(authIdHandler, middleware, chatUserScreen, clientServer) {
        this.selfMessageValue = selfMessage({});
        this.authIdHandler = authIdHandler;
        this.middleware = middleware;
        this.clientServer = clientServer;
        this.chatUserScreen = chatUserScreen;
    }

    initUiVariables() {
        this.messageDetailWrapper = document.querySelector('.chat-detail-messages');
        this.textMessageField = document.querySelector('.chat-writing__message');
        this.membersCount = document.querySelector('.chat-messages__member-count');
        this.typingMessage = document.querySelector('.chat-messages__typing');
        this.chatMessageBtn = document.querySelector('.chat-writing__send-message-btn');
    }

    initUiListeners() {
        this.textMessageField.addEventListener('keypress', () => {
            this.middleware.invoke(chatMessageWriting);
            this.debounce(() => {
                this.middleware.invoke(chatMessageStopWriting);
            }, 1000)();
        });

        this.chatMessageBtn.addEventListener(
            'click', e => this.sendMessage(e)
        );
    }

    initServerListeners() {
        this.clientServer.socket.on('message', data => this.handleMessage(data));

        this.clientServer.socket.on('usersCount', usersCount => {
            this.membersCount.textContent = `${usersCount} ${this.declOfNum(usersCount)}`;
        });

        this.clientServer.socket.on('typing', data => {
            this.typingMessage.textContent = `${data.username} is typing...`;
        });

        this.clientServer.socket.on('untyping', data => {
            this.typingMessage.textContent = '';
        });

        this.clientServer.socket.on('messages', messages => {
            console.log(`message event ${messages}`);
        });
    }

    handleMessage(data) {
        const div = document.createElement('div');
        div.innerHTML = this.selfMessageValue.trim();

        const detailMessagesWrapper = div.querySelector('.chat-detail-messages-wrapper');
        const messageList = div.querySelector('.chat-detail-messages__user-list');
        const messageLi = div.querySelector('.chat-detail-messages__item');
        const currentMessageWrapper = div.querySelector('.chat-detail-messages__message');
        const text = messageLi.querySelector('.chat-detail-messages__message-text');
        const time = messageLi.querySelector('.chat-detail-messages__message-time');
        const avatar = detailMessagesWrapper.querySelector('.chat-detail-messages__avatar');
        const userName = messageLi.querySelector('.chat-detail-messages__username');
        const objIndex = this.chatUserScreen.userArray.findIndex((i => i.id === data.id));
        this.chatUserScreen.userArray[objIndex].messages.push(data.message);
        this.chatUserScreen.updateUserLastMessage(data.id, data.message);

        if (data.id === this.authIdHandler.id) {
            detailMessagesWrapper.classList.add("right");
            currentMessageWrapper.style.backgroundColor = '#2B5278';
            time.style.color = '#7DA8D3';
            userName.style.color = '#90c1f3';
        } else {
            detailMessagesWrapper.classList.add("left");
        }

        if (data.avatar) avatar.src = data.avatar;

        text.innerHTML = `${data.message}`;
        userName.textContent = `${data.fio}`;
        time.innerHTML = new Date(data.date).toLocaleDateString('ru', {
            hour: 'numeric',
            minute: 'numeric',
        }).substr(12, 8);
        messageList.appendChild(messageLi);
        this.messageDetailWrapper.innerHTML += div.innerHTML;
    }

    sendMessage(e) {
        e.preventDefault();

        if (this.textMessageField.value !== '') {
            const action = {
                ...chatSendMessageAction,
                data: {
                    message: this.textMessageField.value,
                    date: new Date().getTime(),
                    id: this.authIdHandler.id
                }
            }

            this.middleware.invoke(action)
            this.middleware.invoke(chatMessageStopWriting)

            this.textMessageField.value = '';
        }
    }

    debounce(func, wait, immediate) {
        let timeout;
        return function () {
            let context = this, args = arguments;
            let later = function () {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            let callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }

    declOfNum(number) {
        const listTitles = ['участник', 'участника', 'участников'];
        const cases = [2, 0, 1, 1, 1, 2];
        return listTitles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
    }

    renderMessages(user) {
        Array.from(this.messageDetailWrapper.children).forEach(item => {
            //костыль
            if (
                item.lastChild.firstChild.firstChild.firstChild.firstChild.textContent === user.fio
            ) item.firstChild.src = user.avatar;
        });
    }
}