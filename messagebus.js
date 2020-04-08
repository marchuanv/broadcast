const component = require("component");
const utils = require("utils");
const http = require('http');

let subscriptions = [];
let lastIntervalId = 0;

const broadcast = ({ messageId, data } ) => {
    return new Promise(async(resolve, reject) => {
        utils.log("MessageBus","-----------------------------------------------------------");
        utils.log("MessageBus",`subscription count: ${subscriptions.length}`);
        utils.log("MessageBus",`sending data to ${messageId}`);
        const dataToSend = typeof data === "object" ? utils.getJSONString(data) : data;
        const subscription = subscriptions.find(x=>x.id === messageId);
        if (subscription){
            const request = http.request({ 
                host: subscription.host, 
                port: subscription.port, 
                path: subscription.path, 
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(dataToSend)
                }
            },(response)=>{
                response.setEncoding('utf8');
                let rawData="";
                response.on('data', (chunk) => {
                    rawData += chunk;
                });
                response.on('end', () => {
                    const responseData = utils.getJSONObject(rawData) || rawData;
                    resolve(responseData);
                });
            });
            request.on('error', (e) => {
                reject(e);
            });
            request.write(dataToSend);
            request.end();
        } else {
            reject(`no subscription found for ${messageId}`);
        }
    });
};
const start = async ( { port }) => {
    await component.startHttpServer(port, ({ path, headers, data }, reply) => {
        utils.log("MessageBus","-----------------------------------------------------------");
        utils.log("MessageBus",`subscription count: ${subscriptions.length}`);
        utils.log("MessageBus",`message received, headers: ${utils.getJSONString(headers)}`);
        const token = headers.token;
        const publickey = headers.publickey;
        let receivedData = utils.getJSONObject(data) || data;
        let subscription = subscriptions.find(x => x.path === path);
        if (subscription){
            subscription.token = token;
            subscription.publickey = publickey;
            utils.log("MessageBus",`responding to subscripber`);
            const dataToSend = subscription.callback(receivedData);
            if (dataToSend){
                reply({ contentType: subscription.contentType, statusCode: 200, data: dataToSend});
            } else {
                reply({ contentType: "text/plain", statusCode: 200, data: `subscriber did not respond with any data`});
            }
        } else {
            reply({ contentType: "text/plain", statusCode: 404, data: `no subscribers for ${headers.host}${path}`});
        }
        utils.log("MessageBus","-----------------------------------------------------------");
    });
};

const subscribe = ( { messageId, urlPath, destinationHost, destinationPort, contentType }, callback) => {
    utils.log("MessageBus",`subscribing to ${messageId} messages`);
    subscriptions = subscriptions.filter(x=>x.id !== messageId);
    subscriptions.push({ 
        id: messageId, 
        path: urlPath, 
        token: null, 
        publickey: null, 
        host: destinationHost, 
        port: destinationPort, 
        contentType,
        callback
    });
};

module.exports = { subscribe, start, broadcast };