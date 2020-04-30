const messagebus = require("messagebus");
const utils = require("utils");

const privatePort =  process.env.PORT || 5000;
const publicHost = process.env.PUB_HOST || "localhost";
const publicPort = process.env.PUB_PORT || privatePort;

const broadcastPath = "/broadcast";
const registerPath = "/register";
const contentType = "application/json";
const username = process.env.USERNAME || "anonymous";
const passphrase = process.env.PASSPHRASE || "secure1";
let services = [];

const logging = require("logging");
logging.config([
    "Broadcast",
    "MessageBus Publisher",
    "MessageBus Subscriber",
    "Component Client",
    "Component Server",
    "Component Secure Client",
    "Component Secure Server"
]);

messagebus.subscribe( { publicHost, publicPort, privatePort, path: broadcastPath, contentType }).callback = async({ path, contentType, content }) => {
    for (const service of services.filter(s => s.path === path)){
        const url = `${service.host}:${service.port}${service.path}`;
        logging.write("Broadcast",`publishing message to ${url}`);
        await messagebus.publish({ 
            publicHost: service.host, 
            publicPort: service.port, 
            path: service.path, 
            username, 
            passphrase, 
            contentType, 
            content
        });
    };
};

messagebus.subscribe( { publicHost, publicPort, privatePort, path: registerPath, contentType }).callback = async({ host, port, path }) => {
    if (!host || !port || !path){
        utils.error("Broadcast Register", "failed to register request, host, port and path is not in the message.");
    }
    services =  services.filter(s => s.host !== host && s.port !== port && s.path !== path);
    const url = `${host}:${port}${path}`;
    logging.write("Broadcast Register",`adding ${url} to the list of known services`);
    services.push({ host, port, path });
};