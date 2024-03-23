import Login from "./Login";

export default class Chat {
  constructor(element, server) {
    this.server = server;
    this.parentElement = element;
    this.chatContainer = this.parentElement.querySelector(".chat_main");
    this.chatElement = this.parentElement.querySelector(".chat_messages");
    this.chatMembersElement =
      this.parentElement.querySelector(".chat_members_list");
    this.chatFormElement = this.parentElement.querySelector(".chat_form");
    this.chatInputElement = this.parentElement.querySelector(".chat_input");

    this.login = new Login(this.parentElement, this.server);
    this.chat = this.chat.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
  }

  init() {
    this.login.connect();
    this.parentElement.addEventListener("connect", () => {
      this.chatContainer.style.display = "flex";
      this.chat();
    });
  }

  chat() {
    this.nickname = this.login.nickElement.value;
    this.allClients = this.login.clientsList;
    this.chatMembersReload();
    this.login.closeForm();

    this.login.ws.addEventListener("message", (evt) => {
      const msg = JSON.parse(evt.data);
      if (msg.event === "chat") {
        const msgElement = this.messageConstructor(
          msg.message.nickname,
          msg.message.date,
          msg.message.text,
        );
        this.chatElement.append(msgElement);
        this.chatElement.scrollTop =
          this.chatElement.scrollHeight -
          this.chatElement.getBoundingClientRect().height;
      }

      if (msg.event === "system") {
        this.systemMessageShow(msg);
      }
    });

    this.chatFormElement.addEventListener("submit", this.sendMessage);
  }

  messageConstructor(nickname, date, text) {
    const msgElement = document.createElement("div");
    msgElement.classList.add("chat_message");

    if (this.nickname === nickname) {
      msgElement.classList.add("chat_message_you");
      nickname = "You";
    }

    const msgInfo = document.createElement("div");
    msgInfo.classList.add("chat_message_info");
    msgInfo.innerText = `${nickname}, ${new Date(date).toLocaleTimeString()} ${new Date(date).toLocaleDateString()}`;

    const msgText = document.createElement("div");
    msgText.classList.add("chat_message_text");
    msgText.innerText = text;

    msgElement.append(msgInfo, msgText);
    return msgElement;
  }

  chatMembersReload() {
    this.chatMembersElement.innerHTML = "";
    this.allClients.forEach((client) => {
      const clientElement = document.createElement("li");
      clientElement.classList.add("chat_member");
      clientElement.innerText = client;
      this.chatMembersElement.append(clientElement);
    });
    const clientElement = document.createElement("li");
    clientElement.classList.add("chat_member");
    clientElement.classList.add("chat_member_you");
    clientElement.innerText = "You";
    this.chatMembersElement.append(clientElement);
  }

  sendMessage(e) {
    e.preventDefault();
    const message = JSON.stringify({
      event: "chat",
      message: this.chatInputElement.value,
    });
    this.login.ws.send(message);
    this.chatInputElement.value = "";
  }

  systemMessageShow(msg) {
    const msgElement = document.createElement("div");
    msgElement.classList.add("chat_system_message");
    if (msg.message.action === "login") {
      msgElement.innerText = `${msg.message.nickname} joined the chat`;
      if (this.nickname !== msg.message.nickname)
        this.allClients.push(msg.message.nickname);
    } else if (msg.message.action === "logout") {
      msgElement.innerText = `${msg.message.nickname} leaved the chat`;
      const clientIndex = this.allClients.indexOf(msg.message.nickname);
      this.allClients.splice(clientIndex, 1);
    }
    this.chatElement.append(msgElement);
    this.chatElement.scrollTop =
      this.chatElement.scrollHeight -
      this.chatElement.getBoundingClientRect().height;

    this.chatMembersReload();
  }
}
