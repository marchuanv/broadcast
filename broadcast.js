const messagebus = require("messagebus");
const utils = require("utils");
const host = process.env.HOST || "localhost";
const port = process.env.PORT || 5000;
const broadcastPath = "/broadcast";
const registerPath = "/register";
const contentType = "application/json";
const username = process.env.USERNAME || "anonymous";
const passphrase = process.env.PASSPHRASE || "secure1";
let services = [];

messagebus.subscribe( { host, port, path: broadcastPath, contentType }).callback = async({ path, contentType, content }) => {
    utils.log("Broadcast","------------------------------------< BROADCAST START >----------------------------------------\r\n");
    for (const service of services.filter(s => s.path === path)){
        const url = `${service.host}:${service.port}${service.path}`;
        utils.log("Broadcast",`publishing message to ${url}`);
        await messagebus.publish({ 
            host: service.host, 
            port: service.port, 
            path: service.path, 
            username, 
            passphrase, 
            contentType, 
            content
        });
    };
    utils.log("Broadcast","------------------------------------< BROADCAST END >----------------------------------------\r\n");
    return `all remote services that subscribe to ${path} have been notified.`;
};

messagebus.subscribe( { host, port, path: registerPath, contentType }).callback = async({ host, port, path }) => {
    utils.log("Broadcast Register","------------------------------------< BROADCAST REGISTER START >----------------------------------------\r\n");
    if (!host || !port || !path){
        const message = "failed to register request, host, port and path is not in the message.";
        utils.log("Broadcast", message);
        throw new Error(message);
    }
    services =  services.filter(s => s.host !== host && s.port !== port && s.path !== path);
    const url = `${host}:${port}${path}`;
    utils.log("Broadcast Register",`adding ${url} to the list of known services`);
    services.push({ host, port, path });
    utils.log("Broadcast Register","------------------------------------< BROADCAST REGISTER END >----------------------------------------\r\n");
    return `${host}:${port}${path} registered`;
};