import ReconnectingWebSocket from 'reconnecting-websocket';
import {WebSocketServer, WebSocket} from 'ws';
export class Cable {
  constructor(addr = "localhost", port = 3000, secure = false) {
    this.addr = addr;
    this.port = port;
    this.secure = secure;
    this.subscriptions = {};
    this.messageBuffer = [];
    this.connection = new ReconnectingWebSocket(`ws${this.secure ? "s" : ""}://${this.addr}:${this.port}`, [], { WebSocket });
    this.connection.onerror = this.onclose.bind(this);
    this.connection.onmessage = this.onmessage.bind(this);
    this.connection.onopen = this.onopen.bind(this);
    this.connection.onclose = this.onclose.bind(this);
  }

  onopen() {
    this.messageBuffer.forEach(message => this.connection.send(message));
    this.messageBuffer = [];
  }

  onclose() { }

  onmessage(event) {
    const message = JSON.parse(event.data);
    if (message.identifier) {
      this.subscriptions[message.identifier](message.data);
    }
  }

  subscribe(identifier, callback) {
    this.subscriptions[identifier] = callback;
  }

  send(identifier, data) {
    const message = { identifier, data };
    if (this.connection.readyState === 1) {
      this.connection.send(JSON.stringify(message));
    } else {
      this.messageBuffer.push(JSON.stringify(message));
    }
  }
};

export class CableServer {
  constructor(port = 3000, secure = false) {
    this.subscriptions = {};
    this.server = new WebSocketServer({ port });
    this.server.on('connection', (connection) => {
      connection.on('message', (message) => {
        const parsedMessage = JSON.parse(message);
        if (parsedMessage.identifier) {
          this.subscriptions[parsedMessage.identifier](parsedMessage.data);
        }
      });
    });
  }

  subscribe(identifier, callback) {
    this.subscriptions[identifier] = callback;
  }

  send(identifier, data) {
    const message = { identifier, data };
    this.server.clients.forEach((client) => {
      client.send(JSON.stringify(message));
    });
  }
}