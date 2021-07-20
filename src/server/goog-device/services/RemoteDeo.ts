import Net from 'net';
import { Service } from '../../services/DeoService';

export class RemoteDeo implements Service {
    private static instance?: RemoteDeo;

    public static start(): void {
        this.getInstance();
    }

    public static hasInstance(): boolean {
        return !!RemoteDeo.instance;
    }

    public static getInstance(): RemoteDeo {
        if (!this.instance) {
            this.instance = new RemoteDeo();
        }
        return this.instance;
    }

    protected title = 'RemoteDeo';

    protected data: any;
    protected client: any;
    protected lastSendTime: any;
    protected ticker: any;
    protected initialized: any;
    protected lastErrorTime: any;
    protected host: string;

    constructor() {
        this.client = undefined;
        this.ticker = null;
        this.initialized = false;
        this.lastErrorTime = Date.now();
        this.host = '192.168.43.76';
        this.data = null;
    }

    public getName() {
        return '';
    }

    public getData() {
        return this.data;
    }

    public release() {
        return '';
    }

    public attachToServer(ip: string) {
        const that = this;
        const port = 23554;
        const host = this.host;
        const isNewIp = host !== ip;
        console.log(isNewIp);
        this.host = ip;
        let client = this.client;
        if (isNewIp) {
            this.end();
        }
        if (!this.client) {
            client = new Net.Socket();
        }
        client
            .connect({ port: port, host: host }, () => {
                console.log('TCP connection established with the server.');
                this.ticker = setInterval(that.sendRemoteData, 1000);
            })
            .on('data', function (chunk: any) {
                console.log(chunk.toString());
                that.data = chunk.toString();
                // console.log(`Data received from the server: ${chunk.toString()}.`);
                // TODO: add state from the received data
            })
            .on('error', function (e: any) {
                console.log('Server is down, reconnecting:' + e.message);
            })
            .on('end', () => {
                clearInterval(that.ticker);
                that.end();
                console.log('Requested an end to the TCP connection');
            });
        this.client = client;
        return client;
    }

    public start(ip: string): void {
        this.attachToServer(ip);
    }

    public sendRemoteData = (data: any) => {
        let result;
        const jsonObject = data;
        const jsonString = JSON.stringify(jsonObject);
        const json_as_bytes = new TextEncoder().encode(jsonString);
        const length_as_bytes = new Uint8Array([json_as_bytes.length, 0, 0, 0]);
        result = new Uint8Array([...length_as_bytes, ...json_as_bytes]);
        this.client.write(result);
    };

    public setTitle(text = this.title): void {
        let titleTag: HTMLTitleElement | null = document.querySelector('head > title');
        if (!titleTag) {
            titleTag = document.createElement('title');
        }
        titleTag.innerText = text;
    }

    public setBodyClass(text: string): void {
        document.body.className = text;
    }

    public end(): void {
        if (this.client) {
            this.client.end();
            this.client = undefined;
        }
        clearInterval(this.ticker);
        this.client = undefined;
        this.initialized = false;
    }
}
