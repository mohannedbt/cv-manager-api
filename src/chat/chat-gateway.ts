import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Socket, Server } from "socket.io";

@WebSocketGateway(3002, { cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server!: Server;

@SubscribeMessage('newMessage')
handleNewMessage(client: Socket, payload: { text: string }) {
    client.broadcast.emit('message', {
        text: payload.text,
        senderId: client.id,
        timestamp: new Date().toISOString()
    });
}

handleConnection(client: Socket) {
    client.broadcast.emit('userConnected', { 
        message: `Client ${client.id.slice(0,8)}... connected`,
        timestamp: new Date().toISOString()
    });
}

handleDisconnect(client: Socket) {
    client.broadcast.emit('userDisconnected', { 
        message: `Client ${client.id.slice(0,8)}... disconnected`,
        timestamp: new Date().toISOString()
    });
}
}