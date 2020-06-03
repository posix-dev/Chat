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
        let userArray = [];
        const selfMessageValue = selfMessage({});
        this.userItemValue = userItem({});
        const searchInput = document.querySelector('.chat-menu__search-item');
        const membersCount = document.querySelector('.chat-messages__member-count');
        this.usersList = document.querySelector('.chat-list');
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
            userArray = users;
            this.renderUsers(userArray)
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
            let messageList = div.querySelector('.chat-detail-messages__user-list');
            const messageLi = div.querySelector('.chat-detail-messages__item');
            const detailMessageWrapper = div.querySelector('.chat-detail-messages__message');
            const text = messageLi.querySelector('.chat-detail-messages__message-text');
            const time = messageLi.querySelector('.chat-detail-messages__message-time');
            const avatar = messageLi.querySelector('.chat-detail-messages__avatar');
            const userName = messageLi.querySelector('.chat-detail-messages__username');
            const userLi = document.querySelector('.chat-item');
            const lastMessage = userLi.querySelector('.chat-item__last-message');

            if (data.id === authIdHandler.id) {
                messagesWrapper.classList.add("right");
                detailMessageWrapper.style.backgroundColor = '#2B5278';
                time.style.color = '#7DA8D3';
                userName.style.color = '#90c1f3';
            } else {
                messagesWrapper.classList.add("left");
            }

            if (messageDetailWrapper.contains(messageList)) {
                messageList =
                    messagesWrapper.querySelector('.chat-detail-messages__user-list');
                avatar.style.display = 'none';
            }

            debugger;
            if (messageList.length > 1) {
                avatar.style.display = 'none';
            }

            text.innerHTML = `${data.message}`;
            userName.textContent = `${data.fio}`;
            time.innerHTML = new Date(data.date).toLocaleDateString('ru', {
                hour: 'numeric',
                minute: 'numeric',
            }).substr(12, 8);
            // if(lastMessage) {
            //     lastMessage.textContent = `${data.message}`;
            // }
            messageList.appendChild(messageLi);
            messageDetailWrapper.innerHTML += div.innerHTML;
        });

        textMessageField.addEventListener('keypress', () => {
            this.store.dispatch(chatMessageWriting);
            this.debounce(() => {
                this.store.dispatch(chatMessageStopWriting);
            }, 1000)();
        });

        searchInput.addEventListener('keyup', e => {
            const filteredList = this.getMatchList(e.target.value, userArray);
            this.renderUsers(filteredList);
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

    getMatchList(matchedString, list) {
        return Array.from(list).filter(item =>
            (this.isMatching(item.fio, matchedString))
        );
    }


    isMatching(full = '', chunk = '') {
        console.dir(`eeee ${full} - ${chunk}`)
        let lowCaseFull = full.toLowerCase();
        let lowCaseChunk = chunk.toLowerCase();

        return lowCaseFull.includes(lowCaseChunk);
    };

    render(state) {
        super.render(state);
        console.log('chat render')
    }

    renderUsers(users) {
        this.usersList.innerHTML = '';
        users.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = this.userItemValue.trim();
            const name = li.querySelector('.chat-item__profile-name');
            // const lastMessage = li.querySelector('.chat-item__last-message');
            name.textContent = item.fio;
            this.usersList.appendChild(li);
        })
    }
}