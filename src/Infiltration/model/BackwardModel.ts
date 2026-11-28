import type { InfiltrationStage, KeyboardLikeEvent } from "../InfiltrationStage";
import type { Infiltration } from "../Infiltration";
import { KEY } from "../../utils/KeyboardEventKey";
import { interpolate } from "./Difficulty";
import { randomInRange } from "../../utils/helpers/randomInRange";

interface Settings {
  timer: number;
  min: number;
  max: number;
}

const difficultySettings = {
  Trivial: { timer: 16000, min: 3, max: 4 },
  Normal: { timer: 12500, min: 2, max: 3 },
  Hard: { timer: 15000, min: 3, max: 4 },
  Brutal: { timer: 8000, min: 4, max: 4 },
};

function ignorableKeyboardEvent(event: KeyboardLikeEvent): boolean {
  return event.key === KEY.BACKSPACE || (event.shiftKey && event.key === "Shift") || event.ctrlKey || event.altKey;
}

function makeAnswer(settings: Settings): string {
  const length = randomInRange(settings.min, settings.max);
  let answer = "";
  for (let i = 0; i < length; i++) {
    if (i > 0) answer += " ";
    answer += words[Math.floor(Math.random() * words.length)];
  }

  return answer;
}

export class BackwardModel implements InfiltrationStage {
  state: Infiltration;
  settings: Settings;
  guess = "";
  answer: string;

  onKey(event: KeyboardLikeEvent): void {
    event.preventDefault?.();
    if (ignorableKeyboardEvent(event)) return;
    this.guess += event.key.toUpperCase();
    if (this.answer === this.guess) {
      return this.state.onSuccess();
    }
    if (!this.answer.startsWith(this.guess)) {
      return this.state.onFailure();
    }
    this.state.updateEvent.emit();
  }

  constructor(state: Infiltration) {
    this.state = state;
    this.settings = interpolate(difficultySettings, state.difficulty());
    state.setStageTime(this, this.settings.timer);
    this.answer = makeAnswer(this.settings);
  }
}

const words = [
  "ALGORITHM",
  "ANALOG",
  "APP",
  "APPLICATION",
  "ARRAY",
  "BACKUP",
  "BANDWIDTH",
  "BINARY",
  "BIT",
  "BITE",
  "BITMAP",
  "BLOG",
  "BLOGGER",
  "BOOKMARK",
  "BOOT",
  "BROADBAND",
  "BROWSER",
  "BUFFER",
  "BUG",
  "BUS",
  "BYTE",
  "CACHE",
  "CAPS LOCK",
  "CAPTCHA",
  "CD",
  "CD-ROM",
  "CLIENT",
  "CLIPBOARD",
  "CLOUD",
  "COMPUTING",
  "COMMAND",
  "COMPILE",
  "COMPRESS",
  "COMPUTER",
  "CONFIGURE",
  "COOKIE",
  "COPY",
  "CPU",
  "CYBERCRIME",
  "CYBERSPACE",
  "DASHBOARD",
  "DATA",
  "MINING",
  "DATABASE",
  "DEBUG",
  "DECOMPRESS",
  "DELETE",
  "DESKTOP",
  "DEVELOPMENT",
  "DIGITAL",
  "DISK",
  "DNS",
  "DOCUMENT",
  "DOMAIN",
  "DOMAIN NAME",
  "DOT",
  "DOT MATRIX",
  "DOWNLOAD",
  "DRAG",
  "DVD",
  "DYNAMIC",
  "EMAIL",
  "EMOTICON",
  "ENCRYPT",
  "ENCRYPTION",
  "ENTER",
  "EXABYTE",
  "FAQ",
  "FILE",
  "FINDER",
  "FIREWALL",
  "FIRMWARE",
  "FLAMING",
  "FLASH",
  "FLASH DRIVE",
  "FLOPPY DISK",
  "FLOWCHART",
  "FOLDER",
  "FONT",
  "FORMAT",
  "FRAME",
  "FREEWARE",
  "GIGABYTE",
  "GRAPHICS",
  "HACK",
  "HACKER",
  "HARDWARE",
  "HOME PAGE",
  "HOST",
  "HTML",
  "HYPERLINK",
  "HYPERTEXT",
  "ICON",
  "INBOX",
  "INTEGER",
  "INTERFACE",
  "INTERNET",
  "IP ADDRESS",
  "ITERATION",
  "JAVA",
  "JOYSTICK",
  "JUNKMAIL",
  "KERNEL",
  "KEY",
  "KEYBOARD",
  "KEYWORD",
  "LAPTOP",
  "LASER PRINTER",
  "LINK",
  "LINUX",
  "LOG OUT",
  "LOGIC",
  "LOGIN",
  "LURKING",
  "MACINTOSH",
  "MACRO",
  "MAINFRAME",
  "MALWARE",
  "MEDIA",
  "MEMORY",
  "MIRROR",
  "MODEM",
  "MONITOR",
  "MOTHERBOARD",
  "MOUSE",
  "MULTIMEDIA",
  "NET",
  "NETWORK",
  "NODE",
  "NOTEBOOK",
  "COMPUTER",
  "OFFLINE",
  "ONLINE",
  "OPENSOURCE",
  "OPERATING",
  "SYSTEM",
  "OPTION",
  "OUTPUT",
  "PAGE",
  "PASSWORD",
  "PASTE",
  "PATH",
  "PHISHING",
  "PIRACY",
  "PIRATE",
  "PLATFORM",
  "PLUGIN",
  "PODCAST",
  "POPUP",
  "PORTAL",
  "PRINT",
  "PRINTER",
  "PRIVACY",
  "PROCESS",
  "PROGRAM",
  "PROGRAMMER",
  "PROTOCOL",
  "QUEUE",
  "QWERTY",
  "RAM",
  "REALTIME",
  "REBOOT",
  "RESOLUTION",
  "RESTORE",
  "ROM",
  "ROOT",
  "ROUTER",
  "RUNTIME",
  "SAVE",
  "SCAN",
  "SCANNER",
  "SCREEN",
  "SCREENSHOT",
  "SCRIPT",
  "SCROLL",
  "SCROLL",
  "SEARCH",
  "ENGINE",
  "SECURITY",
  "SERVER",
  "SHAREWARE",
  "SHELL",
  "SHIFT",
  "SHIFT KEY",
  "SNAPSHOT",
  "SOCIAL NETWORKING",
  "SOFTWARE",
  "SPAM",
  "SPAMMER",
  "SPREADSHEET",
  "SPYWARE",
  "STATUS",
  "STORAGE",
  "SUPERCOMPUTER",
  "SURF",
  "SYNTAX",
  "TABLE",
  "TAG",
  "TERMINAL",
  "TEMPLATE",
  "TERABYTE",
  "TEXT EDITOR",
  "THREAD",
  "TOOLBAR",
  "TRASH",
  "TROJAN HORSE",
  "TYPEFACE",
  "UNDO",
  "UNIX",
  "UPLOAD",
  "URL",
  "USER",
  "USER INTERFACE",
  "USERNAME",
  "UTILITY",
  "VERSION",
  "VIRTUAL",
  "VIRTUAL MEMORY",
  "VIRUS",
  "WEB",
  "WEBMASTER",
  "WEBSITE",
  "WIDGET",
  "WIKI",
  "WINDOW",
  "WINDOWS",
  "WIRELESS",
  "PROCESSOR",
  "WORKSTATION",
  "WEB",
  "WORM",
  "WWW",
  "XML",
  "ZIP",
];
