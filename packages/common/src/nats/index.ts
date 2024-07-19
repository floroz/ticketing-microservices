import nats from "node-nats-streaming";

class _NATSClient {
  private _client?: nats.Stan;

  get client(): nats.Stan {
    if (!this._client) {
      throw new Error("NATS client not initialized");
    }
    return this._client;
  }

  connect(
    clusterId: string,
    clientId: string,
    url: string,
    opts: {
      onConnect?: () => void;
      onError?: (err: Error) => void;
    } = {}
  ) {
    if (this._client) {
      return;
    }
    this._client = nats.connect(clusterId, clientId, {
      url,
    });

    return new Promise((resolve, reject) => {
      this._client!.on("connect", () => {
        opts?.onConnect?.();
        resolve(undefined);
      });

      this._client!.on("error", (err) => {
        opts?.onError?.(err);
        reject(err);
      });
    });
  }
}

const NATS = new _NATSClient();

export { NATS };
