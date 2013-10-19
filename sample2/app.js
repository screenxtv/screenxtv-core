//Remote Login Server
var fs=require('fs');
var net=require('net');
var http=require('http');
var express=require('express');
var socketio=require('socket.io');
var child_process=require('child_process');
var VT100=require('../lib/vt100/vt100');
var Shell=require('./shell');
var app=express();
var HTTP_PORT=8080
var TCP_PORT=8000

function assets(path){
  if(!assets[path])assets[path]=fs.readFileSync(path);
  return assets[path];
}

app.get('/terminal.js',function(req,res){
  res.end(assets('../lib/vt100/terminal.js'));
});
app.get('/vt100.js',function(req,res){
  res.end(assets('../lib/vt100/vt100.js'));
});
app.get('/list',function(req,res){
  res.end(JSON.stringify(Shell.list()));
})
app.use(express.static('./public'));

var server=http.createServer(app).listen(HTTP_PORT);
var io=socketio.listen(server);

io.sockets.on('connection',function(socket){
  console.log('connection!');
  function init(shell){
    Shell.join(socket);
  }
  var shell=null;
  socket.on('shell',function(id){
    if(shell)return;
    shell=Shell.get(id);
    shell.join(socket);
  })
  socket.on('disconnect',function(){
    if(shell)shell.leave(socket);
    shell=null;
  })
  socket.on('message',function(data){
    if(shell)shell.write(data);
  });
})

process.on('uncaughtException',function(err){
  console.log('Caught exception:',err.stack);
});
