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
        this.userArray = [];
        this.userItemValue = userItem({});
        this.usersList = document.querySelector('.chat-list');
        this.uploadAvatarWrapper = document.querySelector('.upload-avatar-dialog-wrapper');
        this.fileRedactorWrapper = document.querySelector('.file-redactor-dialog-wrapper');
        const selfMessageValue = selfMessage({});
        const searchInput = document.querySelector('.chat-menu__search-item');
        const membersCount = document.querySelector('.chat-messages__member-count');
        const messageDetailWrapper = document.querySelector('.chat-detail-messages');
        const typingMessage = document.querySelector('.chat-messages__typing');
        const chatMessageBtn = document.querySelector('.chat-writing__send-message-btn');
        const textMessageField = document.querySelector('.chat-writing__message');
        const uploadedAvatarImg = this.fileRedactorWrapper.querySelector('.file-redactor-dialog__img');
        const uploadAvatarCloseBtn = document.querySelector('.upload-avatar-dialog__close-btn');
        const uploadAvatarBtn = document.querySelector('.upload-avatar-dialog__avatar');
        const uploadAvatarChooseInput = document.querySelector('.upload-avatar-dialog__choose-file');

        this.clientServer.socket.on('messages', messages => {
            console.log(`message event ${messages}`);
        });

        this.clientServer.socket.on('usersCount', usersCount => {
            console.log(`usersCount event ${usersCount}`);
            membersCount.textContent = `${usersCount} ${this.declOfNum(usersCount)}`;
        });

        this.clientServer.socket.on('userList', users => {
            this.userArray = users;
            this.renderUsers(this.userArray)
        });

        this.clientServer.socket.on('typing', data => {
            typingMessage.textContent = `${data.username} is typing...`;
        });

        this.clientServer.socket.on('untyping', data => {
            typingMessage.textContent = '';
        });

        this.clientServer.socket.on('message', data => {
            let div = document.createElement('div');
            div.innerHTML = selfMessageValue.trim();

            const detailMessagesWrapper = div.querySelector('.chat-detail-messages-wrapper');
            let messageList = div.querySelector('.chat-detail-messages__user-list');
            const messageLi = div.querySelector('.chat-detail-messages__item');
            const currentMessageWrapper = div.querySelector('.chat-detail-messages__message');
            const text = messageLi.querySelector('.chat-detail-messages__message-text');
            const time = messageLi.querySelector('.chat-detail-messages__message-time');
            const avatar = detailMessagesWrapper.querySelector('.chat-detail-messages__avatar');
            const userName = messageLi.querySelector('.chat-detail-messages__username');
            this.updateUserLastMessage(data.id, data.message)

            if (data.id === authIdHandler.id) {
                detailMessagesWrapper.classList.add("right");
                currentMessageWrapper.style.backgroundColor = '#2B5278';
                time.style.color = '#7DA8D3';
                userName.style.color = '#90c1f3';
            } else {
                detailMessagesWrapper.classList.add("left");
            }

            if (data.avatar) {
                avatar.src = data.avatar;
            }

            text.innerHTML = `${data.message}`;
            userName.textContent = `${data.fio}`;
            time.innerHTML = new Date(data.date).toLocaleDateString('ru', {
                hour: 'numeric',
                minute: 'numeric',
            }).substr(12, 8);
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
            const filteredList = this.getMatchList(e.target.value, this.userArray);
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
        });

        uploadAvatarCloseBtn.addEventListener('click', e => {
            this.uploadAvatarWrapper.classList.add('hide');
        });

        uploadAvatarBtn.addEventListener('click', e => {
            uploadAvatarChooseInput.click();
        });

        uploadAvatarChooseInput.addEventListener('change', e => {
            const file = e.target.files[0];
            const reader = new FileReader();

            reader.onload = e => {
                console.log(`Reading complete! ${file}`);
                this.uploadAvatarWrapper.classList.add('hide');
                this.fileRedactorWrapper.classList.remove('hide');
                uploadedAvatarImg.src = e.target.result;

                const saveBtn = this.fileRedactorWrapper.querySelector('.save');
                const cancelBtn = this.fileRedactorWrapper.querySelector('.cancel');
                saveBtn.addEventListener('click', () => {
                    //нужен лоадер
                    this.clientServer.socket.emit('sendImg', e.target.result);
                });
                cancelBtn.addEventListener('click', () => {
                    this.fileRedactorWrapper.classList.add('hide');
                })
            };

            reader.readAsDataURL(file);
        });

        this.clientServer.socket.on('sendImg', user => {
            const objIndex = this.userArray.findIndex((item => item.id === user.id));
            this.userArray[objIndex].avatar = user.avatar;
            this.fileRedactorWrapper.classList.add('hide');
            this.renderUsers(this.userArray);
        });

        this.usersList.addEventListener('click', e => {
            let target = e.target;

            if (target.tagName === 'IMG') {
                if (target.classList.contains('chat-item__avatar')) {
                    this.uploadAvatarWrapper.classList.remove('hide');
                }
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
        debugger;
        users.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = this.userItemValue.trim();
            const name = li.querySelector('.chat-item__profile-name');
            const avatar = li.querySelector('.chat-item__avatar');
            const lastMessage = li.querySelector('.chat-item__last-message');
            name.textContent = item.fio;
            if (item.messages && item.messages.length !== 0) {
                lastMessage.textContent = item.messages[item.messages.length - 1].message;
            } else {
                lastMessage.textContent = 'Нет сообщений';
            }
            if (item.avatar) {
                avatar.src = item.avatar;
            }
            this.usersList.appendChild(li);
        })
    }

    updateUserLastMessage(id, message = '') {
        const item = this.userArray.filter(item => item.id === id)[0];
        Array.from(this.usersList.children).forEach(child => {
            const userName = child.querySelector('.chat-item__profile-name');
            const fio = item.fio ? item.fio : 'Anonymous';
            if (userName.textContent === fio) {
                const lastMessage = child.querySelector('.chat-item__last-message');
                lastMessage.textContent = message;
            }
        });
    }
}