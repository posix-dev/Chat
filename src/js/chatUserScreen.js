import userItem from "../pug/includes/modules/user-item.pug";
import {sendImage} from "./flux/actions";

export class ChatUserScreen {

    constructor(clientServer, middleware) {
        this.initVariables(clientServer, middleware);
        this.initUiVariables();
        this.initUiListeners();
        this.initServerListeners();
    }

    initVariables(clientServer, middleware) {
        this.userArray = [];
        this.userItemValue = userItem({});
        this.clientServer = clientServer;
        this.middleware = middleware;
    }

    initUiVariables() {
        this.usersList = document.querySelector('.chat-list');
        this.searchInput = document.querySelector('.chat-menu__search-item');
        this.uploadAvatarWrapper = document.querySelector('.upload-avatar-dialog-wrapper');
        this.fileRedactorWrapper = document.querySelector('.file-redactor-dialog-wrapper');
        this.uploadAvatarCloseBtn = document.querySelector('.upload-avatar-dialog__close-btn');
        this.uploadedAvatarImg = this.fileRedactorWrapper.querySelector('.file-redactor-dialog__img');
        this.uploadAvatarChooseInput = document.querySelector('.upload-avatar-dialog__choose-file');
        this.uploadAvatarBtn = document.querySelector('.upload-avatar-dialog__avatar');
        this.uploadName = document.querySelector('.upload-avatar-dialog__name');
        this.uploadAvatarChooseInput = document.querySelector('.upload-avatar-dialog__choose-file');
    }

    initUiListeners() {
        this.searchInput.addEventListener('keyup', e => {
            const filteredList = this.getMatchList(e.target.value, this.userArray);
            debugger;
            this.renderUsers(filteredList);
        });
        this.uploadAvatarCloseBtn.addEventListener(
            'click', e => {
                this.uploadAvatarWrapper.classList.add('hide');
            }
        );

        this.uploadAvatarChooseInput.addEventListener(
            'change', e => this.uploadImgToServer(e)
        );

        this.uploadAvatarBtn.addEventListener(
            'click', e => this.uploadAvatarChooseInput.click()
        );

        this.uploadAvatarChooseInput.addEventListener(
            'change', e => this.uploadImgToServer(e)
        );

        this.usersList.addEventListener('click', e => {
            let target = e.target;

            if (target.tagName === 'IMG') {
                if (target.classList.contains('chat-item__avatar')) {
                    debugger;
                    this.uploadAvatarBtn.src = e.target.src;
                    const wrapper = e.target.nextElementSibling;
                    const name = wrapper.firstChild;
                    this.uploadName.textContent = name.textContent;
                    this.uploadAvatarWrapper.classList.remove('hide');
                }
            }
        });
    }

    initServerListeners() {
        this.clientServer.socket.on('userList', users => {
            this.userArray = users;
            this.renderUsers(this.userArray);
        });

        this.clientServer.socket.on('sendImg', user => this.handleImg(user));
    }

    handleImg(user) {
        const objIndex = this.userArray.findIndex((item => item.id === user.id));
        this.userArray[objIndex].avatar = user.avatar;
        this.fileRedactorWrapper.classList.add('hide');
        this.renderUsers(this.userArray);
    }

    renderUsers(users) {
        this.usersList.innerHTML = '';
        users.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = this.userItemValue.trim();
            const name = li.querySelector('.chat-item__profile-name');
            const avatar = li.querySelector('.chat-item__avatar');
            const lastMessage = li.querySelector('.chat-item__last-message');
            name.textContent = item.fio;
            debugger;
            if (item.messages && item.messages.length !== 0) {
                lastMessage.textContent = item.messages[item.messages.length - 1];
            } else {
                lastMessage.textContent = 'Нет сообщений';
            }
            if (item.avatar) {
                avatar.src = item.avatar;
            }
            this.usersList.appendChild(li);
        })
    }

    updateUserLastMessage(id, message) {
        const item = this.userArray.filter(item => item.id === id)[0];
        Array.from(this.usersList.children).forEach(child => {
            const userName = child.querySelector('.chat-item__profile-name');
            const fio = item.fio ? item.fio : 'Anonymous';
            if (userName.textContent === fio) {
                if (message) {
                    const lastMessage = child.querySelector('.chat-item__last-message');
                    lastMessage.textContent = message;
                }
            }
        });
    }

    getMatchList(matchedString, list) {
        debugger;
        return list.filter(item => this.isMatching(item.fio, matchedString));
    }


    isMatching(full = '', chunk = '') {
        let lowCaseFull = full.toLowerCase();
        let lowCaseChunk = chunk.toLowerCase();
        debugger;

        return lowCaseFull.includes(lowCaseChunk);
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
            saveBtn.addEventListener('click', () =>
                //нужен лоадер
                this.middleware.invoke({...sendImage, data: e.target.result})
            );
            cancelBtn.addEventListener(
                'click', () => this.fileRedactorWrapper.classList.add('hide')
            );
        };

        reader.readAsDataURL(file);
    }

}