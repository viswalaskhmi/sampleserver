var express = require('express');
var mongodb = require('mongodb');
var BSON =  mongodb.BSONPure;
var MongoClient = mongodb.MongoClient;
var url = 'mongodb://localhost';
var str = "";
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
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:8100"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.get("/checkuser/:name/:age",function(req,res)
{
 var name = req.params.name
 var age = req.params.age
 var out;
 if(age > 18)
   out="Hi "+name+" , you are eligible to vote"
 else
   out = "Hi "+name+", Sorry - please wait to reach 18"
   //res.end(JSON.stringify(out));
   res.end(out);
   
   
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
  
})

app.get("/users/:name",function(req, res)
{
  var str = "";
  var username = req.params.name;
  console.log("Inside users request ");
  console.log("Request body "+req.body);
  //name="Bala";
  console.log("User data expectd for "+username);
  MongoClient.connect
  (
    url, { useUnifiedTopology: true }, (err, client) =>
    {
      console.log("Connected successfully to server");
      //const db = client.db(dbName);
      var db = client.db('egatepass');
      var data = [];
      var cursor = db.collection('users').find({name:username}).toArray(
        function(err, doc) 
        {
          console.log(doc);
          data = doc;
          if (doc != null){
            str = doc;
            }
          
          client.close();
          res.end(JSON.stringify(str));
          if(data.length!=0)
          console.log("user name: "+data[0].name+", Password:"+console.log(data[0].password+", Role::"+data[0].role));
          }
        
      )
    }
  )
  })

  app.get("/pendingapprovals/:tutor/",function(req,res)
  {
  console.log("Tutor -page -pending approvals");

  var str = "";
  var tutorname = req.params.tutor;
  console.log("User data expectd for "+tutorname);
  MongoClient.connect
  (
    url, { useUnifiedTopology: true }, (err, client) =>
    {
      console.log("Connected successfully to server");
      //const db = client.db(dbName);
      var db = client.db('egatepass');
      var data = [];
      var cursor = db.collection('tutors').find({name:tutorname}).toArray(
        function(err, doc) 
        {
          console.log(doc);
          var id;
          
          if (doc != null)
          {
            data = doc;
            str = doc;
            //if(data.length!=0)
            {
              console.log("tutor name: "+data[0].name);
              id = data[0]._id;
              console.log("Object Id  for the tutor record "+id);
            }
          
        
        console.log("Before making the next req");
      
        cursor = db.collection('gatepassrequests').find({_id:id}).toArray(function(err,doc)
        {
          console.log(doc);
          if(doc!=null)
          { 
              console.log("Gatepass requests succeeded")
              data = doc;
              if(data.length>0)
              {console.log("Requester "+data[0].requester);}
              
          }
        else
        {
          console.log("Second  query :: data is null");
        }
        })
      }

          client.close();
          res.end(JSON.stringify(str));
          }
        
      )
    }
  )      
  })
app.post("/mymsg/:from/:message/:ts",function(req,res)
{
  console.log("MY MSG received");
  console.log(req.params.from,req.params.message,req.params.ts);
  res.end("Response from local trigger url");
})

app.post("/submitrequest",function(req,res)
{
  var tutorname;
  const newSubmitRequest = req.body;

  MongoClient.connect(url, (error, database) => {
    if (error) return process.exit(1);
    console.log('Connection is okay');
  
    const db = database.db('egatepass');

    
  
    getTutorForStudent(db,req.body.requester,(tutorname)=>
    {
      console.log("Finding tutor for student is succesful");
      console.log("tutor name returned from the sub function  "+tutorname);
      newSubmitRequest.request_approver =tutorname;
      console.log("New submit question "+newSubmitRequest);
      
    });
    
    insertDocuments(db,newSubmitRequest, () => {
      console.log('Insert successful');
    })
  });

  async const getTutorForStudent = (db,requester,callback) =>
  {
    const collection  = db.collection('students');
    var tutorStrId = undefined;
    var tutorObjId = undefined;

    var tutorName = undefined;
    collection.find({"name":requester}).toArray(
      function(err, doc) 
      {
        console.log(doc);
        if(doc!==null && doc.length>0)
        {
          
          //tutorStrId = JSON.parse(JSON.stringify(doc[0].tutor));
          //console.log("Tutor object id "+tutorStrId);
          //tutorObjId =new mongodb.ObjectID(tutorStrId);
          //console.log("Tutor object id ----->"+tutorObjId);
          //tutorObjId = BSON.ObjectID.createFromHexString(tutorStrId);
          console.log("Tutor name----->"+doc[0].tutor);
          tutorName = doc[0].tutor;
          callback(tutorName);
        }
      });
      
      /*const collection2 = db.collection('tutors');
      collection2.find({name:tutorName}).toArray(function(err,doc)
      {
        console.log(doc);
      })*/
  }
  
  const insertDocuments = (db,request,callback) => {
    const collection = db.collection('gatepassrequests');
   console.log("INSIDE INSERTION");
   console.log(request);
   //body.request_approver ="HELLO";
   //console.log("------------------------------");
   //console.log(req.body);
   //console.log("------------------------------");
   collection.insert(
       request,
      (error, result) => {
        if (error) return process.exit(1);
        callback(result);
      }
    );
  };


})

app.post("/requestpass",function(req,res)
{
  
})