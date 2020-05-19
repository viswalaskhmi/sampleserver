var express = require('express');
var file = require('fs');
var app =express();
var bodyparser = require('body-parser')
app.use(bodyparser.json())
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
app.get("/voterslist",function(req,res)
{
  const voterslist= file.readFileSync('voterslist.json')
  console.log(JSON.parse(voterslist));
  res.end(voterslist)

})
app.post("/addnew",function(req,res)
{
  console.log(req.body)
  const newvoter = JSON.stringify(req.body)
  file.appendFileSync('voterslist.json',newvoter)
  res.end("Voter id added successfully")
}
)

