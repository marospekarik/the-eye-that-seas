import Client from './adb/client';
import util from './adb/util';
interface Options {
    host?: string;
    port?: number;
    bin?: string;
}
declare class Adb {
    static Keycode: {
        KEYCODE_UNKNOWN: number;
        KEYCODE_SOFT_LEFT: number;
        KEYCODE_SOFT_RIGHT: number;
        KEYCODE_HOME: number;
        KEYCODE_BACK: number;
        KEYCODE_CALL: number;
        KEYCODE_ENDCALL: number;
        KEYCODE_0: number;
        KEYCODE_1: number;
        KEYCODE_2: number;
        KEYCODE_3: number;
        KEYCODE_4: number;
        KEYCODE_5: number;
        KEYCODE_6: number;
        KEYCODE_7: number;
        KEYCODE_8: number;
        KEYCODE_9: number;
        KEYCODE_STAR: number;
        KEYCODE_POUND: number;
        KEYCODE_DPAD_UP: number;
        KEYCODE_DPAD_DOWN: number;
        KEYCODE_DPAD_LEFT: number;
        KEYCODE_DPAD_RIGHT: number;
        KEYCODE_DPAD_CENTER: number;
        KEYCODE_VOLUME_UP: number;
        KEYCODE_VOLUME_DOWN: number;
        KEYCODE_POWER: number;
        KEYCODE_CAMERA: number;
        KEYCODE_CLEAR: number;
        KEYCODE_A: number;
        KEYCODE_B: number;
        KEYCODE_C: number;
        KEYCODE_D: number;
        KEYCODE_E: number;
        KEYCODE_F: number;
        KEYCODE_G: number;
        KEYCODE_H: number;
        KEYCODE_I: number;
        KEYCODE_J: number;
        KEYCODE_K: number;
        KEYCODE_L: number;
        KEYCODE_M: number;
        KEYCODE_N: number;
        KEYCODE_O: number;
        KEYCODE_P: number;
        KEYCODE_Q: number;
        KEYCODE_R: number;
        KEYCODE_S: number;
        KEYCODE_T: number;
        KEYCODE_U: number;
        KEYCODE_V: number;
        KEYCODE_W: number;
        KEYCODE_X: number;
        KEYCODE_Y: number;
        KEYCODE_Z: number;
        KEYCODE_COMMA: number;
        KEYCODE_PERIOD: number;
        KEYCODE_ALT_LEFT: number;
        KEYCODE_ALT_RIGHT: number;
        KEYCODE_SHIFT_LEFT: number;
        KEYCODE_SHIFT_RIGHT: number;
        KEYCODE_TAB: number;
        KEYCODE_SPACE: number;
        KEYCODE_SYM: number;
        KEYCODE_EXPLORER: number;
        KEYCODE_ENVELOPE: number;
        KEYCODE_ENTER: number;
        KEYCODE_DEL: number;
        KEYCODE_GRAVE: number;
        KEYCODE_MINUS: number;
        KEYCODE_EQUALS: number;
        KEYCODE_LEFT_BRACKET: number;
        KEYCODE_RIGHT_BRACKET: number;
        KEYCODE_BACKSLASH: number;
        KEYCODE_SEMICOLON: number;
        KEYCODE_APOSTROPHE: number;
        KEYCODE_SLASH: number;
        KEYCODE_AT: number;
        KEYCODE_NUM: number;
        KEYCODE_HEADSETHOOK: number;
        KEYCODE_FOCUS: number;
        KEYCODE_PLUS: number;
        KEYCODE_MENU: number;
        KEYCODE_NOTIFICATION: number;
        KEYCODE_SEARCH: number;
        KEYCODE_MEDIA_PLAY_PAUSE: number;
        KEYCODE_MEDIA_STOP: number;
        KEYCODE_MEDIA_NEXT: number;
        KEYCODE_MEDIA_PREVIOUS: number;
        KEYCODE_MEDIA_REWIND: number;
        KEYCODE_MEDIA_FAST_FORWARD: number;
        KEYCODE_MUTE: number;
        KEYCODE_PAGE_UP: number;
        KEYCODE_PAGE_DOWN: number;
        KEYCODE_PICTSYMBOLS: number;
        KEYCODE_SWITCH_CHARSET: number;
        KEYCODE_BUTTON_A: number;
        KEYCODE_BUTTON_B: number;
        KEYCODE_BUTTON_C: number;
        KEYCODE_BUTTON_X: number;
        KEYCODE_BUTTON_Y: number;
        KEYCODE_BUTTON_Z: number;
        KEYCODE_BUTTON_L1: number;
        KEYCODE_BUTTON_R1: number;
        KEYCODE_BUTTON_L2: number;
        KEYCODE_BUTTON_R2: number;
        KEYCODE_BUTTON_THUMBL: number;
        KEYCODE_BUTTON_THUMBR: number;
        KEYCODE_BUTTON_START: number;
        KEYCODE_BUTTON_SELECT: number;
        KEYCODE_BUTTON_MODE: number;
        KEYCODE_ESCAPE: number;
        KEYCODE_FORWARD_DEL: number;
        KEYCODE_CTRL_LEFT: number;
        KEYCODE_CTRL_RIGHT: number;
        KEYCODE_CAPS_LOCK: number;
        KEYCODE_SCROLL_LOCK: number;
        KEYCODE_META_LEFT: number;
        KEYCODE_META_RIGHT: number;
        KEYCODE_FUNCTION: number;
        KEYCODE_SYSRQ: number;
        KEYCODE_BREAK: number;
        KEYCODE_MOVE_HOME: number;
        KEYCODE_MOVE_END: number;
        KEYCODE_INSERT: number;
        KEYCODE_FORWARD: number;
        KEYCODE_MEDIA_PLAY: number;
        KEYCODE_MEDIA_PAUSE: number;
        KEYCODE_MEDIA_CLOSE: number;
        KEYCODE_MEDIA_EJECT: number;
        KEYCODE_MEDIA_RECORD: number;
        KEYCODE_F1: number;
        KEYCODE_F2: number;
        KEYCODE_F3: number;
        KEYCODE_F4: number;
        KEYCODE_F5: number;
        KEYCODE_F6: number;
        KEYCODE_F7: number;
        KEYCODE_F8: number;
        KEYCODE_F9: number;
        KEYCODE_F10: number;
        KEYCODE_F11: number;
        KEYCODE_F12: number;
        KEYCODE_NUM_LOCK: number;
        KEYCODE_NUMPAD_0: number;
        KEYCODE_NUMPAD_1: number;
        KEYCODE_NUMPAD_2: number;
        KEYCODE_NUMPAD_3: number;
        KEYCODE_NUMPAD_4: number;
        KEYCODE_NUMPAD_5: number;
        KEYCODE_NUMPAD_6: number;
        KEYCODE_NUMPAD_7: number;
        KEYCODE_NUMPAD_8: number;
        KEYCODE_NUMPAD_9: number;
        KEYCODE_NUMPAD_DIVIDE: number;
        KEYCODE_NUMPAD_MULTIPLY: number;
        KEYCODE_NUMPAD_SUBTRACT: number;
        KEYCODE_NUMPAD_ADD: number;
        KEYCODE_NUMPAD_DOT: number;
        KEYCODE_NUMPAD_COMMA: number;
        KEYCODE_NUMPAD_ENTER: number;
        KEYCODE_NUMPAD_EQUALS: number;
        KEYCODE_NUMPAD_LEFT_PAREN: number;
        KEYCODE_NUMPAD_RIGHT_PAREN: number;
        KEYCODE_VOLUME_MUTE: number;
        KEYCODE_INFO: number;
        KEYCODE_CHANNEL_UP: number;
        KEYCODE_CHANNEL_DOWN: number;
        KEYCODE_ZOOM_IN: number;
        KEYCODE_ZOOM_OUT: number;
        KEYCODE_TV: number;
        KEYCODE_WINDOW: number;
        KEYCODE_GUIDE: number;
        KEYCODE_DVR: number;
        KEYCODE_BOOKMARK: number;
        KEYCODE_CAPTIONS: number;
        KEYCODE_SETTINGS: number;
        KEYCODE_TV_POWER: number;
        KEYCODE_TV_INPUT: number;
        KEYCODE_STB_POWER: number;
        KEYCODE_STB_INPUT: number;
        KEYCODE_AVR_POWER: number;
        KEYCODE_AVR_INPUT: number;
        KEYCODE_PROG_RED: number;
        KEYCODE_PROG_GREEN: number;
        KEYCODE_PROG_YELLOW: number;
        KEYCODE_PROG_BLUE: number;
        KEYCODE_APP_SWITCH: number;
        KEYCODE_BUTTON_1: number;
        KEYCODE_BUTTON_2: number;
        KEYCODE_BUTTON_3: number;
        KEYCODE_BUTTON_4: number;
        KEYCODE_BUTTON_5: number;
        KEYCODE_BUTTON_6: number;
        KEYCODE_BUTTON_7: number;
        KEYCODE_BUTTON_8: number;
        KEYCODE_BUTTON_9: number;
        KEYCODE_BUTTON_10: number;
        KEYCODE_BUTTON_11: number;
        KEYCODE_BUTTON_12: number;
        KEYCODE_BUTTON_13: number;
        KEYCODE_BUTTON_14: number;
        KEYCODE_BUTTON_15: number;
        KEYCODE_BUTTON_16: number;
        KEYCODE_LANGUAGE_SWITCH: number;
        KEYCODE_MANNER_MODE: number;
        KEYCODE_3D_MODE: number;
        KEYCODE_CONTACTS: number;
        KEYCODE_CALENDAR: number;
        KEYCODE_MUSIC: number;
        KEYCODE_CALCULATOR: number;
        KEYCODE_ZENKAKU_HANKAKU: number;
        KEYCODE_EISU: number;
        KEYCODE_MUHENKAN: number;
        KEYCODE_HENKAN: number;
        KEYCODE_KATAKANA_HIRAGANA: number;
        KEYCODE_YEN: number;
        KEYCODE_RO: number;
        KEYCODE_KANA: number;
        KEYCODE_ASSIST: number;
        KEYCODE_BRIGHTNESS_DOWN: number;
        KEYCODE_BRIGHTNESS_UP: number;
        KEYCODE_MEDIA_AUDIO_TRACK: number;
        KEYCODE_SLEEP: number;
        KEYCODE_WAKEUP: number;
        KEYCODE_PAIRING: number;
        KEYCODE_MEDIA_TOP_MENU: number;
        KEYCODE_11: number;
        KEYCODE_12: number;
        KEYCODE_LAST_CHANNEL: number;
        KEYCODE_TV_DATA_SERVICE: number;
        KEYCODE_VOICE_ASSIST: number;
        KEYCODE_TV_RADIO_SERVICE: number;
        KEYCODE_TV_TELETEXT: number;
        KEYCODE_TV_NUMBER_ENTRY: number;
        KEYCODE_TV_TERRESTRIAL_ANALOG: number;
        KEYCODE_TV_TERRESTRIAL_DIGITAL: number;
        KEYCODE_TV_SATELLITE: number;
        KEYCODE_TV_SATELLITE_BS: number;
        KEYCODE_TV_SATELLITE_CS: number;
        KEYCODE_TV_SATELLITE_SERVICE: number;
        KEYCODE_TV_NETWORK: number;
        KEYCODE_TV_ANTENNA_CABLE: number;
        KEYCODE_TV_INPUT_HDMI_1: number;
        KEYCODE_TV_INPUT_HDMI_2: number;
        KEYCODE_TV_INPUT_HDMI_3: number;
        KEYCODE_TV_INPUT_HDMI_4: number;
        KEYCODE_TV_INPUT_COMPOSITE_1: number;
        KEYCODE_TV_INPUT_COMPOSITE_2: number;
        KEYCODE_TV_INPUT_COMPONENT_1: number;
        KEYCODE_TV_INPUT_COMPONENT_2: number;
        KEYCODE_TV_INPUT_VGA_1: number;
        KEYCODE_TV_AUDIO_DESCRIPTION: number;
        KEYCODE_TV_AUDIO_DESCRIPTION_MIX_UP: number;
        KEYCODE_TV_AUDIO_DESCRIPTION_MIX_DOWN: number;
        KEYCODE_TV_ZOOM_MODE: number;
        KEYCODE_TV_CONTENTS_MENU: number;
        KEYCODE_TV_MEDIA_CONTEXT_MENU: number;
        KEYCODE_TV_TIMER_PROGRAMMING: number;
        KEYCODE_HELP: number;
        KEYCODE_NAVIGATE_PREVIOUS: number;
        KEYCODE_NAVIGATE_NEXT: number;
        KEYCODE_NAVIGATE_IN: number;
        KEYCODE_NAVIGATE_OUT: number;
        KEYCODE_STEM_PRIMARY: number;
        KEYCODE_STEM_1: number;
        KEYCODE_STEM_2: number;
        KEYCODE_STEM_3: number;
        KEYCODE_DPAD_UP_LEFT: number;
        KEYCODE_DPAD_DOWN_LEFT: number;
        KEYCODE_DPAD_UP_RIGHT: number;
        KEYCODE_DPAD_DOWN_RIGHT: number;
        KEYCODE_MEDIA_SKIP_FORWARD: number;
        KEYCODE_MEDIA_SKIP_BACKWARD: number;
        KEYCODE_MEDIA_STEP_FORWARD: number;
        KEYCODE_MEDIA_STEP_BACKWARD: number;
        KEYCODE_SOFT_SLEEP: number;
        KEYCODE_CUT: number;
        KEYCODE_COPY: number;
        KEYCODE_PASTE: number;
        KEYCODE_SYSTEM_NAVIGATION_UP: number;
        KEYCODE_SYSTEM_NAVIGATION_DOWN: number;
        KEYCODE_SYSTEM_NAVIGATION_LEFT: number;
        KEYCODE_SYSTEM_NAVIGATION_RIGHT: number;
        KEYCODE_ALL_APPS: number;
        KEYCODE_REFRESH: number;
        KEYCODE_THUMBS_UP: number;
        KEYCODE_THUMBS_DOWN: number;
        KEYCODE_PROFILE_SWITCH: number;
    };
    static util: typeof util;
    static createClient(options?: Options): Client;
}
export = Adb;
