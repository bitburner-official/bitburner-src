// To avoid cyclic dependencies, this file should have as few imports as possible.

import type { ContentFilePath } from "../Paths/ContentFile";
import { EventEmitter } from "../utils/EventEmitter";
import type { OpenScript } from "./ui/OpenScript";

export const openScripts: OpenScript[] = [];

export const EditorEvents = new EventEmitter<[hostname: string, filePath: ContentFilePath]>();
