var VT100=require('../lib/vt100/vt100');
var pty=require('pty.js');

Shell.shells={};
Shell.get=function(id){
  var key='#'+id;
  if(!Shell.shells[key])Shell.shells[key]=new Shell(key);
  return Shell.shells[key];
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
  this.process=pty.spawn('bash',[],{cols:80,rows:24});
  this.vt100=new VT100(80,24);
  var partial='';
  var self=this;
  this.process.on('data',function(data){
    for(var i=0;i<data.length;i++)self.vt100.write(data[i]);
    self.broadcast('data',data);
  });
  this.process.on('close',function(){
    self.broadcast('exit');
    self.process=null;
    delete Shell.shells[key];
  });
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
  write:function(cmd){
    if(!this.process)return;
    if(cmd.type=='winch'){
      this.vt100.resize(cmd.width,cmd.height);
      this.process.resize(cmd.width,cmd.height);
      this.broadcast('winch',{width:cmd.width,height:cmd.height});
    }
    else if(cmd.type=='data')this.process.write(cmd.data);
  }
}

module.exports=Shell;
