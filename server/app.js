var net=require('net');
var http=require('http');
var express=require('express');
var socketio=require('socket.io');
var VT100=require('./lib/vt100');
var app=express();
var HTTP_PORT=8080
var TCP_PORT=8000

app.get('/terminal.js',function(req,res){
  res.sendfile('./lib/terminal.js');
});
app.get('/vt100.js',function(req,res){
  res.sendfile('./lib/vt100.js');
});
app.use(express.static('./public'));

var server=http.createServer(app).listen(HTTP_PORT);
var io=socketio.listen(server);


var sourceSocket=null;
var vt100=null;

io.sockets.on('connection',function(socket){
  console.log('connection!');
  if(vt100)socket.emit('init',vt100);
  socket.on('message',function(data){
    sourceSocket.write(JSON.stringify(data)+'\n');
  });
})


net.createServer(function(socket){
  sourceSocket=socket;
  var partial='';
  vt100=new VT100(80,40);
  io.sockets.emit('init',vt100);
  socket.on('data',function(data){
    var messages=(partial+data).split('\n');
    partial=messages.pop();
    for(var i=0;i<messages.length;i++){
      try{
        ondata(JSON.parse(messages[i]));
      }catch(e){}
    }
  });
  socket.on('close',function(){
    io.sockets.emit('exit');
  });

  function ondata(cmd){
    switch(cmd.type){
      case 'data':{
        for(var i=0;i<cmd.data.length;i++)vt100.write(cmd.data[i]);
          io.sockets.emit('data',cmd.data);
      }break;
      case 'winch':{
        vt100.resize(cmd.width,cmd.height);
        io.sockets.emit('winch',{width:cmd.width,height:cmd.height});
      }break;
    }
  }
}).listen(TCP_PORT);
