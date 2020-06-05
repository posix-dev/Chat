import userItem from "../pug/includes/modules/user-item.pug";

export class ChatUserScreen {

    constructor(clientServer) {
        this.initVariables(clientServer);
        this.initUiListeners();
        this.initServerListeners();
    }

    initVariables(clientServer) {
        this.userArray = [];
        this.userItemValue = userItem({});
        this.usersList = document.querySelector('.chat-list');
        this.searchInput = document.querySelector('.chat-menu__search-item');
        this.clientServer = clientServer;
    }

    initUiListeners() {
        this.searchInput.addEventListener('keyup', e => {
            const filteredList = this.getMatchList(e.target.value, this.userArray);
            this.renderUsers(filteredList);
        });
    }

    initServerListeners() {
        this.clientServer.socket.on('userList', users => {
            this.userArray = users;
            this.renderUsers(this.userArray);
        });
    }

    handleImg(user) {
        const objIndex = this.userArray.findIndex((item => item.id === user.id));
        this.userArray[objIndex].avatar = user.avatar;
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

    updateUserLastMessage(id, message) {
        const item = this.userArray.filter(item => item.id === id)[0];
        Array.from(this.usersList.children).forEach(child => {
            const userName = child.querySelector('.chat-item__profile-name');
            const fio = item.fio ? item.fio : 'Anonymous';
            if (userName.textContent === fio) {
                if(message) {
                    const lastMessage = child.querySelector('.chat-item__last-message');
                    lastMessage.textContent = message;
                }
            }
        });
    }

    getMatchList(matchedString, list) {
        return Array.from(list).filter(item =>
            (this.isMatching(item.fio, matchedString))
        );
    }


    isMatching(full = '', chunk = '') {
        let lowCaseFull = full.toLowerCase();
        let lowCaseChunk = chunk.toLowerCase();

        return lowCaseFull.includes(lowCaseChunk);
    };

}