const messagebus = require("./messagebus.js");
(async()=>{
    await messagebus.start( { port: 3000 });
    await messagebus.subscribe( { messageId: "test", urlPath:"/test", host: "localhost", port: 3000, contentType: "text/html" });
    await messagebus.send({ messageId: "test", data: '<html><head></head><body>HTML TEST</body></html>' });
    const receivedMsg = await messagebus.receive({ messageId: "test"});
    console.log("Expected Message: ",receivedMsg);

})().catch((err)=>{
    console.log(err);
});