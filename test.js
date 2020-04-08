const messagebus = require("./messagebus.js");
(async()=>{
    // await messagebus.start( { port: 3000 });
    // messagebus.subscribe( { messageId: "test", urlPath:"/test", destinationHost: "localhost", destinationPort: 3000, contentType: "text/html" },(receivedMsg)=>{
    //     console.log("Expected Message: ",receivedMsg);
    // });
    // await messagebus.broadcast({ messageId: "test", data: '<html><head></head><body>HTML TEST</body></html>' });
})().catch((err)=>{
    console.log(err);
});