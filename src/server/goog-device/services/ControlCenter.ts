import { TrackerChangeSet } from '@devicefarmer/adbkit/lib/TrackerChangeSet';
import { Device } from '../Device';
import { Service } from '../../services/Service';
import AdbKitClient from '@devicefarmer/adbkit/lib/adb/client';
import AdbKit from '@devicefarmer/adbkit';
import GoogDeviceDescriptor from '../../../types/GoogDeviceDescriptor';
import Tracker from '@devicefarmer/adbkit/lib/adb/tracker';
import Timeout = NodeJS.Timeout;
import { BaseControlCenter } from '../../services/BaseControlCenter';
import { ControlCenterCommand } from '../../../common/ControlCenterCommand';
import * as os from 'os';
import * as crypto from 'crypto';
import { DeviceState } from '../../../common/DeviceState';
import { RemoteDeo } from './RemoteDeo';

export class ControlCenter extends BaseControlCenter<GoogDeviceDescriptor> implements Service {
    private static readonly defaultWaitAfterError = 1000;
    private static instance?: ControlCenter;

    private initialized = false;
    private client: AdbKitClient = AdbKit.createClient();
    private tracker?: Tracker;
    private waitAfterError = 1000;
    private restartTimeoutId?: Timeout;
    private deviceMap: Map<string, Device> = new Map();
    private descriptors: Map<string, GoogDeviceDescriptor> = new Map();
    private readonly id: string;
    private remoteDeo: any;

    protected constructor() {
        super();
        const idString = `goog|${os.hostname()}|${os.uptime()}`;
        this.id = crypto.createHash('md5').update(idString).digest('hex');
        this.remoteDeo = null;
    }

    public static getInstance(): ControlCenter {
        if (!this.instance) {
            this.instance = new ControlCenter();
        }
        return this.instance;
    }

    public static hasInstance(): boolean {
        return !!ControlCenter.instance;
    }

    private restartTracker = (): void => {
        if (this.restartTimeoutId) {
            return;
        }
        console.log(`Device tracker is down. Will try to restart in ${this.waitAfterError}ms`);
        this.restartTimeoutId = setTimeout(() => {
            this.stopTracker();
            this.waitAfterError *= 1.2;
            this.init();
        }, this.waitAfterError);
    };

    private onChangeSet = (changes: TrackerChangeSet): void => {
        this.waitAfterError = ControlCenter.defaultWaitAfterError;
        if (changes.added.length) {
            for (const item of changes.added) {
                const { id, type } = item;
                this.handleConnected(id, type);
            }
        }
        if (changes.removed.length) {
            for (const item of changes.removed) {
                const { id } = item;
                this.handleConnected(id, DeviceState.DISCONNECTED);
            }
        }
        if (changes.changed.length) {
            for (const item of changes.changed) {
                const { id, type } = item;
                this.handleConnected(id, type);
            }
        }
    };

    private onDeviceUpdate = (device: Device): void => {
        const { udid, descriptor } = device;
        this.descriptors.set(udid, descriptor);
        this.emit('device', descriptor);
    };

    private handleConnected(udid: string, state: string): void {
        let device = this.deviceMap.get(udid);
        if (device) {
            device.setState(state);
        } else {
            device = new Device(udid, state);
            device.on('update', this.onDeviceUpdate);
            this.deviceMap.set(udid, device);
        }
    }

    public onStartDeo = (ip: string): void => {
        console.log(ip + ', onstart deo');
        if (!this.remoteDeo) {
            console.log('creating new deo instance');
            this.remoteDeo = new RemoteDeo();
            this.remoteDeo.start();
        } else {
            this.remoteDeo.end();
            this.remoteDeo.start(ip);
        }
    };

    public async init(): Promise<void> {
        if (this.initialized) {
            return;
        }
        this.tracker = await this.startTracker();
        const list = await this.client.listDevices();
        list.forEach((device) => {
            const { id, type } = device;
            this.handleConnected(id, type);
        });
        this.initialized = true;
    }

    private async startTracker(): Promise<Tracker> {
        if (this.tracker) {
            return this.tracker;
        }
        const tracker = await this.client.trackDevices();
        tracker.on('changeSet', this.onChangeSet);
        tracker.on('end', this.restartTracker);
        tracker.on('error', this.restartTracker);
        return tracker;
    }

    private stopTracker(): void {
        if (this.tracker) {
            this.tracker.off('changeSet', this.onChangeSet);
            this.tracker.off('end', this.restartTracker);
            this.tracker.off('error', this.restartTracker);
            this.tracker.end();
            this.tracker = undefined;
        }
        this.tracker = undefined;
        this.initialized = false;
    }

    public getDevices(): GoogDeviceDescriptor[] {
        return Array.from(this.descriptors.values());
    }

    public getDevice(udid: string): Device | undefined {
        return this.deviceMap.get(udid);
    }

    public getId(): string {
        return this.id;
    }

    public getName(): string {
        return `aDevice Tracker [${os.hostname()}]`;
    }

    public start(): void {
        this.init().catch((e) => {
            console.error(`Error: Failed to init "${this.getName()}". ${e.message}`);
        });
    }

    public release(): void {
        this.stopTracker();
    }

    public async runCommand(command: ControlCenterCommand): Promise<void> {
        const udid = command.getUdid();
        const device = this.getDevice(udid);
        const deo = this.remoteDeo;
        // if (!device && command.getData().udid) {
        //     console.error(`Device with udid:"${udid}" not found`);
        //     return;
        // }
        const type = command.getType();
        switch (type) {
            case ControlCenterCommand.SEND_DEO:
                if (deo) {
                    const data = command.getData();
                    const jsonObject = {
                        path: `/storage/emulated/0/${data.inputValue || 'Download/R0010005.MP4'}`,
                        duration: null,
                        currentTime: 0.0,
                        playbackSpeed: 0.0,
                        playerState: 0,
                    };
                    await deo.sendRemoteData(jsonObject);
                } else {
                    console.log('No deo instance!');
                }
                return;
            case ControlCenterCommand.CONNECT_DEO:
                const data = command.getData();
                this.onStartDeo(data.inputValue);
                return;
            case ControlCenterCommand.RUN_DEO:
                await device?.runDeoApp();
                return;
            case ControlCenterCommand.SCREEN_TOGGLE:
                await device?.runScreenToggle();
                return;
            case ControlCenterCommand.MENU:
                await device?.runMenu();
                return;
            case ControlCenterCommand.KILL_SERVER:
                await device?.killServer(command.getPid());
                return;
            case ControlCenterCommand.START_SERVER:
                await device?.startServer();
                return;
            case ControlCenterCommand.UPDATE_INTERFACES:
                await device?.updateInterfaces();
                return;
            default:
                throw new Error(`Control,Center: Unsupported command: "${type}"`);
        }
    }
}
