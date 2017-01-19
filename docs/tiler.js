!function(){"use strict";if(!window.Tiler){var a=function(a,b){var c={};for(var d in a)c[d]=a[d];if(!b)return c;for(d in b)c[d]=b[d];return c},b=function(a,c){return c?b(c,a%c):a},c=function(a,b){for(var c in b)a.style[c]=b[c]};window.Tiler=function(d,e){var f,g=this,h=0,i={},j=0,k=0,l=0,m=null,n=0,o={zoom:!1,constrain:!1,root:document.body,displayDelay:25,autoStart:!0,scale:1,interval:1e3,events:{click:function(a){},flip:function(a,b){}}};if(d=a(o,d),this.interval=d.interval,this.timeout=null,this.events=d.events,this.data=d.data,this.hovered=-1,f=d.root?d.root instanceof HTMLElement?d.root:document.querySelector(d.root):document.body,!f)throw Error("Invalid Tiler root ["+d.root+"]");if(!this.data||0==this.data.length)throw Error("No data for Tiler ["+d.root+"]");for(this.root=f,d.zoom&&this.root.classList.add("zoom"),this.root.addEventListener("mouseleave",function(a){g.hovered=-1}),this.root.innerHTML="",i=window.getComputedStyle(f),j=parseInt(i.width),k=parseInt(i.height),l=b(j,k)/d.scale,this.numberOfTiles=j*k/l/l,this.tilesPerRow=1,this.tilesPerColumn=1,h=0;h<this.numberOfTiles;h++)m=document.createElement("div"),m.className="container off",m.setAttribute("data-tiler",h),m.addEventListener("mouseenter",function(a){g.hovered=a.target.getAttribute("data-tiler")}),d.constrain&&d.zoom&&(0===h?m.className+=" topleft":h===this.numberOfTiles-1?m.className+=" bottomright":h===j/l-1?(m.className+=" topright",this.tilesPerRow=h+1):h%(j/l)===0&&this.numberOfTiles-h==j/l?m.className+=" bottomleft":h<j/l?m.className+=" top":h>this.numberOfTiles-1-j/l?m.className+=" bottom":h%(j/l)===0?m.className+=" left":h%(j/l)===j/l-1&&(m.className+=" right")),this.tilesPerColumn=this.numberOfTiles/this.tilesPerRow,m.innerHTML='<div class="tile"><section class="front"><figure></figure></section><section class="back"><figure></figure></section>',c(m,{width:l+"px",height:l+"px"}),n=Math.floor(Math.random()*this.data.length),m.querySelector(".front figure").className=this.data[n],n=Math.floor(Math.random()*this.data.length),m.querySelector(".back figure").className=this.data[n],this.root.appendChild(m),window.setTimeout(function(){this.classList.remove("off")}.bind(m),h*d.displayDelay);this.root.addEventListener("click",function(a){g.events&&g.events.on&&g.events.click(a.target.className)}),d.autoStart&&window.setTimeout(function(){arguments[0].toggle()},this.interval+d.displayDelay*this.numberOfTiles,this)},window.Tiler.prototype.positionForIndex=function(a){if(a<0||a>=this.numberOfTiles)throw new Error("invalid index! "+a);var b=parseInt(a/this.tilesPerRow,10),c=a%this.tilesPerRow;return[b,c]},window.Tiler.prototype.newTileIndex=function(){var a=this,b=function(){return Math.floor(Math.random()*a.numberOfTiles)},c=b();if(this.zoom&&this.hovered>=0&&this.tilesPerRow>3&&this.tilesPerColumn>3)do{c=b();var d=this.positionForIndex(c),e=this.positionForIndex(this.hovered)}while(d[0]<=e[0]+1&&d[0]>=e[0]-1&&d[1]<=e[1]+1&&d[1]>=e[1]-1);return c},window.Tiler.prototype.flip=function(){var a=this.root.querySelectorAll(".tile"),b=this.newTileIndex(),c=Math.floor(Math.random()*this.data.length),d=a[b].classList.contains("flipped"),e=d?".back figure":".front figure",f=d?".front figure":".back figure",g=this.data[c];this.events&&this.events.flip&&this.events.flip(a[b].querySelector(e).className,g),a[b].querySelector(f).className=g,a[b].classList.toggle("flipped")},window.Tiler.prototype.stop=function(){this.timeout&&(window.clearTimeout(this.timeout),this.timeout=null)},window.Tiler.prototype.start=function(){this.timeout||(this.root.classList.contains("init")||this.root.classList.add("init"),this.flip(),this.timeout=window.setInterval(function(){var a=arguments[0];a.flip()},this.interval,this))},window.Tiler.prototype.toggle=function(){this.timeout?this.stop():this.start()},window.Tiler.prototype.destroy=function(){this.stop(),this.root.innerHTML="",this.root=null,this.events=null,this.data=null},window.Tiler.prototype.toString=function(){return"Tiler "+JSON.stringify({root:""+this.root,delay:this.interval,data:this.data})}}}();