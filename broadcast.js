const messagebus = require("messagebus");
const utils = require("utils");
messagebus.subscribe( { host: "localhost", port: 3000, path: "/broadcast", contentType: "application/json" }).callback = async({ username, passphrase, path, contentType, content, subscribers }) => {
    utils.log("Broadcast","------------------------------------< BROADCAST RECEIVED START >----------------------------------------\r\n");
    for (const subscriber of subscribers){
        utils.log("Broadcast",`broadcasting message to ${subscriber.host}:${subscriber.port}${path}`);
        await messagebus.publish({ host: subscriber.host, port: subscriber.port, path, username, passphrase, contentType, content });
    };
    utils.log("Broadcast","------------------------------------< BROADCAST RECEIVED END >----------------------------------------\r\n");
};