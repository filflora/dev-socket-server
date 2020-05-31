#!/usr/bin/env node

const DEFAULTS = {
    PORT: 3100
};
const yargs = require("yargs");
const options = yargs
    .usage(`Usage: [-p <PORT:${DEFAULTS.PORT}>]`)
    .option('p', { alias: 'port', describe: `Port number to use for the Web socket server. Defaults to ${DEFAULTS.PORT}.`, type: "number", demandOption: false })
    .argv;

const express = require('express');
const sockjs = require('sockjs');
const cors = require('cors');
const chalk = require('chalk');
const figlet = require('figlet');
const bodyParser = require('body-parser');
var Table = require('cli-table');

const PORT = options.port || DEFAULTS.PORT;




let connection;
const sockjsEndpoint = sockjs.createServer();
sockjsEndpoint.on('connection', (conn) => {
    connection = conn;
    console.log('Connection established');
});


const app = express.createServer();


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

sockjsEndpoint.installHandlers(app, { prefix: '/websocketendpoint' });

app.get('/health', (req, res) => res.json({
    status: 'up'
}));

app.post('/send-message', (req, res) => {

    console.log('Try to send message: ', req.body);
    if (!connection) {
        const message = 'Could not send message because there is no active connection.';
        console.log(message);

        return res
            .status(500)
            .json({ error: { message } });

    }

    try {
        console.log('Try to send message: ', req.body);
        connection.write(req.body);
        console.log('Message sent!');
    } catch (e) {
        const message = 'Could not send message through WebSocket.'
        console.error(message, e);
        return res
            .status(500)
            .json({ error: { message } });
    }

    return res.json({
        status: 200
    });

});

app.get('/', (req, res) => res.send('Hello dev-socket server!'));





// Write message to the console

console.log(chalk.blue(figlet.textSync('DevSocket server', { horizontalLayout: 'full' })));


const colWidths = [10, 20, 40];
const paramTable = new Table({
    head: ['Param', 'Shorthand', 'Description'],
    colWidths
});
paramTable.push(
    ['--port', '-p', `Port setting for the server.\nDefault value is: ${DEFAULTS.PORT}`]
);

console.log(paramTable.toString());



const endpointTable = new Table({
    head: ['Method', 'Endpoint', 'Description'],
    colWidths
});
endpointTable.push(
    ['GET', '/websocketendpoint', 'Set this url as the SockJs URL'],
    ['GET', '/health', 'Ping this to check if server is up.'],
    ['POST', '/send-message', 'Sends data through WebSocket'],
    ['GET', '/', 'Serves the ./public/index.html']
);
console.log(endpointTable.toString());


app
    .listen(PORT, null, null, () => {
        console.log(chalk.green(`Server listening on http://localhost:${PORT}`));
    })
    .on('error', (err) => {
        console.error(chalk.red(`Error creating server on http://localhost:${PORT}.`));
        console.error(chalk.red(err.toString()));
    });
