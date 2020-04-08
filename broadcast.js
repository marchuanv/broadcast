const messagebus = require("messagebus");
messagebus.start( {port: process.env.PORT || 3000});
const subscription = messagebus.subscribe( { messageId: "broadcast", urlPath: "/broadcast", contentType: "application/json" });
subscription.onreceive = async (broadcastInfo) => {
    const broadSub = messagebus.subscribe( { messageId: broadcastInfo.channel, urlPath: `/${broadcastInfo.channel}`, contentType: broadcastInfo.contentType });
    broadSub.onreceive = () => {};
    for (const address of broadcastInfo.remoteAddresses){
        await messagebus.publish({ messageId: broadcastInfo.channel, host: address.host, port: address.port, data: broadcastInfo.data });
    };
};