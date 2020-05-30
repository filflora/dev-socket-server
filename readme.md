



# Dev-server
This is a SockJs WebSocket server where the messages can be controlled through POST requests. For full experience the dev-server Chrome extension is recommended.


## Standalone usage
For standalone usage (without the use of the Chrome DevTools extension) you can send a POST message to the `/send-message` endpoint with some `data`. That exact same data will be sent to all active connections.

NOTE: The server must be running when the client tries to connect. Otherwise no active connection could be established.


## Usage with the Dev-socket Chrome extension
This dev-socket server was built to work with the Chrome extension. The extension makes the message sending process easier with presets.