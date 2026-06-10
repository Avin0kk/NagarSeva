import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const stompClient = new Client({
  webSocketFactory: () =>
    new SockJS("http://localhost:8080/ws"),
  reconnectDelay: 5000,
});

// console.log("WEBSOCKET FILE LOADED");
// console.log(stompClient);
export default stompClient;