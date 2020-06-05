import {Middleware} from "./flux/middlewares/middleware";
import {chatMessageStopWriting, chatMessageWriting, chatSendMessageAction} from "./flux/actions";
import message from '../pug/includes/modules/message.pug'
import selfMessage from '../pug/includes/modules/message.pug'
import {ChatUserScreen} from "./chatUserScreen";
import {ChatMessagesScreen} from "./utils/chatMessagesScreen";

export class ChatScreen {

    constructor(router, server, authIdHandler) {
        this.initVariables(router, server, authIdHandler);
        this.initUiListeners();
        this.initServerListeners();
    }

    initVariables(router, server, authIdHandler) {
        this.clientServer = server;
        this.middleware = new Middleware(server);
        this.chatUserScreen = new ChatUserScreen(server);
        this.chatMessagesScreen = new ChatMessagesScreen();
        this.router = router;
        this.authIdHandler = authIdHandler;
        this.uploadAvatarWrapper = document.querySelector('.upload-avatar-dialog-wrapper');
        this.fileRedactorWrapper = document.querySelector('.file-redactor-dialog-wrapper');
        this.selfMessageValue = selfMessage({});
        this.membersCount = document.querySelector('.chat-messages__member-count');
        this.messageDetailWrapper = document.querySelector('.chat-detail-messages');
        this.typingMessage = document.querySelector('.chat-messages__typing');
        this.chatMessageBtn = document.querySelector('.chat-writing__send-message-btn');
        this.textMessageField = document.querySelector('.chat-writing__message');
        this.uploadedAvatarImg = this.fileRedactorWrapper.querySelector('.file-redactor-dialog__img');
        this.uploadAvatarCloseBtn = document.querySelector('.upload-avatar-dialog__close-btn');
        this.uploadAvatarBtn = document.querySelector('.upload-avatar-dialog__avatar');
        this.uploadAvatarChooseInput = document.querySelector('.upload-avatar-dialog__choose-file');
    }

    initUiListeners() {
        this.textMessageField.addEventListener('keypress', () => {
            this.middleware.invoke(chatMessageWriting);
            this.debounce(() => {
                this.middleware.invoke(chatMessageStopWriting);
            }, 1000)();
        });

        this.chatMessageBtn.addEventListener('click', e => this.sendMessage(e));

        this.uploadAvatarCloseBtn.addEventListener(
            'click', e => this.uploadAvatarWrapper.classList.add('hide')
        );

        this.uploadAvatarBtn.addEventListener(
            'click', e => this.uploadAvatarChooseInput.click()
        );

        this.uploadAvatarChooseInput.addEventListener(
            'change', e => this.uploadImgToServer(e)
        );

        this.chatUserScreen.usersList.addEventListener('click', e => {
            let target = e.target;

            if (target.tagName === 'IMG') {
                if (target.classList.contains('chat-item__avatar')) {
                    this.uploadAvatarWrapper.classList.remove('hide');
                }
            }
        });

    }

    initServerListeners() {
        this.clientServer.socket.on('messages', messages => {
            console.log(`message event ${messages}`);
        });

        this.clientServer.socket.on('usersCount', usersCount => {
            this.membersCount.textContent = `${usersCount} ${this.declOfNum(usersCount)}`;
        });

        this.clientServer.socket.on('typing', data => {
            this.typingMessage.textContent = `${data.username} is typing...`;
        });

        this.clientServer.socket.on('untyping', data => {
            this.typingMessage.textContent = '';
        });

        this.clientServer.socket.on('message', data => this.handleMessage(data));

        this.clientServer.socket.on('sendImg', user => this.handleImg(user));
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

    handleImg(user) {
        this.chatUserScreen.handleImg(user)
        this.fileRedactorWrapper.classList.add('hide');
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
        this.chatUserScreen.updateUserLastMessage(data.id, data.message)

        if (data.id === this.authIdHandler.id) {
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

    uploadImgToServer(e) {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = e => {
            this.uploadAvatarWrapper.classList.add('hide');
            this.fileRedactorWrapper.classList.remove('hide');
            this.uploadedAvatarImg.src = e.target.result;

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
    }

}