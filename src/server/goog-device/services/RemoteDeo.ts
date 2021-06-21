import Net from 'net'
import { Service } from '../../services/Service';

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

    protected readonly data: any;
    protected end: any;
    protected client: any;
    protected lastSendTime: any;
    protected ticker: any;

    constructor() {
        //this.attachToServer()
        this.ticker = null;
    }

    public getName() {
        return ""
    }

    public release() {
        return ""
    }

    public attachToServer() {
        const that = this
        const port = 23554;
        const host = '192.168.1.97';
        const client =  new Net.Socket()
        client.connect({ port: port, host: host }, () => {
            console.log('TCP connection established with the server.');
            // const jsonObject = {"path":"/storage/emulated/0/Download/R0010005.MP4","duration":null,"currentTime":0.0,"playbackSpeed":0.0,"playerState":0}
            // const jsonString = JSON.stringify(jsonObject)
            // var json_as_bytes = new TextEncoder().encode(jsonString)
            // console.log(json_as_bytes.length)
            // var length_as_bytes = new Uint8Array([json_as_bytes.length, 0,0,0])
            // console.log(length_as_bytes)
        
            // const result = new Uint8Array([...length_as_bytes, ...json_as_bytes ])
            this.ticker = setInterval(that.sendRemoteData, 1000);
            // client.write(result)
        }).on('data', function() {
            // console.log(`Data received from the server: ${chunk.toString()}.`);
            // client.write("");
        
            // Request an end to the connection after the data has been received.
            // client.end();
        }).on('error', function(e) {
            console.log('Server is down, reconnecting:' + e.message);
            clearInterval(that.ticker)
            that.attachToServer()
        }).on('end', () => {
            clearInterval(that.ticker)
            console.log('Requested an end to the TCP connection');
        });
        this.client = client;
        return client;
    }


    public start(): void {
        this.attachToServer();
    }

    public sendRemoteData = (data: any) =>
    {
        var result;
        const jsonObject = data
        const jsonString = JSON.stringify(jsonObject)
        var json_as_bytes = new TextEncoder().encode(jsonString)
        var length_as_bytes = new Uint8Array([json_as_bytes.length, 0,0,0])
        result = new Uint8Array([...length_as_bytes, ...json_as_bytes ])
        this.client.write(result);
    }

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
}