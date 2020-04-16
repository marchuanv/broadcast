const messagebus = require("messagebus");
const utils = require("utils");
const host = process.env.HOST || "localhost";
const port = process.env.PORT || 3000;
const path = "/broadcast";
const contentType = "application/json";
messagebus.subscribe( { host, port, path, contentType }).callback = async({ username, passphrase, path, contentType, content, subscribers }) => {
    utils.log("Broadcast","------------------------------------< BROADCAST RECEIVED START >----------------------------------------\r\n");
    for (const subscriber of subscribers){
        utils.log("Broadcast",`broadcasting message to ${subscriber.host}:${subscriber.port}${path}`);
        await messagebus.publish({ host: subscriber.host, port: subscriber.port, path, username, passphrase, contentType, content });
    };
    utils.log("Broadcast","------------------------------------< BROADCAST RECEIVED END >----------------------------------------\r\n");
};