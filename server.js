var express = require('express');
var app =express();
var server = app.listen(8085,function()
{
    var host = server.address().host
    var port = server.address().port
    console.log("server listening in "+port)
})
app.get("/checkuser/:name/:age",function(req,res)
{
 var name = req.params.name
 var age = req.params.age
 var out;
 if(age > 18)
   out="Hi "+name+" , you are eligible to vote"
 else
   out = "Hi "+name+", Sorry - please wait to reach 18"
   res.end(JSON.stringify(out));
})

