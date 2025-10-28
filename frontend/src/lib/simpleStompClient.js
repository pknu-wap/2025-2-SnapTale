const TERMINATOR = "\u0000";

function buildFrame(command, headers = {}, body = "") {
  const headerLines = Object.entries(headers)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${key}:${value}`);

  return `${command}\n${headerLines.join("\n")}\n\n${body}${TERMINATOR}`;
}

function parseFrame(rawFrame) {
  const sanitized = rawFrame.replace(/\r/g, "");
  const segments = sanitized.split("\n");
  const command = segments.shift();

  const headers = {};
  let line = segments.shift();
  while (line !== undefined && line !== "") {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex > -1) {
      const key = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trim();
      headers[key] = value;
    }
    line = segments.shift();
  }

  const body = segments.join("\n");
  return { command, headers, body };
}

function splitFrames(payload) {
  return payload
    .split(TERMINATOR)
    .map((frame) => frame.trim())
    .filter((frame) => frame.length > 0);
}

export class SimpleStompClient {
  constructor(url) {
    this.url = url;
    this.ws = null;
    this.subscriptions = new Map();
    this.subscriptionCounter = 0;
    this.onConnectCallbacks = [];
    this.onErrorCallbacks = [];
    this.onCloseCallbacks = [];
    this.connected = false;
    this.sessionId = null;
  }

  connect(headers = {}) {
    if (this.ws) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url, ["v12.stomp", "v11.stomp", "v10.stomp"]);

      this.ws.onopen = () => {
        let hostHeader;
        try {
          hostHeader = new URL(this.url).host;
        } catch {
          hostHeader = undefined;
        }
        const frame = buildFrame(
          "CONNECT",
          {
            "accept-version": "1.2,1.1,1.0",
            "heart-beat": "10000,10000",
            host: hostHeader,
            ...headers,
          },
        );
        this.ws.send(frame);
      };

      this.ws.onmessage = (event) => {
        const frames = splitFrames(event.data);
        frames.forEach((frameRaw) => {
          const frame = parseFrame(frameRaw);

          if (frame.command === "CONNECTED") {
            this.connected = true;
            this.sessionId = frame.headers.session;
            resolve(frame);
            this.onConnectCallbacks.forEach((callback) => callback(frame));
            return;
          }

          if (frame.command === "MESSAGE") {
            const subscriptionId = frame.headers.subscription;
            const handler = this.subscriptions.get(subscriptionId);
            if (handler) {
              handler(frame);
            }
            return;
          }

          if (frame.command === "ERROR") {
            const error = new Error(frame.body || "STOMP error");
            this.onErrorCallbacks.forEach((callback) => callback(error));
            reject(error);
          }
        });
      };

      this.ws.onerror = (error) => {
        const err = error instanceof Event ? new Error("WebSocket error") : error;
        this.onErrorCallbacks.forEach((callback) => callback(err));
        reject(err);
      };

      this.ws.onclose = (event) => {
        this.connected = false;
        this.sessionId = null;
        this.subscriptions.clear();
        this.ws = null;
        this.onCloseCallbacks.forEach((callback) => callback(event));
      };
    });
  }

  subscribe(destination, callback, headers = {}) {
    if (!this.connected || !this.ws) {
      throw new Error("STOMP client is not connected");
    }

    const id = headers.id || `sub-${++this.subscriptionCounter}`;
    this.subscriptions.set(id, callback);
    const frame = buildFrame("SUBSCRIBE", {
      id,
      destination,
      ack: "auto",
      ...headers,
    });
    this.ws.send(frame);

    return {
      unsubscribe: () => {
        if (!this.ws) {
          return;
        }
        this.ws.send(buildFrame("UNSUBSCRIBE", { id }));
        this.subscriptions.delete(id);
      },
    };
  }

  disconnect() {
    if (!this.ws) {
      return;
    }
    try {
      if (this.connected) {
        this.ws.send(buildFrame("DISCONNECT"));
      }
      this.ws.close();
    } finally {
      this.ws = null;
      this.connected = false;
      this.sessionId = null;
      this.subscriptions.clear();
    }
  }

  onConnect(callback) {
    this.onConnectCallbacks.push(callback);
  }

  onError(callback) {
    this.onErrorCallbacks.push(callback);
  }

  onClose(callback) {
    this.onCloseCallbacks.push(callback);
  }
}
