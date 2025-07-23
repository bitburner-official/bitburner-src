# Remote API

Bitburner can connect to a WebSocket server, and then that server can read and write Bitburner data via some APIs. The most common usage of this feature is to synchronize files between Bitburner and an external system. With a Remote API tool, you can write your scripts in any text editor and synchronize your scripts with Bitburner.

You only need to do 2 things:

- Start the Remote API tool.
- In Bitburner, Options -> Remote API. Set "hostname" and "port", then press "Connect".

## Community tools

All these tools support synchronizing scripts to Bitburner and transpiling TypeScript/JSX to JavaScript. Note that Bitburner has native support for TypeScript/JSX.

Links:

- https://github.com/bitburner-official/typescript-template
- https://github.com/Tanimodori/viteburner
- https://github.com/shyguy1412/bb-external-editor

`typescript-template` has a small set of options and features. Its simplicity is by design. `viteburner` and `bb-external-editor` have more fancy features.

## Troubleshooting tips

- Try to update the tool and restart it. Check error messages printed in the terminal to see what went wrong.
- When you turn off your machine or put it in sleep mode, the connection between Bitburner and the tool is closed. You have to connect again.
- Some external programs or browser extensions may interfere with the connection. For example, some antivirus programs and ad-blocker extensions may block the WebSocket connection.
- Some tools support a feature that is usually called "mirroring". You must read the instructions carefully before using it. This feature allows 2-way sync, but it may overwrite your scripts or other files _on your machine_ if you set it up wrong.
- If you need further help, please ask us on the [external-editors](https://discord.com/channels/415207508303544321/923428435618058311) channel.

## How it works

![remote-file-api-sequence-diagram.svg](../../../images/remote-file-api-sequence-diagram.svg)

## API specification

All APIs use an input/output format similar to the JSON RPC 2.0 protocol.

Input:

        {
            "jsonrpc": "2.0",
            "id": number,
            "method": string,
            "params": any
        }

Output:

        {
            "jsonrpc": "2.0",
            "id": number,
            "result": any,
            "error": any
        }

### pushFile

Create or update a file.

Input:

        {
            "jsonrpc": "2.0",
            "id": number,
            "method": "pushFile",
            "params": {
                "filename": string,
                "content": string,
                "server": string
            }
        }

Output:

        {
            "jsonrpc": "2.0",
            "id": number,
            "result": "OK"
        }

### getFile

Read a file and its content.

Input:

        {
            "jsonrpc": "2.0",
            "id": number,
            "method": "getFile",
            "params": {
                "filename": string,
                "server": string
            }
        }

Output:

        {
            "jsonrpc": "2.0",
            "id": number,
            "result": string
        }

### getFileMetadata

Read metadata of a file.

Input:

        {
            "jsonrpc": "2.0",
            "id": number,
            "method": "getFileMetadata",
            "params": {
                "filename": string,
                "server": string
            }
        }

Output:

        {
            "jsonrpc": "2.0",
            "id": number,
            "result": {
                "filename": string,
                "atime": string,
                "btime": string,
                "mtime": string
            }
        }

### deleteFile

Delete a file.

Input:

        {
            "jsonrpc": "2.0",
            "id": number,
            "method": "deleteFile",
            "params": {
                "filename": string,
                "server": string
            }
        }

Output:

        {
            "jsonrpc": "2.0",
            "id": number,
            "result": "OK"
        }

### getFileNames

List all file names on a server.

Input:

        {
            "jsonrpc": "2.0",
            "id": number,
            "method": "getFileNames",
            "params": {
                "server": string
            }
        }

Output:

        {
            "jsonrpc": "2.0",
            "id": number,
            "result": string[]
        }

### getAllFiles

Get the content of all files on a server.

Input:

        {
            "jsonrpc": "2.0",
            "id": number,
            "method": "getAllFiles",
            "params": {
                "server": string
            }
        }

Output:

        {
            "jsonrpc": "2.0",
            "id": number,
            "result": {
                "filename": string,
                "content": string
            }[]
        }

### getAllFileMetadata

Input:

Get the content of all files on a server.

        {
            "jsonrpc": "2.0",
            "id": number,
            "method": "getAllFileMetadata",
            "params": {
                "server": string
            }
        }

Output:

        {
            "jsonrpc": "2.0",
            "id": number,
            "result": {
                "filename": string,
                "atime": string
                "btime": string,
                "mtime": string,
            }[]
        }

### calculateRam

Calculate the in-game ram cost of a script.

Input:

        {
            "jsonrpc": "2.0",
            "id": number,
            "method": "calculateRam",
            "params": {
                "filename": string,
                "server": string
            }
        }

Output:

        {
            "jsonrpc": "2.0",
            "id": number,
            "result": number
        }

### getDefinitionFile

Get the definition file of NS APIs.

Input:

        {
            "jsonrpc": "2.0",
            "id": number,
            "method": "getDefinitionFile"
        }

Output:

        {
            "jsonrpc": "2.0",
            "id": number,
            "result": string
        }

### getSaveFile

Get save data.

Input:

        {
            "jsonrpc": "2.0",
            "id": number,
            "method": "getSaveFile"
        }

Output:

        {
            "jsonrpc": "2.0",
            "id": number,
            "result": {
                "identifier": string,
                "binary": boolean,
                "save": string
            }
        }

### getAllServers

Get all servers.

Input:

        {
            "jsonrpc": "2.0",
            "id": number,
            "method": "getAllServers"
        }

Output:

        {
            "jsonrpc": "2.0",
            "id": number,
            "result": {
                "hostname": string,
                "hasAdminRights": boolean,
                "purchasedByPlayer": boolean
            }[]
        }
