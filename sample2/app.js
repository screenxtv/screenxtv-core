var fs=require('fs');
var net=require('net');
var http=require('http');
var express=require('express');
var socketio=require('socket.io');
var child_process=require('child_process');
var VT100=require('../lib/vt100/vt100');
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

Shell.shells={};
Shell.get=function(id){
  var key='#'+id;
  if(!Shell.shells[key])Shell.shells[key]=new Shell(key);
  return Shell.shells[key]
}
Shell.list=function(){
  var list=[];
  for(var id in Shell.shells){
    if(id[0]=='#')list.push(id.substr(1));
  }
  return list;
}
function Shell(key){
  this.sockets=[];
  this.process=child_process.spawn('ruby',['remote_login.rb']);
  this.vt100=new VT100(80,24);
  var partial='';
  this.process.stdout.on('data',function(data){
    var messages=(partial+data).split('\n');
    partial=messages.pop();
    for(var i=0;i<messages.length;i++){
      try{
        ondata(JSON.parse(messages[i]));
      }catch(e){console.log(e.stack)}
    }
  });
  var self=this;
  this.process.stdout.on('close',function(){
    self.broadcast('exit');
    self.process=null;
    delete Shell.shells[key];
  });
  function ondata(cmd){
    switch(cmd.type){
      case 'data':{
        for(var i=0;i<cmd.data.length;i++)self.vt100.write(cmd.data[i]);
        self.broadcast('data',cmd.data);
      }break;
      case 'winch':{
        self.vt100.resize(cmd.width,cmd.height);
        self.broadcast('winch',{width:cmd.width,height:cmd.height});
      }break;
    }
  }
}
Shell.prototype={
  broadcast:function(type,data){
    for(var i=0;i<this.sockets.length;i++){
      this.sockets[i].emit(type,data);
    }
  },
  join:function(socket){
    this.sockets.push(socket);
    socket.emit('init',this.vt100);
  },
  leave:function(socket){
    var index=this.sockets.indexOf(socket);
    if(index>=0)this.sockets.splice(index,1);
  },
  write:function(data){
    if(!this.process)return;
    this.process.stdin.write(JSON.stringify(data)+'\n');
  }
}

process.on('uncaughtException',function(err){
  console.log('Caught exception:',err.stack);
});

