const messagebus = require("messagebus");
const utils = require("utils");

messagebus.start( {port: process.env.PORT || 3000});
const subscription = messagebus.subscribe( { path: "/broadcast", contentType: "application/json" });
subscription.onreceive = async (broadcastMessage) => {
    utils.log("Broadcast","------------------------------------< BROADCAST RECEIVED START >----------------------------------------\r\n");
    const broadSub = messagebus.subscribe( { path: broadcastMessage.path, contentType: broadcastMessage.contentType });
    broadSub.onreceive = () => {};
    for (const subscriber of broadcastMessage.subscribers){
        utils.log("Broadcast",`broadcasting message to ${subscriber.host}:${subscriber.port}${broadcastMessage.path}`);
        await messagebus.publish({ path: broadcastMessage.path, host: subscriber.host, port: subscriber.port, data: broadcastMessage.data });
    };
    utils.log("Broadcast","--------------------------------------------------------------------------------------------------------\r\n");
};