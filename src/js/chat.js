import {Middleware, Reducer, Store} from "./flux/stores/store";
import {View} from "./flux/view";
import {chatMessageStopWriting, chatMessageWriting, chatSendMessageAction} from "./flux/actions";
import message from '../pug/includes/modules/message.pug'
import selfMessage from '../pug/includes/modules/message.pug'
import userItem from '../pug/includes/modules/user-item.pug'

export class Chat extends View {

    constructor(router, server, authIdHandler) {
        super();
        this.reducer = new Reducer();
        this.clientServer = server;
        this.middleware = new Middleware(server);
        this.store = new Store(this.reducer, this.middleware, this);
        this.router = router;
        const selfMessageValue = selfMessage({});
        const userItemValue = userItem({});
        const membersCount = document.querySelector('.chat-messages__member-count');
        const usersList = document.querySelector('.chat-list');
        const messageDetailWrapper = document.querySelector('.chat-detail-messages');
        const typingMessage = document.querySelector('.chat-messages__typing');
        const chatMessageBtn = document.querySelector('.chat-writing__send-message-btn');
        const textMessageField = document.querySelector('.chat-writing__message');

        this.clientServer.getSocket().on('messages', messages => {
            console.log(`message event ${messages}`);
        });

        this.clientServer.getSocket().on('usersCount', usersCount => {
            console.log(`usersCount event ${usersCount}`);
            membersCount.textContent = `${usersCount} ${this.declOfNum(usersCount)}`;
        });

        this.clientServer.getSocket().on('userList', users => {
            debugger;
            usersList.innerHTML = '';
            users.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = userItemValue.trim();
                const name = li.querySelector('.chat-item__profile-name');
                // const lastMessage = li.querySelector('.chat-item__last-message');
                name.textContent = item.fio;
                usersList.appendChild(li);
            })
        });

        this.clientServer.getSocket().on('typing', data => {
            typingMessage.textContent = `${data.username} is typing...`;
        });

        this.clientServer.getSocket().on('untyping', data => {
            typingMessage.textContent = '';
        });

        this.clientServer.getSocket().on('message', data => {
            let div = document.createElement('div');
            div.innerHTML = selfMessageValue.trim();

            const messagesWrapper = div.querySelector('.chat-detail-messages-wrapper');
            const messageList = div.querySelector('.chat-detail-messages__user-list');
            const messageLi = div.querySelector('.chat-detail-messages__item');
            const detailMessageWrapper = div.querySelector('.chat-detail-messages__message');
            const text = messageLi.querySelector('.chat-detail-messages__message-text');
            const time = messageLi.querySelector('.chat-detail-messages__message-time');
            const userLi = document.querySelector('.chat-item');
            const lastMessage = userLi.querySelector('.chat-item__last-message');

            if (data.id === authIdHandler.id) {
                messagesWrapper.classList.add("right");
                detailMessageWrapper.style.backgroundColor = '#2B5278';
                time.style.color = '#7DA8D3';
            } else {
                messagesWrapper.classList.add("left");
            }

            text.innerHTML = `${data.message} ${data.id}`;
            time.innerHTML = new Date(data.date).toLocaleDateString('ru', {
                hour: 'numeric',
                minute: 'numeric',
            }).substr(12, 8);
            if(lastMessage) {
                lastMessage.textContent = `${data.message}`;
            }
            messageList.appendChild(messageLi);
            messageDetailWrapper.innerHTML += div.innerHTML;
        });

        textMessageField.addEventListener('keypress', () => {
            this.store.dispatch(chatMessageWriting);
            this.debounce(() => {
                debugger;
                this.store.dispatch(chatMessageStopWriting);
            }, 1000)();
        });

        chatMessageBtn.addEventListener('click', e => {
            e.preventDefault();

            if (textMessageField.value !== '') {
                const action = {
                    ...chatSendMessageAction,
                    data: {
                        message: textMessageField.value,
                        date: new Date().getTime(),
                        id: authIdHandler.id
                    }
                }

                this.store.dispatch(action)
                this.store.dispatch(chatMessageStopWriting)

                textMessageField.value = '';
            }
        })
    }

    declOfNum(number) {
        const listTitles = ['участник', 'участника', 'участников'];
        const cases = [2, 0, 1, 1, 1, 2];
        return listTitles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
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
    };

    render(state) {
        super.render(state);
        console.log('chat render')
    }

}