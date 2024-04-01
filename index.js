import ReconnectingWebSocket from "reconnecting-websocket";
import { WebSocketServer, WebSocket } from "ws";

/**
 * # Cable client
 *
 * @export Cable Client class
 * @class Cable
 */
export class Cable {
  /**
   * Creates an instance of Cable.
   * @param {string} [addr="localhost"] Cable server address
   * @param {number} [port=3000] Cable server port
   * @param {boolean} [secure=false] Cable server websocket ssl enabled
   * @memberof Cable
   */
  constructor(addr = "localhost", port = 3000, secure = false) {
    this.addr = addr;
    this.port = port;
    this.secure = secure;
    this.subscriptions = {};
    this.messageBuffer = [];
    this.connection = new ReconnectingWebSocket(
      `ws${this.secure ? "s" : ""}://${this.addr}:${this.port}`,
      [],
      { WebSocket }
    );
    this.connection.onerror = this.onclose.bind(this);
    this.connection.onmessage = this.onmessage.bind(this);
    this.connection.onopen = this.onopen.bind(this);
    this.connection.onclose = this.onclose.bind(this);
  }

  onopen() {
    this.messageBuffer.forEach((message) => this.connection.send(message));
    this.messageBuffer = [];
  }

  onclose() {}

  onmessage(event) {
    const message = JSON.parse(event.data);
    if (message.identifier && this.subscriptions[message.identifier]) {
      this.subscriptions[message.identifier](message.data);
    }
  }

  /**
   * ### Listen for messages with the given identifier
   *
   * @param {*} identifier Identifier of the message
   * @param {*} callback Callback if the message has correct identifier
   * @memberof Cable
   */
  subscribe(identifier, callback) {
    this.subscriptions[identifier] = callback;
  }

  /**
   * ### Send a message to cable server
   *
   * @param {*} identifier Identifier of the message
   * @param {*} data Message content
   * @memberof Cable
   */
  send(identifier, data) {
    const message = { identifier, data };
    if (this.connection.readyState === 1) {
      this.connection.send(JSON.stringify(message));
    } else {
      this.messageBuffer.push(JSON.stringify(message));
    }
  }
}

/**
 * # Cable server
 *
 * @export Cable Server class
 * @class CableServer
 */
export class CableServer {
  constructor(port = 3000) {
    this.subscriptions = {};
    this.server = new WebSocketServer({ port });
    this.server.on("connection", (connection) => {
      connection.on("message", (message) => {
        const parsedMessage = JSON.parse(message);
        if (
          parsedMessage.identifier &&
          this.subscriptions[parsedMessage.identifier]
        ) {
          this.subscriptions[parsedMessage.identifier](parsedMessage.data);
        }
      });
    });
  }

  /**
   * ### Listen for messages with the given identifier
   *
   * @param {*} identifier Identifier of the message
   * @param {*} callback Callback if the message has correct identifier
   * @memberof Cable
   */
  subscribe(identifier, callback) {
    this.subscriptions[identifier] = callback;
  }

  /**
   * ### Send a message to cable clients
   *
   * @param {*} identifier Identifier of the message
   * @param {*} data Message content
   * @memberof Cable
   */
  send(identifier, data) {
    const message = { identifier, data };
    this.server.clients.forEach((client) => {
      client.send(JSON.stringify(message));
    });
  }
}
