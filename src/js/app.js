import Chat from "./Chat";

const chat = new Chat(document.querySelector(".chat"), "wss://ahj-sse-ws-backend-c784.onrender.com/");
chat.init();
