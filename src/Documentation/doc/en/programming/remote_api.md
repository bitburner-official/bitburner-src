# Remote API

All versions of Bitburner can use websockets to connect to a server.
That server can then perform a number of actions.
Most commonly this is used in conjunction with an external text editor or API
in order to make writing scripts easier, or even use typescript.

To make use of this Remote API through the official server, look [here](https://github.com/bitburner-official/typescript-template).
If you want to make your own server, see below for API details.

This API uses the JSON RPC 2.0 protocol. Inputs are in the following form:

        {
            "jsonrpc": "2.0",
            "id": number,
            "method": string,
            "params": any
        }

Outputs:

        {
            "jsonrpc": "2.0",
            "id": number,
            "result": any,
            "error": any
        }

## Methods

## `pushFile`

Create or update a file.

        {
            "jsonrpc": "2.0",
            "id": number,
            "method": "pushFile",
            "params": {
                filename: string;
                content: string;
                server: string;
            }
        }


        {
            "jsonrpc": "2.0",
            "id": number,
            "result": "OK"
        }

## `getFile`

Read a file and its content.

        {
            "jsonrpc": "2.0",
            "id": number,
            "method": "getFile",
            "params": {
                filename: string;
                server: string;
            }
        }


        {
            "jsonrpc": "2.0",
            "id": number,
            "result": string
        }

## `deleteFile`

Delete a file.

        {
            "jsonrpc": "2.0",
            "id": number,
            "method": "deleteFile",
            "params": {
                filename: string;
                server: string;
            }
        }


        {
            "jsonrpc": "2.0",
            "id": number,
            "result": "OK"
        }

## `getFileNames`

List all file names on a server.

        {
            "jsonrpc": "2.0",
            "id": number,
            "method": "getFileNames",
            "params": {
                server: string;
            }
        }


        {
            "jsonrpc": "2.0",
            "id": number,
            "result": string[]
        }

## `getAllFiles`

Get the content of all files on a server.

        {
            "jsonrpc": "2.0",
            "id": number,
            "method": "getAllFiles",
            "params": {
                server: string;
            }
        }


        {
            "jsonrpc": "2.0",
            "id": number,
            "result": {
                filename: string,
                content: string
            }[]
        }

## `calculateRam`

Calculate the in-game ram cost of a script.

        {
            "jsonrpc": "2.0",
            "id": number,
            "method": "calculateRam",
            "params": {
                filename: string;
                server: string;
            }
        }


        {
            "jsonrpc": "2.0",
            "id": number,
            "result": number
        }

## `getDefinitionFile`

Get the definition file of the API.

        {
            "jsonrpc": "2.0",
            "id": number,
            "method": "getDefinitionFile"
        }


        {
            "jsonrpc": "2.0",
            "id": number,
            "result": string
        }
