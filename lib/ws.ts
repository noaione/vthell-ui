export interface IEventHandler {
    (data: any): void;
}

interface IEventHandlers {
    [key: string]: IEventHandler[];
}

export default class VTHellWebsocket {
    url: string;
    ws!: WebSocket;
    closedManually!: boolean;
    eventHandler: IEventHandlers;
    reset: boolean;

    constructor(url: string) {
        this.url = url;
        this.eventHandler = {};
        this.reset = false;
        this.resetConnection();
    }

    resetConnection() {
        if (typeof this.ws !== "undefined") {
            this.ws.close();
        }
        this.ws = new WebSocket(this.url);
        this.#bindHandler();
        this.closedManually = false;
        this.reset = false;
    }

    #dispatchInternal(event: string, data: any) {
        const allHandlers = this.eventHandler[event];
        if (typeof allHandlers !== "undefined") {
            allHandlers.forEach((handler) => {
                handler(data);
            });
        }
    }

    #bindHandler() {
        this.ws.onopen = (ev) => {
            // @ts-ignore
            console.info("Connection established with the server", ev.target.url);
            this.reset = true;
        };
        this.ws.onclose = (ev) => {
            // @ts-ignore
            console.info("Connection closed with the server", ev.target.url);
            this.#dispatchInternal("closed", ev);
            setTimeout(() => {
                this.resetConnection();
            }, 5000);
        };
        this.ws.onerror = (ev) => {
            console.error("Error with the connection", ev);
            this.ws.close();
        };
        this.ws.onmessage = (ev) => {
            console.debug("Message received", ev);
            const rawData = ev.data;
            if (rawData instanceof Blob) {
                rawData.text().then((text) => {
                    const asJson = JSON.parse(text);
                    if (typeof asJson === "undefined" || asJson === null) {
                        console.error("Invalid JSON");
                        return;
                    }
                    const { event, data } = asJson;
                    this.#dispatchInternal(event, data);
                });
            } else if (typeof rawData === "string") {
                const asJson = JSON.parse(rawData);
                if (typeof asJson === "undefined" || asJson === null) {
                    console.error("Invalid JSON");
                    return;
                }
                const { event, data } = asJson;
                this.#dispatchInternal(event, data);
            }
        };
    }

    on(event: string, callback: (data: any) => void) {
        if (!(event in this.eventHandler)) {
            this.eventHandler[event] = [];
        }
        this.eventHandler[event].push(callback);
    }

    off(event: string) {
        try {
            delete this.eventHandler[event];
        } catch (e) {
            console.error(e);
        }
    }

    emit(event: string, data: any) {
        this.ws.send(JSON.stringify({ event, data }));
    }

    close() {
        this.closedManually = true;
        this.ws.close();
    }
}
