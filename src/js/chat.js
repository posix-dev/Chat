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
        this.authIdHandler = authIdHandler;
        // const messageValue = message({});
        const selfMessageValue = selfMessage({});
        const userItemValue = userItem({});
        const messageList = document.querySelector('.chat-detail-messages__user-list');
        const membersCount = document.querySelector('.chat-messages__member-count');
        const usersList = document.querySelector('.chat-list');
        const typingMessage = document.querySelector('.chat-messages__typing');

        this.clientServer.getSocket().on('messages', messages => {
            console.log(`message event ${messages}`);
        });

        this.clientServer.getSocket().on('usersCount', usersCount => {
            console.log(`usersCount event ${usersCount}`);
            membersCount.textContent = `${usersCount} ${this.declOfNum(usersCount)}`;
        });

        this.clientServer.getSocket().on('userList', users => {
            usersList.innerHTML = '';
            users.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = userItemValue.trim();
                const name = li.querySelector('.chat-item__profile-name');
                const lastMessage = li.querySelector('.chat-item__last-message');
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
            let li = document.createElement('li');

            // if (data.id === this.authIdHandler.id) {
                li.innerHTML = selfMessageValue.trim();
            // } else {
            //     li.innerHTML = messageValue.trim();
            // }

            const text = li.querySelector('.chat-detail-messages__message-text');
            const time = li.querySelector('.chat-detail-messages__message-time');
            text.innerHTML = data.message;
            time.innerHTML = new Date(data.date).toLocaleDateString('ru', {
                hour: 'numeric',
                minute: 'numeric',
            }).substr(12, 8);
            messageList.appendChild(li);
        });

        const chatMessageBtn = document.querySelector('.chat-writing__send-message-btn');
        const textMessageField = document.querySelector('.chat-writing__message');

        textMessageField.addEventListener('keypress', () => {
            this.store.dispatch(chatMessageWriting);
        });

        chatMessageBtn.addEventListener('click', e => {
            e.preventDefault();

            if (textMessageField.value !== '') {
                const action = {
                    ...chatSendMessageAction,
                    data: {
                        message: textMessageField.value,
                        date: new Date().getTime()
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

    // declOfNum(count, ['найдена', 'найдено', 'найдены']);

    render(state) {
        super.render(state);
        console.log('chat render')
    }

}