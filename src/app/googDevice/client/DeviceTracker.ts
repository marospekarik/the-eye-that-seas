import '../../../style/devicelist.css';
import '../../../style/tailwind.min.css';

import { BaseDeviceTracker } from '../../client/BaseDeviceTracker';
import { SERVER_PORT } from '../../../common/Constants';
import { ACTION } from '../../../common/Action';
import GoogDeviceDescriptor from '../../../types/GoogDeviceDescriptor';
import { ControlCenterCommand } from '../../../common/ControlCenterCommand';
import { StreamClientScrcpy } from './StreamClientScrcpy';
import { TinyH264Player } from '../../player/TinyH264Player';
import SvgImage from '../../ui/SvgImage';
import { html } from '../../ui/HtmlTag';
// import { DevtoolsClient } from './DevtoolsClient';
import { ShellClient } from './ShellClient';
import Util from '../../Util';
import { Attribute } from '../../Attribute';
import { DeviceState } from '../../../common/DeviceState';
import { Message } from '../../../types/Message';
import { ParamsDeviceTracker } from '../../../types/ParamsDeviceTracker';
import { HostItem } from '../../../types/Configuration';

type Field = keyof GoogDeviceDescriptor | ((descriptor: GoogDeviceDescriptor) => string);
type DescriptionColumn = { title: string; field: Field };

const DESC_COLUMNS: DescriptionColumn[] = [
    {
        title: 'Net Interface',
        field: 'interfaces',
    },
    {
        title: 'Server PID',
        field: 'pid',
    },
];

export class DeviceTracker extends BaseDeviceTracker<GoogDeviceDescriptor, never> {
    public static readonly ACTION = ACTION.GOOG_DEVICE_LIST;
    public static readonly CREATE_DIRECT_LINKS = true;
    public static readonly AttributePrefixInterfaceSelectFor = 'interface_select_for_';
    public static readonly AttributePlayerFullName = 'data-player-full-name';
    public static readonly AttributePlayerCodeName = 'data-player-code-name';
    public static readonly AttributePrefixPlayerFor = 'player_for_';
    private static instancesByUrl: Map<string, DeviceTracker> = new Map();
    protected tableId = 'goog_device_list';

    public static start(hostItem: HostItem): DeviceTracker {
        const url = this.buildUrlForTracker(hostItem).toString();
        let instance = this.instancesByUrl.get(url);
        if (!instance) {
            instance = new DeviceTracker(hostItem, url);
        }
        return instance;
    }

    public static getInstance(hostItem: HostItem): DeviceTracker {
        return this.start(hostItem);
    }

    protected constructor(params: HostItem, directUrl: string) {
        super({ ...params, action: DeviceTracker.ACTION }, directUrl);
        DeviceTracker.instancesByUrl.set(directUrl, this);
        this.buildDeviceTable();
        this.openNewWebSocket();
    }

    protected onSocketOpen(): void {
        // nothing here;
    }

    protected setIdAndHostName(id: string, hostName: string): void {
        super.setIdAndHostName(id, hostName);
        for (const value of DeviceTracker.instancesByUrl.values()) {
            if (value.id === id && value !== this) {
                console.warn(
                    `Tracker with url: "${this.url}" has the same id(${this.id}) as tracker with url "${value.url}"`,
                );
                console.warn(`This tracker will shut down`);
                this.destroy();
            }
        }
    }

    onInterfaceSelected = (e: Event): void => {
        const selectElement = e.currentTarget as HTMLSelectElement;
        this.updateLink(selectElement, true);
    };

    private updateLink(selectElement: HTMLSelectElement, store: boolean): void {
        const option = selectElement.selectedOptions[0];
        const url = decodeURI(option.getAttribute(Attribute.URL) || '');
        const name = option.getAttribute(Attribute.NAME);
        const fullName = decodeURIComponent(selectElement.getAttribute(Attribute.FULL_NAME) || '');
        const udid = selectElement.getAttribute(Attribute.UDID);
        const playerTds = document.getElementsByName(
            encodeURIComponent(`${DeviceTracker.AttributePrefixPlayerFor}${fullName}`),
        );
        if (typeof udid !== 'string') {
            return;
        }
        if (store) {
            const localStorageKey = DeviceTracker.getLocalStorageKey(fullName || '');
            if (localStorage && name) {
                localStorage.setItem(localStorageKey, name);
            }
        }
        const action = ACTION.STREAM_SCRCPY;
        playerTds.forEach((item) => {
            item.innerHTML = '';
            const playerFullName = item.getAttribute(DeviceTracker.AttributePlayerFullName);
            const playerCodeName = item.getAttribute(DeviceTracker.AttributePlayerCodeName);
            if (!playerFullName || !playerCodeName) {
                return;
            }
            const link = DeviceTracker.buildLink(
                {
                    action,
                    udid,
                    player: decodeURIComponent(playerCodeName),
                    ws: url,
                },
                decodeURIComponent(playerFullName),
                this.params,
            );
            item.appendChild(link);
        });
    }

    onActionButtonClick = (e: MouseEvent): void => {
        const button = e.currentTarget as HTMLButtonElement;
        const udid = button.getAttribute(Attribute.UDID);
        const extraData = button.getAttribute(Attribute.EXTRA);
        const pidString = button.getAttribute(Attribute.PID) || '';
        const command = button.getAttribute(Attribute.COMMAND) as string;
        const pid = parseInt(pidString, 10);

        let inputValue = null;
        if (command == ControlCenterCommand.SEND_DEO) {
            inputValue = (<HTMLInputElement>document.getElementById('deo-input')).value;
            if (extraData) inputValue = '/storage/emulated/0/Download/' + extraData + '/1_360.mp4';
        }
        if (command == ControlCenterCommand.CONNECT_DEO) {
            inputValue = (<HTMLInputElement>document.getElementById('deo-input-ip')).value;
        }
        console.log(command);
        if (command == 'start-stream') {
            inputValue = (<HTMLInputElement>document.getElementById('deo-input-ip')).value;

            StreamClientScrcpy.registerPlayer(TinyH264Player);

            const parsedQuery = {
                action: 'stream',
                udid: `${udid}`,
                player: 'tinyh264',
                ws: `ws://${inputValue}:8886/`,
            };
            // StreamClientScrcpy.onDisconnected();
            StreamClientScrcpy.start(parsedQuery);

            return;
        }

        const data: Message = {
            id: this.getNextId(),
            type: command,
            data: {
                udid: typeof udid === 'string' ? udid : undefined,
                pid: isNaN(pid) ? undefined : pid,
                inputValue: inputValue,
            },
        };

        if (this.hasConnection()) {
            (this.ws as WebSocket).send(JSON.stringify(data));
        }
    };

    private static getLocalStorageKey(udid: string): string {
        return `device_list::${udid}::interface`;
    }

    private static createInterfaceOption(params: ParamsDeviceTracker, name: string, udid = ''): HTMLOptionElement {
        const optionElement = document.createElement('option');
        const secure = !!params.secure;
        const hostname = params.hostname || location.hostname;
        const port = typeof params.port === 'number' ? params.port : secure ? 443 : 80;
        const urlObject = this.buildUrl({ ...params, secure, hostname, port });
        if (udid) {
            urlObject.searchParams.set('action', ACTION.PROXY_ADB);
            urlObject.searchParams.set('remote', `tcp:${SERVER_PORT.toString(10)}`);
            urlObject.searchParams.set('udid', udid);
        }
        const url = urlObject.toString();
        optionElement.setAttribute(Attribute.URL, url);
        optionElement.setAttribute(Attribute.NAME, name);
        optionElement.innerText = `proxy over adb`;
        return optionElement;
    }

    private static titleToClassName(title: string): string {
        return title.toLowerCase().replace(/\s/g, '_');
    }

    protected buildDeviceRow(tbody: Element, device: GoogDeviceDescriptor): void {
        const blockClass = 'desc-block';
        const fullName = `${this.id}_${Util.escapeUdid(device.udid)}`;
        const isActive = device.state === DeviceState.DEVICE;
        const localStorageKey = DeviceTracker.getLocalStorageKey(fullName);
        const lastSelected = localStorage && localStorage.getItem(localStorageKey);
        let hasPid = false;
        let selectInterface: HTMLSelectElement | undefined;
        const servicesId = `device_services_${fullName}`;
        const ip = device['interfaces'][0]['ipv4'];
        console.log(ip);
        const row = html`<div class="device ${isActive ? 'active' : 'not-active'}">
            <div class="device-header">
                <div class="device-name">${device['ro.product.manufacturer']} ${device['ro.product.model']}</div>
                <div class="device-serial">${device.udid}</div>
                <div class="device-version">
                    <div class="release-version">${device['ro.build.version.release']}</div>
                    <div class="sdk-version">${device['ro.build.version.sdk']}</div>
                </div>
                <div class="device-state" title="State: ${device.state}"></div>
            </div>
            <div id="${servicesId}" class="services"></div>
        </div>`.content;
        const services = row.getElementById(servicesId);
        if (!services) {
            return;
        }

        const shellEntry = ShellClient.createEntryForDeviceList(device, blockClass, this.params);

        const extraControls = html`<div class="flex flex-col md:flex-row">
			<div class="m-4">
				<label class="block text-gray-700 text-sm font-bold mb-2" for="deo-input">
					Movie File Name:
				</label>
				<input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value="Download/R0010024edit_360.MP4" id="deo-input"></input>
				<button data-command="${ControlCenterCommand.SEND_DEO}" class="mt-2 bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded" id="deo-play">Play</button>
			</div>
			<div class="m-4">
				<label class="block text-gray-700 text-sm font-bold mb-2" for="deo-input">
					Remote Oculus IP:
				</label>
				<input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value="${ip}" id="deo-input-ip"></input>
				<button data-command="${ControlCenterCommand.CONNECT_DEO}" class="mt-2 bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded" id="deo-connect">Connect</button>
			</div>
			<div class="mx-4 flex flex-col">
				<button class="mt-2 bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded" id="deo-run" data-command="${ControlCenterCommand.RUN_DEO}" data-udid="${device.udid}" data-pid="${device.pid}">Launch DeoVR</button>
				<button class="mt-2 bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded" id="screen-toggle" data-command="${ControlCenterCommand.SCREEN_TOGGLE}" data-udid="${device.udid}" data-pid="${device.pid}">Toggle screen</button>
				<button class="mt-2 bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded" id="menu" data-command="${ControlCenterCommand.MENU}" data-udid="${device.udid}" data-pid="${device.pid}">Menu</button>
				<button class="mt-2 bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded" id="stream" data-command="start-stream" data-udid="${device.udid}" data-pid="${device.pid}">Start Stream</button>
			</div>
			<div class="mx-4 flex flex-col">
				<button class="mt-2 bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded" id="play-cloudy" data-command="${ControlCenterCommand.SEND_DEO}" data-extra="play-cloudy" data-udid="${device.udid}" data-pid="${device.pid}">Play Cloudy</button>
				<button class="mt-2 bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded" id="play-sunny" data-command="${ControlCenterCommand.SEND_DEO}" data-extra="play-sunny" data-udid="${device.udid}" data-pid="${device.pid}">Play Sunny</button>
				<button class="mt-2 bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded" id="play-rainy" data-command="${ControlCenterCommand.SEND_DEO}" data-extra="play-rainy" data-udid="${device.udid}" data-pid="${device.pid}">Play Rainy</button>
				<button class="mt-2 bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded" id="play-snowy" data-command="${ControlCenterCommand.SEND_DEO}" data-extra="play-snowy" data-udid="${device.udid}" data-pid="${device.pid}">Play Snowy</button>
			</div>
		</div>`.content;

        const listId = [
            'deo-play',
            'deo-connect',
            'deo-run',
            'screen-toggle',
            'menu',
            'stream',
            'play-sunny',
            'play-rainy',
            'play-cloudy',
            'play-snowy',
        ];
        for (const item of listId) {
            const entry = extraControls.getElementById(item);
            if (entry) {
                entry.onclick = this.onActionButtonClick;
            }
        }

        shellEntry && services.appendChild(shellEntry);
        // const devtoolsEntry = DevtoolsClient.createEntryForDeviceList(device, blockClass, this.params);
        // devtoolsEntry && services.appendChild(devtoolsEntry);

        const streamEntry = StreamClientScrcpy.createEntryForDeviceList(device, blockClass, fullName, this.params);

        streamEntry && services.appendChild(streamEntry);

        DESC_COLUMNS.forEach((item) => {
            const { title } = item;
            const fieldName = item.field;
            let value: string;
            if (typeof item.field === 'string') {
                value = '' + device[item.field];
            } else {
                value = item.field(device);
            }
            const td = document.createElement('div');
            td.classList.add(DeviceTracker.titleToClassName(title), blockClass);
            services.appendChild(td);
            if (fieldName === 'pid') {
                hasPid = value !== '-1';
                const actionButton = document.createElement('button');
                actionButton.className = 'action-button kill-server-button';
                actionButton.setAttribute(Attribute.UDID, device.udid);
                actionButton.setAttribute(Attribute.PID, value);
                let command: string;
                if (isActive) {
                    actionButton.classList.add('active');
                    actionButton.onclick = this.onActionButtonClick;
                    if (hasPid) {
                        command = ControlCenterCommand.KILL_SERVER;
                        actionButton.title = 'Kill server';
                        actionButton.appendChild(SvgImage.create(SvgImage.Icon.CANCEL));
                    } else {
                        command = ControlCenterCommand.START_SERVER;
                        actionButton.title = 'Start server';
                        actionButton.appendChild(SvgImage.create(SvgImage.Icon.REFRESH));
                    }
                    actionButton.setAttribute(Attribute.COMMAND, command);
                } else {
                    const timestamp = device['last.seen.active.timestamp'];
                    if (timestamp) {
                        const date = new Date(timestamp);
                        actionButton.title = `Last seen on ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
                    } else {
                        actionButton.title = `Not active`;
                    }
                    actionButton.appendChild(SvgImage.create(SvgImage.Icon.OFFLINE));
                }
                const span = document.createElement('span');
                span.innerText = value;
                actionButton.appendChild(span);
                td.appendChild(actionButton);
            } else if (fieldName === 'interfaces') {
                const selectElement = document.createElement('select');
                selectElement.setAttribute(Attribute.UDID, device.udid);
                selectElement.setAttribute(Attribute.FULL_NAME, fullName);
                selectElement.setAttribute(
                    'name',
                    encodeURIComponent(`${DeviceTracker.AttributePrefixInterfaceSelectFor}${fullName}`),
                );
                device[fieldName].forEach((value) => {
                    const optionElement = DeviceTracker.createInterfaceOption(
                        {
                            ...this.params,
                            secure: false,
                            hostname: value.ipv4,
                            port: SERVER_PORT,
                        },
                        value.name,
                    );
                    optionElement.innerText = `${value.name}: ${value.ipv4}`;
                    selectElement.appendChild(optionElement);
                    if (lastSelected) {
                        if (lastSelected === value.name) {
                            optionElement.selected = true;
                        }
                    } else if (device['wifi.interface'] === value.name) {
                        optionElement.selected = true;
                    }
                });
                if (isActive) {
                    const adbProxyOption = DeviceTracker.createInterfaceOption(this.params, 'proxy', device.udid);
                    if (lastSelected === 'proxy') {
                        adbProxyOption.selected = true;
                    }
                    selectElement.appendChild(adbProxyOption);
                    const actionButton = document.createElement('button');
                    actionButton.className = 'action-button update-interfaces-button active';
                    actionButton.title = `Update information`;
                    actionButton.appendChild(SvgImage.create(SvgImage.Icon.REFRESH));
                    actionButton.setAttribute(Attribute.UDID, device.udid);
                    actionButton.setAttribute(Attribute.COMMAND, ControlCenterCommand.UPDATE_INTERFACES);
                    actionButton.onclick = this.onActionButtonClick;
                    td.appendChild(actionButton);
                }
                selectElement.onchange = this.onInterfaceSelected;
                td.appendChild(selectElement);
                selectInterface = selectElement;
            } else {
                td.innerText = value;
            }
        });

        if (DeviceTracker.CREATE_DIRECT_LINKS) {
            const name = `${DeviceTracker.AttributePrefixPlayerFor}${fullName}`;
            StreamClientScrcpy.getPlayers().forEach((playerClass) => {
                const { playerCodeName, playerFullName } = playerClass;
                const playerTd = document.createElement('div');
                playerTd.classList.add(blockClass);
                playerTd.setAttribute('name', encodeURIComponent(name));
                playerTd.setAttribute(DeviceTracker.AttributePlayerFullName, encodeURIComponent(playerFullName));
                playerTd.setAttribute(DeviceTracker.AttributePlayerCodeName, encodeURIComponent(playerCodeName));
                services.appendChild(playerTd);
            });
        }

        tbody.appendChild(row);
        tbody.appendChild(extraControls);
        if (DeviceTracker.CREATE_DIRECT_LINKS && hasPid && selectInterface) {
            this.updateLink(selectInterface, false);
        }
    }

    public destroy(): void {
        super.destroy();
        DeviceTracker.instancesByUrl.delete(this.url.toString());
        if (!DeviceTracker.instancesByUrl.size) {
            const holder = document.getElementById(BaseDeviceTracker.HOLDER_ELEMENT_ID);
            if (holder && holder.parentElement) {
                holder.parentElement.removeChild(holder);
            }
        }
    }
}
