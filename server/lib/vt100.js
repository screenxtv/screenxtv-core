function VT100(){
	if(arguments.length==1){
		var copy=arguments[0];
		for(i in copy)this[i]=copy[i];
		return;
	}
	this.W=arguments[0];
	this.H=arguments[1];
	this.reset();
}
VT100.prototype.reset=function(){
	this.line=[];
	for(var i=0;i<this.H;i++)this.line[i]=new VT100.Line();
	this.font=this.fontDefault=0x300000;
	this.scrollStart=0;this.scrollEnd=this.H-1;
	this.cursorX=0;this.cursorY=0;
	this.insertMode=false;
	this.escMode=0;
	this.escChar='';
}
VT100.prototype.getSubData=function(w,h){
	var lines=[];
	var emptyline=new VT100.Line();
	for(var y=0;y<h;y++){
		var lobj=this.line[y]||emptyline;
		var line={length:Math.min(w,lobj.length),chars:[],fonts:[]};
		lines[y]=line;
		for(var x=0;x<line.length;x++){
			line.chars[x]=lobj.chars[x];
			line.fonts[x]=lobj.fonts[x];
		}
	}
	return {W:w,H:h,line:lines};
}
VT100.prototype.getData=function(){}

VT100.Line=function(){
	this.length=0;
	this.chars=[];
	this.fonts=[];
};
VT100.prototype.resize=function(w,h){
	while(this.line.length>this.H)this.line.pop();
	this.W=w;
	this.H=h;
	while(this.line.length<this.H){
		this.scrollEnd++;
		this.line.push(new VT100.Line());
	}
	while(this.line.length>this.H){
		this.line.shift();
		this.scrollStart--;
		this.scrollEnd--;
		this.cursorY--;
	}
	for(var i=0;i<h;i++){
		var ln=this.line[i];
		if(!ln)this.line[i]=new VT100.Line();
		else if(ln.length>this.W)ln.length=this.W;
	}
	if(this.scrollStart<0)this.scrollStart=0;
	if(this.scrollEnd<1)this.scrollEnd=1;
	if(this.cursorY<0)this.cursorY=0;
	if(this.cursorY>=this.H)this.cursorY=this.H-1;
}
VT100.prototype.write=function(c){
	try{
		switch(this.escMode){
			case 0:
				if(c=='\x1b')this.escMode=1;
				else if(c=='\x7f'||c<'\x20')this.parseSpecial(c.charCodeAt(0));
				else{this.put(c);if(c.charCodeAt(0)>=0x2e80)this.put('');}
				return;
			case 1:
				if(c=='[')this.escMode=2;
				else if(c=='(')this.escMode=3;
				else if(c==')')this.escMode=4;
				else{this.parseEscape(c);this.escMode=0;}
				return;
			case 2:
				if(('A'<=c&&c<='Z')||('a'<=c&&c<='z')||c=='@'){
					this.parseEscapeK(c);
					this.escMode=0;
					this.escChar='';
				}
				else this.escChar+=c;
				return;
			case 3:this.parseEscapeL(c);this.escMode=0;return;
			case 4:this.parseEscapeR(c);this.escMode=0;return;
		}
	}catch(e){
		console.log(e)
		for(var i=0;i<this.H;i++)if(!this.line[i])this.line[i]=new VT100.Line();
	}
}
VT100.prototype.parseSpecial=function(c){
	switch(c){
		case 0x09:this.moveCursor(Math.floor(this.cursorX/8+1)*8,this.cursorY);return;
		case 0x08:this.moveCursor(this.cursorX-1,this.cursorY);return;
		case 0x0a:this.scrollCursor(this.cursorX,this.cursorY+1);return;
		case 0x0d:this.moveCursor(0,this.cursorY);return;
		case 0x07:if(this.onBell)this.onBell();return;
	}
}
var escmap={};
function esclog(c,n){if(!escmap[c])console.log("escape log: "+c);escmap[c]=true;}
VT100.prototype.parseEscapeL=function(c){/**/esclog("^("+c);/**/}
VT100.prototype.parseEscapeR=function(c){/**/esclog("^)"+c);/**/}
VT100.prototype.parseEscape=function(c){
	/**/esclog("^"+c);/**/
	//H78g [s] [u] [03g]
	switch(c){
		case 'D':this.scrollCursor(this.cursorX,this.cursorY+1);break;
		case 'E':this.scrollCursor(0,this.cursorY+1);break;
		case 'M':{
			if(this.cursorY==this.scrollStart){
				this.scrollCursor(this.cursorX,this.cursorY-1);
				for(var y=this.scrollEnd;y>this.cursorY;y--){
					this.line[y]=this.line[y-1];
				}
				this.line[this.cursorY]=new VT100.Line();
			}else{
				this.cursorY=this.cursorY==0?0:this.cursorY-1;
			}
			return;
		}
		case 'c':this.reset();break;
	}
}
VT100.prototype.parseEscapeK=function(cmd){
	/**/esclog("^["+cmd);/**/
	switch(cmd){
		case '@':{
			var n=this.escChar?parseInt(this.escChar):1;
			this.insertCount=n;
			return;
		}
		case 'A':{
			var n=this.escChar?parseInt(this.escChar):1;
			this.scrollCursor(this.cursorX,this.cursorY-n);
			return;
		}
		case 'B':{
			var n=this.escChar?parseInt(this.escChar):1;
			this.scrollCursor(this.cursorX,this.cursorY+n);
			return;
		}
		case 'C':{
			var n=this.escChar?parseInt(this.escChar):1;
			this.moveCursor(this.cursorX+n,this.cursorY);
			return;
		}
		case 'D':{
			var n=this.escChar?parseInt(this.escChar):1;
			this.moveCursor(this.cursorX-n,this.cursorY);
			return;
		}
		case 'E':{
			var n=this.escChar?parseInt(this.escChar):1;
			this.moveCursor(0,this.cursorY+n);
			return;
		}
		case 'F':{
			var n=this.escChar?parseInt(this.escChar):1;
			this.moveCursor(0,this.cursorY-n);
			return;
		}
		case 'G':{
			var n=this.escChar?parseInt(this.escChar):1;
			this.moveCursor(n-1,this.cursorY);
			return;
		}
		case 'H':case 'f':{
			if(this.escChar){
				var yx=this.escChar.split(";");
				this.moveCursor(parseInt(yx[1]||1)-1,parseInt(yx[0]||1)-1);
				return;
			}else this.moveCursor(0,0);
			return;
		}
		case 'I':{
			var n=this.escChar?parseInt(this.escChar):1;
			this.moveCursor(Math.floor(this.cursorX/8+n)*8,this.cursorY);return;
			return;
		}
		case 'J':{
			if(this.escChar=='1'){
				for(var i=0;i<this.cursorY;i++)this.line[i].length=0;
				for(var i=0;i<=this.cursorX;i++){
					this.line[this.cursorY].chars[i]=' ';
					this.line[this.cursorY].fonts[i]=this.fontDefault;
				}
			}else if(this.escChar=='2'){
				for(var i=0;i<this.H;i++)this.line[i].length=0;
			}else{
				for(var i=this.cursorY+1;i<this.H;i++)this.line[i].length=0;
				this.line[this.cursorY].length=this.cursorX;
			}
			return;
		}
		case 'K':{
			var ln=this.line[this.cursorY];
			if(this.escChar=='1'){
				for(var i=0;i<=this.cursorX;i++){
					ln.chars[i]=' ';
					ln.fonts[i]=this.fontDefault;
				}
			}else if(this.escChar=='2'){
				for(var i=0;i<=this.cursorX;i++){
					ln.chars[i]=' ';
					ln.fonts[i]=this.fontDefault;
				}
				ln.length=this.cursorX;
			}else{
				ln.length=this.cursorX;
			}
			return;
		}
		case 'L':{
			var n=this.escChar?parseInt(this.escChar):1;
			var linetmp=[];
			if(this.cursorY<this.scrollStart||this.cursorY>this.scrollEnd)return;
			for(var i=this.scrollEnd;i>=this.cursorY;i--)linetmp[i]=this.line[i];
			for(var i=this.scrollEnd;i>=this.cursorY;i--){
				if(i-n<this.cursorY){
					this.line[i]=new VT100.Line();
				}else this.line[i]=linetmp[i-n];
			}
			return;
		}
		case 'M':{
			var n=this.escChar?parseInt(this.escChar):1;
			if(this.cursorY<this.scrollStart||this.scrollEnd<this.cursorY)return;
			if(this.cursorY+n>this.scrollEnd){
				for(var y=this.cursorY;y<=this.scrollEnd;y++){
					this.line[y].length=0;
				}
				var ln=this.line[this.cursorY];
				while(ln.length<this.cursorX){
					ln.chars[ln.length]=' ';
					ln.fonts[ln.length]=this.fontDefault;
					ln.length++;
				}
			}else{
				for(var y=this.cursorY;y<=this.scrollEnd;y++){
					this.line[y]=y+n<=this.scrollEnd?this.line[y+n]:new VT100.Line();
				}
			}
			return;
		}
		case 'P':{
			var ln=this.line[this.cursorY];
			var n=this.escChar?parseInt(this.escChar):1;
			if(this.cursorX>=ln.length)return;
			if(this.cursorX+n>ln.length)n=ln.length-this.cursorX;
			for(var i=this.cursorX;i<ln.length-n;i++){
				ln.chars[i]=ln.chars[i+n];
				ln.fonts[i]=ln.fonts[i+n];
			}
			ln.length-=n;
			return;
		}
		case 'S':{
			var n=this.escChar?parseInt(this.escChar):1;
			for(var i=this.scrollStart;i<=this.scrollEnd;i++){
				if(i+n<=this.scrollEnd)this.line[i]=this.line[i+n];
				else this.line[i]=new VT100.Line();
			}
			return;
		}
		case 'T':{
			var n=this.escChar?parseInt(this.escChar):1;
			for(var i=this.scrollEnd;i>=this.scrollStart;i--){
				if(i-n>=this.scrollStart)this.line[i]=this.line[i-n];
				else this.line[i]=new VT100.Line();
			}
			return;
		}
		case 'X':{
			var n=this.escChar?parseInt(this.escChar):1;
			var ln=this.line[this.cursorY];
			for(var i=this.cursorX;i<this.cursorX+n&&i<ln.length;i++){
				ln.chars[i]=' ';
				ln.fonts[i]=this.fontDefault;
			}
			return;
		}
		case 'Z':{
			var n=this.escChar?parseInt(this.escChar):1;
			this.moveCursor(Math.ceil(this.cursorX/8-n)*8,this.cursorY);return;
			return;
		}
		case 'd':{
			var n=this.escChar?parseInt(this.escChar):1;
			this.moveCursor(this.cursorX,n-1)
			return;
		}
		case 'h':case 'l':{
			var flag=(cmd=='h');
			switch(this.escChar){
				case '4':this.insertMode=flag;return;
			}
			return;
		}
		case 'm':{//console.log('^['+this.escChar+'m');
			if(!this.escChar){this.font=this.fontDefault;return;}
			var params=this.escChar.split(";");
			for(var i=0;i<params.length;i++){
				if(params[i]==0){this.font=this.fontDefault;continue;}
				var val=params[i]%10;
				var key=(params[i]-val)/10;
				switch(key){
					case 0:{
						if(val==1)this.font|=0x10000;
						else if(val==2||val==4)this.font|=0x20000;
						else if(val==3||val==7)this.font|=0x40000;
						else if(val==8)this.font|=0x80000;
					}break;
					case 2:{
						if(val==2||val==4)this.font&=~0x20000;
						else if(val==3||val==7)this.font&=~0x40000;
						else if(val==8)this.font&=~0x80000;
					}break;
					case 3:{
						if(val<8)this.font=(this.font&0x1f00ff)|(val<<8);
						else if(val==8){
							var type=params[++i],color=params[++i]&0xff;
							if(type==5)this.font=(this.font&0x1f00ff)|(color<<8);
						}else if(val==9)this.font=(this.font&0x1f00ff)|0x200000;
					}break;
					case 4:{
						if(val<8)this.font=(this.font&0x2fff00)|val;
						else if(val==8){
							var type=params[++i],color=params[++i]&0xff;
							if(type==5)this.font=(this.font&0x2fff00)|color;
						}else if(val==9)this.font=(this.font&0x2fff00)|0x100000;
					}break;
					case 9:{
					    this.font=(this.font&0x1f00ff)|((8+val)<<8);
					}break;
					case 10:{
						this.font=(this.font&0x2fff00)|(8+val);
					}break;
				}
			}
			return;
		}
		case 'r':{
			var se=this.escChar.split(";");
			var s=parseInt(se[0]||1)-1;
			var e=parseInt(se[1]||this.H)-1;
			if(s<e&&s<this.H&&e<this.H){
				this.scrollStart=s;
				this.scrollEnd=e;
				this.cursorX=this.cursorY=0;
			}
			return;
		}
	}
}
VT100.prototype.put=function(c){
	if(this.cursorX>=this.W)this.scrollCursor(0,this.cursorY+1);
	var ln=this.line[this.cursorY];
	if(!ln)return;
	while(ln.length<this.cursorX){
		ln.chars[ln.length]=' ';
		ln.fonts[ln.length]=this.fontDefault;
		ln.length++;
	}
	if(this.insertMode||this.insertCount){
		if(this.insertCount)this.insertCount--;
		for(var i=ln.length;i>this.cursorX;i--){
			ln.chars[i]=ln.chars[i-1];
			ln.fonts[i]=ln.fonts[i-1];
		}
		ln.chars[this.cursorX]=c;
		ln.fonts[this.cursorX]=this.font;
		ln.length++;
		this.cursorX++;
		if(this.W<ln.length)ln.length=this.W;
	}else{
		ln.chars[this.cursorX]=c;
		ln.fonts[this.cursorX]=this.font;
		if(this.cursorX==ln.length)ln.length++;
		this.cursorX++;
	}
}
VT100.prototype.moveCursor=function(x,y){
	if(y<0)y=0;if(y>=this.H)y=this.H-1;
	if(x<0)x=0;if(x>=this.W)x=this.W-1;
	this.cursorX=x;
	this.cursorY=y;
}
VT100.prototype.scrollCursor=function(x,y){
	if(x<0)x=0;if(x>=this.W)x=this.W-1;
	if(this.scrollEnd<this.cursorY&&y<this.scrollStart)y=this.scrollStart;
	if(this.cursorY<this.scrollStart&&this.scrollEnd<y)y=this.scrollEnd;
	if(this.cursorY<this.scrollStart||this.cursorY>this.scrollEnd){
		this.moveCursor(x,y);return;
	}
	if(y<this.scrollStart){
		y=this.scrollStart;
	}else if(y>this.scrollEnd){
		var n=y-this.scrollEnd;
		if(n>this.scrollEnd-this.scrollStart){
			this.cursorX=x;
			this.cursorY=this.scrollEnd;
			return;
		}
		var linetmp=[];
		for(var i=this.scrollStart;i<=this.scrollEnd;i++)linetmp[i]=this.line[i];
		for(var i=this.scrollStart;i<=this.scrollEnd;i++){
			if(i+n>this.scrollEnd)this.line[i]=new VT100.Line();
			else this.line[i]=linetmp[i+n];
		}
		y=this.scrollEnd;
	}
	this.cursorX=x;
	this.cursorY=y;
}


try{module.exports=VT100;}catch(e){}

