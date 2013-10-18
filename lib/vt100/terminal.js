function Terminal(element,w,h,color){
	var div=this.main=element
	div.innerHTML="";
	var pre=this.text=document.createElement("PRE");
	var cur=this.cursor=document.createElement("DIV");
	div.style.overflow="hidden";
	pre.style.userSelect=pre.style.WebkitUserSelect=pre.style.KhtmlUserSelect="text";
	pre.style.fontFamily="Osaka-Mono,MS-Gothic,MS-Mincho,SimSun,monospace";
	pre.style.lineHeight="1em";
	pre.style.display="block";
	pre.style.margin=pre.style.padding=0;
	pre.style.background="transparent";
	pre.style.border="none";
	cur.style.position="absolute";cur.style.opacity=cur.style.MozOpacity=0.5;
	var front=document.createElement("DIV");
	front.style.userSelect=front.style.WebkitUserSelect=front.style.KhtmlUserSelect="none";
	front.style.position="relative";front.style.left=front.style.top=front.style.width=front.style.height=0;
	front.appendChild(cur);
	div.appendChild(front);
	div.appendChild(pre);
	var obj=this;
	this.vt100=new VT100(w,h);
	this.vt100.onBell=function(){if(obj.onBell)obj.onBell();}
	this.W=w;this.H=h;
	this.calcSize();
	this.setColor(color?color:Terminal.defaultColorMap.white);
	window.term=this
}
Terminal.prototype.resize=function(w,h){
	this.W=w;this.H=h;
	this.vt100.resize(w,h);
	for(var i=0;i<h;i++)if(!this.vt100.line[i])this.vt100.line[i]=new VT100.Line(w);
	this.calcSize();
}
Terminal.prototype.write=function(c){this.vt100.write(c);}
Terminal.prototype.setColor=function(color){
	this.color=color;
	this.main.style.background=color.background;
	this.cursor.style.background=color.cursor;
	if(color.background)this.main.style.background=color.background;
	this.updateView();
}
Terminal.prototype.calcSize=function(){
	this.text.innerHTML="<div><span>_</span></div>";
	this.char_w=this.text.firstChild.firstChild.offsetWidth;
	this.char_h=this.text.firstChild.offsetHeight;
	this.cursor.style.width=this.char_w+"px";
	this.cursor.style.height=this.char_h+"px";
	this.main.style.width=this.char_w*this.W+"px";
	this.main.style.height=this.char_h*this.H+"px";
	this.text.innerHTML="";
};
Terminal.prototype.setSpanFont=function(span,font){
	var highlight=font&0x10000;
	var underline=font&0x20000;
	var flipcolor=font&0x40000;
	var hidefgcol=font&0x80000;
	var defaultfg=font&0x200000;
	var defaultbg=font&0x100000;
	if(underline)span.style.textDecoration="underline";
	var table=highlight?this.color.highlight:this.color.normal;
	var fg=defaultfg?null:table[(font&0xff00)>>8];
	var bg=defaultbg?null:table[font&0x00ff];
	if(flipcolor){
		span.style.color=hidefgcol?'transparent':bg||this.color.background;
		span.style.background=fg||(highlight?this.color.emphasis:this.color.foreground);
	}else{
		span.style.color=hidefgcol?'transparent':fg?fg:highlight?this.color.emphasis:this.color.foreground;
		span.style.background=bg?bg:null;
	}
};
Terminal.prototype.createHalfChar=function(s){
	var span=document.createElement("span");
	span.textContent=s;
	span.style.width=this.char_w+"px";
	span.style.display="inline-block";
	return span;
}
Terminal.prototype.updateView=function(){
	this.text.innerHTML="";
	for(var i=0;i<this.vt100.H;i++){
		var s="";
		var div=document.createElement("nobr");
		div.style.display="block";
		div.style.whiteSpace='pre'
		div.style.height=this.char_h+"px";
		var fontprev=-1;
		var specialhalfprev=-1;
		var line=this.vt100.line[i];
		if(!line)line=new VT100.Line();
		for(var j=0;j<line.length;j++){
			var font=line.fonts[j];if(fontprev<0)fontprev=font;
			var c=line.chars[j];
			var cc=c.charCodeAt(0);
			var specialhalf=(cc>=0x80&&cc<0x2E80);
			if(font==fontprev&&specialhalf==specialhalfprev){
				s+=c;
			}else{
				if(s){
					var span=document.createElement("span");
					if(specialhalfprev){
						for(var k=0;k<s.length;k++)span.appendChild(this.createHalfChar(s.charAt(k)));
					}else span.textContent=s;
					this.setSpanFont(span,fontprev);
					div.appendChild(span);
				}
				s=c;
				fontprev=font;
				specialhalfprev=specialhalf;
			}
		}
		var span=document.createElement("span");
		if(specialhalfprev){
			for(var k=0;k<s.length;k++)span.appendChild(this.createHalfChar(s.charAt(k)));
		}else span.textContent=s;
		this.setSpanFont(span,fontprev);
		div.appendChild(span);
		div.appendChild(document.createElement("BR"));
		this.text.appendChild(div);
	}
	this.cursor.style.left=this.char_w*this.vt100.cursorX+"px";
	this.cursor.style.top=this.char_h*this.vt100.cursorY+"px";
};
Terminal.defaultColorMap={
	white:{
		normal:["#000","#F00","#0F0","#AA0","#00F","#F0F","#0AA","#BBB"],
		highlight:["#666","#F60","#0F6","#AF0","#60F","#F0A","#06A","#BBB"],
		foreground:"black",background:"white",emphasis:"#600",cursor:"#00F"
	},
	black:{
		normal:["#FFF","#F66","#4F4","#FF0","#88F","#F0F","#0FF","#444"],
		highlight:["#AAA","#F00","#6F6","#AA0","#66F","#F6F","#6FF","#444"],
		foreground:"white",background:"black",emphasis:"#FAA",cursor:"#CCF"
	},
	novel:{
		normal:["#000000","#990000","#00A600","#999900","#0000B3","#B300B3","#00A6B3","#BFBFBF"],
		highlight:["#000000","#990000","#00A600","#999900","#0000B3","#B300B3","#00A6B3","#BFBFBF"],
		foreground:"#532D2C",background:"#DFDBC3",emphasis:"#A1320B",cursor:"#000000"
	},
	green:{
		normal:["#000000","#990000","#00A600","#999900","#0000B3","#B300B3","#00A6B3","#BFBFBF"],
		highlight:["#000000","#990000","#00A600","#999900","#0000B3","#B300B3","#00A6B3","#BFBFBF"],
		foreground:"#BFFFBF",background:"#001F00",emphasis:"#7FFF7F",cursor:"#FFFFFF"
	},//kore!
};
(function(){
	function toHex(n){s="0123456789ABCDEF";return s[n>>4]+s[n&0xf]}
	var color=[
		"#000000","#990000","#00A600","#999900","#0000B3","#B300B3","#00A6B3","#BfBfBf",
		"#666666","#E60000","#00D900","#E6E600","#0000FF","#E600E6","#00E6E6","#E6E6E6"
	];
	for(var r=0;r<6;r++)for(var g=0;g<6;g++)for(var b=0;b<6;b++){
		color[16+r*36+g*6+b]="#"+toHex(51*r)+toHex(51*g)+toHex(51*b);
	}
	for(var i=0;i<24;i++){
		var c=toHex(8+10*i);
		color[232+i]="#"+c+c+c;
	}
	for(var key in Terminal.defaultColorMap){
		cmap=Terminal.defaultColorMap[key];
		for(var i=cmap.normal.length;i<color.length;i++)cmap.normal[i]=color[i];
		for(var i=cmap.highlight.length;i<color.length;i++)cmap.highlight[i]=color[i];
	}
})()
