const utils = require("utils");

const installModule = async (moduleName) => {
    const npm = require("npm");
    let isResolved = false;
    if (!moduleName){
        throw new Error("node module name was not provided");
    }
    try {
        utils.log("NPM",`attempting to resolve ${moduleName} node module`);
        require.resolve(moduleName);
        isResolved = true;
    } catch(err)  {
        utils.log("NPM",`unable to resolve ${moduleName}`, err);
        isResolved = false;
    }
    if (isResolved === false){
        utils.log("NPM","loading npm");
        npm.load((err, _npm) => {
            if (err){
                throw err;
            }
            _npm.audit("fix",(err)=>{
                if (err){
                    throw err;
                }
                utils.log("NPM","installing node module: ", moduleName);
                _npm.install(moduleName, (err)=>{
                    if (err){
                        throw err;
                    }
                });
            });
        });
    }
};
const startHttpServer = async (port, callback) => {
    const http = require('http');
    const httpServer = http.createServer();
    httpServer.on("request", (request, response)=>{
        let body = '';
        request.on('data', chunk => {
            body += chunk.toString(); // convert Buffer to string
        });
        request.on('end', async() => {
            utils.log("HttpServer", `http request received`);
            if (callback){
                await callback({ path: request.url, headers: request.headers, data: body }, ( {contentType, statusCode, data}) => {
                    response.setHeader('Access-Control-Allow-Origin', '*');
                    response.setHeader("Content-Type", contentType);
                    const responseData = new Buffer(data);
                    response.setHeader("Content-Length",  Buffer.byteLength(responseData));
                    response.writeHead(statusCode, { "Content-Type": contentType });
                    response.end(responseData);
                });
            } else {
                utils.log("HttpServer", `no callback provided`);
                response.setHeader('Access-Control-Allow-Origin', '*');
                response.setHeader("Content-Type", "plain/text");
                const responseData = new Buffer("no callback to handle request");
                response.setHeader("Content-Length",  Buffer.byteLength(responseData));
                response.writeHead(500, { "Content-Type": "text/plain" });
                response.end(responseData);
            }
            
        });
    });
    httpServer.listen(port);
    utils.log("HttpServer", `listening on port ${port}`);
};
module.exports = { installModule, startHttpServer };
