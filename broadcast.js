const messagebus = require("messagebus");
const utils = require("utils");

const sourcePrivatePort = Number(process.env.PORT || 5000);
const sourcePublicHost = process.env.PUB_HOST || "localhost";
const sourcePublicPort = Number(process.env.PUB_PORT || sourcePrivatePort);

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

messagebus.subscribe( { sourcePublicHost, sourcePublicPort, sourcePrivatePort, path: broadcastPath, contentType }).callback = async({ path, contentType, content }, requesthost, requestport ) => {
    logging.write("Broadcast",`publishing message from ${path} on behalf of ${requesthost}:${requestport} to all subscribers.`);
    const matchingServices = services.filter(s => s.path === path && s.host !== requesthost && s.port !== requestport );
    if (matchingServices.length === 0){
        logging.write("Broadcast",`no ${path} subscribers.`);
        return;
    }
    for (const service of matchingServices){
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

messagebus.subscribe( { sourcePublicHost, sourcePublicPort, sourcePrivatePort, path: registerPath, contentType }).callback = async({ host, port, path }) => {
    if (host && port && path){
        const url = `${host}:${port}${path}`;
        services =  services.filter(s => s.host !== host && s.port !== port && s.path !== path);
        logging.write("Broadcast Register",`${url} was registered`);
        services.push({ host, port, path });
    } else {
        logging.write("Broadcast Register",`failed to register remote publisher, invalid url: ${host}:${port}${path}`);
    }
};