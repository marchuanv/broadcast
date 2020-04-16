const messagebus = require("messagebus");
const utils = require("utils");
messagebus.subscribe( { host: "localhost", port: 3000, path: "/broadcast", contentType: "application/json" }).callback = async({ path, contentType, data, subscribers }) => {
    utils.log("Broadcast","------------------------------------< BROADCAST RECEIVED START >----------------------------------------\r\n");
    messagebus.subscribe( { path, contentType }).callback = () => {
        utils.log("Broadcast",`server will not handle messages for ${broadSub.path}, refer to the messagebus that handles these messages`);
    };
    for (const subscriber of subscribers){
        utils.log("Broadcast",`broadcasting message to ${subscriber.host}:${subscriber.port}${path}`);
        await messagebus.publish({ path, host: subscriber.host, port: subscriber.port, data });
    };
    utils.log("Broadcast","--------------------------------------------------------------------------------------------------------\r\n");
};