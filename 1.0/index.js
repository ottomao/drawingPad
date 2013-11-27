/**
 * @fileoverview 
 * @author 加里<xiaofeng.mxf@taobao.com>
 * @module drawingPad
 **/

//TODO : flashCanvas下的鼠标手势
KISSY.add(function (S, Node,Dom,Base) {
    var CLASS_INTERACT  = "_drawingPad_interact";
    var DEFAULT_PROXY   = "http://www.tmall.com/go/rgn/tbs-proxy.php?file=";
    // var FLASHCANVAS_PKG = "gallery/drawingPad/1.0/flashCanvas";

    /**
     * [Layer description]
     * @param {object} config contains height,width,left,top,wrapper,img,additionalClass
     */
    function Layer(config){
        //append canvas
        var _self = this;
        _self.fatherPad    = config.father;

        _self.addAttrs({
            img: {           
                setter: function(v) {
                    if(!v) return;

                    var _self = this,
                        imgEl = document.createElement("img"),
                        newSrc;

                    _self.img = imgEl;

                    Node(imgEl).on("load",function(){  //异步载入，更新宽高
                        _self.imgWidth  = imgEl.width;
                        _self.imgHeight = imgEl.height;

                        _self.cordX = S.isNumber(_self.get("centerX"))?  _self.get("centerX") : 0.5 * _self.imgWidth; 
                        _self.cordY = S.isNumber(_self.get("centerY"))?  _self.get("centerY") : 0.5 * _self.imgHeight; 
                        if(_self.fatherPad.flashCanvasEnabled){
                            setTimeout(function(){
                                _self.render.call(_self);   //flashCanvas下会有一些异步操作，直接渲染貌似不行
                            },100);    
                        }else{
                             _self.render();
                        }
                    });

                    newSrc    = _self.fatherPad.get("proxyPrefix") + ( /http:\/\//.test(v) ? v : "http://" + v ) + "?_random=" + new Date().getTime(); //fix onload in IE
                    imgEl.src = newSrc;
                    return newSrc;
                },
                getter: function(v) {
                    return v;
                }
            },
            centerX:{
                value:null,
                setter: function(v) {
                    return v;
                },
                getter: function(v) {
                    return v;
                }
            },
            centerY:{
                value:null,
                setter: function(v) {
                    return v;
                },
                getter: function(v) {
                    return v;
                }
            },
            rotate:{
                value:0,
                setter: function(v) {
                    return v;
                },
                getter: function(v) {
                    return v;
                }
            },
            scale:{
                value:1,
                setter: function(v) {
                    return v;
                },
                getter: function(v) {
                    return v;
                }
            },
            cusClass:{
                value:null,
                setter: function(v) {
                    return v;
                },
                getter: function(v) {
                    return v;
                }
            },
            imgReady:{
                value:0,
                setter:function(v){
                    return v;
                },
                getter:function(v){
                    return v;
                }
            }
        });

        _self.canvasEl           = document.createElement("canvas");  //TODO : flashCanvas只接受这样的生成方法
        _self.canvasEl.innerHTML = "您的浏览器版本过低，请升级";  

        var itemTpl    = Node('<div class="_drawingPad_canvasLayer"></div>')
                        .append(_self.canvasEl)
                        .css("position","absolute")
                        .css("top","0px")
                        .css("left","0px"),
            canvasNode    = itemTpl.one("canvas"),
            canvasWrapper = Node(config.wrapper),
            interLayer    = canvasWrapper.one("." + CLASS_INTERACT);

            itemTpl.one("canvas").css("background","none");

        if(interLayer){  //存在交互层，则始终保持交互层在最上方
            interLayer.before(itemTpl)
        }else{
            canvasWrapper.append(itemTpl); 
        }

        if (_self.fatherPad.flashCanvasEnabled) {
            FlashCanvas.initElement(_self.canvasEl); 
        }

        //添加用户自定义样式
        config["cusClass"] && itemTpl.addClass(config["cusClass"]);

        //set layer attr
        _self.canvasCtx    = _self.canvasEl.getContext("2d");

        //set canvas prop
        _self.canvasEl.width  = config.width;
        _self.canvasEl.height = config.height;


        Layer.superclass.constructor.call(_self,config);

        //载入图片，设置宽高信息。
        if(!_self.get("img")){
            _self.imgWidth  = _self.fatherPad.width;
            _self.imgHeight = _self.fatherPad.height;
        }

        _self.cordX = S.isNumber(_self.get("centerX"))?  _self.get("centerX") : 0.5 * config.width; 
        _self.cordY = S.isNumber(_self.get("centerY"))?  _self.get("centerY") : 0.5 * config.height; 

    }

    S.extend(Layer,Base,{
            render : function(){
                var _self     = this,
                    ctx       = _self.canvasCtx,
                    img       = _self.img,
                    imgWidth  = _self.imgWidth,
                    imgHeight = _self.imgHeight,
                    scaleRate = _self.get("scale"),
                    rotateDeg = _self.get("rotate");

                ctx.setTransform(1,0,0,1,0,0);  
                ctx.clearRect(0,0, _self.canvasEl.width , _self.canvasEl.height); 

                if(!imgWidth){ //尚未载入完成，此时width == 0
                    return _self;
                }

                //usage : context.setTransform(scaleX, skewX, skewY, scaleY, translateX, translateY);
                ctx.setTransform(1,0,0,1,_self.cordX,_self.cordY);   //reset transform
                ctx.rotate( rotateDeg * Math.PI/180);

                // ctx.globalAlpha = 0.5;
                ctx.drawImage(img,0                          , 0                           , imgWidth            , _self.imgHeight,
                                  -0.5 * imgWidth * scaleRate, -0.5 * imgHeight * scaleRate, imgWidth * scaleRate, imgHeight * scaleRate);

                // flashCanvas源码中，loadImage之后会对图片进行缓存，第二次load时将检测缓存，如果命中，则不会调用callback。
                // 也就是说，loadImage方法只能使用一次。这里干脆不用这个函数了，提示开发者不要在render后立即执行getData之类的操作即可。
                // ctx.loadImage(img, function(){
                //     ctx.drawImage(img,0                          , 0                           , imgWidth            , _self.imgHeight,
                //                       -0.5 * imgWidth * scaleRate, -0.5 * imgHeight * scaleRate, imgWidth * scaleRate, imgHeight * scaleRate);

                // });

                return _self;
            },
            //switch active layer
            activeInteract:function(){
                this.fatherPad.interactDoingLayer = this;
                this.fatherPad._updateController();
            },
            //deactive
            deactiveInteract:function(){
                if(this.fatherPad.interactDoingLayer == this){
                    this.fatherPad.interactDoingLayer = null;
                    this.fatherPad._updateController();   
                }
            }
        }
    );

    function DrawingPad(config){
        if (!config.height || !config.width || !config.wrapper ) return;

        //init
        var _self = this;
        _self.canvasSupport      = ifNativeCanvasSupport();
        _self.flashCanvasEnabled = ifFlashCanvasEnabled();

        if(!_self.canvasSupport && !_self.flashCanvasEnabled){
            invokeFlashCanvas();
            _self.flashCanvasEnabled = ifFlashCanvasEnabled();
        }

        _self.init.call(_self,config);
    }

    S.extend(DrawingPad, Base,{
            init:function(config){
                var _self = this;
                _self.addAttrs({
                    height: {
                        value: 0,
                        setter: function(v) {
                            return v;
                        },
                        getter: function(v) {
                            return v;
                        }
                    },
                    width:{
                        value: 0,
                        setter: function(v) {
                            return v;
                        },
                        getter: function(v) {
                            return v;
                        }
                    },
                    wrapper:{
                        value: null,
                        setter: function(v) {
                            return v;
                        },
                        getter: function(v) {
                            return v;
                        }
                    },
                    proxyPrefix:{
                        value:DEFAULT_PROXY,
                        setter:function(v){
                            return v;
                        },
                        getter:function(v){
                            return v;
                        }
                    }
                });

                DrawingPad.superclass.constructor.call(_self, config);
                _self.layers        = [];
                _self.interactDoingLayer   = null;
                _self.interactCaptureLayer = null; 

                Node(_self.get("wrapper")).empty()
                                    .css("position","relative")
                                    .css("height",_self.get("height") + "px")
                                    .css("width",_self.get("width") + "px");


                //添加交互捕获层和相应事件
                //交互捕捉层会自动生成，不提供用户自定义配置
                var captureLayerIndex = _self.addLayer({  
                    img     : null,
                    cusClass: CLASS_INTERACT
                });

                 _self.interactCaptureLayer = _self.layers[captureLayerIndex];

                function getMousePosition(mouseX,mouseY){
                    var interactDoingLayer = _self.interactDoingLayer;
                    if(!interactDoingLayer) return null;


                    //判断坐鼠标位置与选择区域的位置关系。
                    //鼠标位置需要映射到相应被旋转的图层
                    // 1--2
                    // |  |
                    // 4--3
                    var ret = { position:null,info:null },
                        scaleRate = interactDoingLayer.get("scale"),
                        objLeft   = interactDoingLayer.cordX - 0.5 * interactDoingLayer.imgWidth  * scaleRate,
                        objRight  = interactDoingLayer.cordX + 0.5 * interactDoingLayer.imgWidth  * scaleRate,
                        objTop    = interactDoingLayer.cordY - 0.5 * interactDoingLayer.imgHeight * scaleRate,
                        objBottom = interactDoingLayer.cordY + 0.5 * interactDoingLayer.imgHeight * scaleRate,
                        rotation  = interactDoingLayer.get("rotate"),
                        resDeg    = 0 - rotation * Math.PI / 180,   
                        canvasCordX_before = mouseX - interactDoingLayer.cordX,
                        canvasCordY_before = mouseY - interactDoingLayer.cordY,
                        shadowMouse    = getShadowMouse(canvasCordX_before , canvasCordY_before ,resDeg),
                        shadowMouseX   = shadowMouse[0],
                        shadowMouseY   = shadowMouse[1],
                        canvasCordX    = interactDoingLayer.cordX + shadowMouseX, //canvasCordX_before * Math.cos(resDeg) - canvasCordY_before * Math.sin(resDeg),
                        canvasCordY    = interactDoingLayer.cordY + shadowMouseY, //canvasCordX_before * Math.sin(resDeg) + canvasCordY_before * Math.cos(resDeg),
                        cornerPosition = ["ul","t","ur","r","lr","b","ll","l"],
                        cornerIndex; //upper-left , top ,upper-right , right, lower-right,bottom , lower-left , left

                    //此处corner为旋转前的位置
                    if ( getDistance(canvasCordX ,canvasCordY , objLeft , objTop) < 10 ){ //TODO : 距离配置
                        cornerIndex   = 0;
                    }else if( getDistance(canvasCordX ,canvasCordY , objRight, objTop) < 10){
                        cornerIndex   = 2;
                    }else if( getDistance(canvasCordX ,canvasCordY , objRight, objBottom ) < 10 ){
                        cornerIndex   = 4;
                    }else if( getDistance(canvasCordX ,canvasCordY , objLeft , objBottom ) < 10 ){
                        cornerIndex   = 6;
                    }else if(canvasCordX >= objLeft && canvasCordX <= objRight && canvasCordY <= objBottom && canvasCordY >= objTop ){
                        ret.position = "in";
                    }else if( getDistance(0,-30 -  0.5 * interactDoingLayer.imgHeight * scaleRate , shadowMouseX ,shadowMouseY) < 10 ){
                        ret.position = "dot";
                    }else{
                        ret.position = "out";
                    }

                    //修正旋转后的corner位置，写入ret.info
                    if(cornerIndex !== undefined){
                        var offset = 0, //下标偏移
                            newIndex;
                        rotationRate = rotation  / 90;
                        if(Math.floor(rotationRate) == rotationRate){  //90度的倍数
                            offset = rotationRate * 2;  // ul -> ur
                        }else{
                            offset = Math.floor(rotationRate) * 2 + 1;
                        }

                        newIndex     = cornerIndex + offset;
                        newIndex     = newIndex >= 8 ? (newIndex - 8 ): newIndex;
                        ret.position = cornerPosition[newIndex];
                    }

                    ret.shadowMouse = shadowMouse;
                    return ret;

                    function getDistance(x1,y1,x2,y2){
                        return Math.sqrt( (x1-x2)*(x1-x2) + (y1-y2)*(y1-y2) );
                    }

                    //ref : http://en.wikipedia.org/wiki/Rotation_(mathematics)
                    function getShadowMouse(mouseX ,mouseY, deg){
                        return [
                            mouseX * Math.cos(deg) - mouseY * Math.sin(deg),
                            mouseX * Math.sin(deg) + mouseY * Math.cos(deg)
                        ];
                    }
                }

                var mouseAction,
                    startX,
                    startY;
                Node.one(document).on("mouseup",function(){
                    mouseAction = null;
                });

                Node(_self.interactCaptureLayer.canvasEl).on("mousedown",function(e){
                    var interactDoingLayer = _self.interactDoingLayer;                        
                    if(!interactDoingLayer) return; //非交互模式的情况

                    var mouseX        = e.offsetX != undefined ? e.offsetX : e.pageX - Node(e.target).offset().left,
                        mouseY        = e.offsetY != undefined ? e.offsetY : e.pageY - Node(e.target).offset().top,
                        mousePosition = getMousePosition(mouseX,mouseY).position;

                    mouseAction = true;
                    
                    switch(mousePosition){
                        case "in":
                            mouseAction = "move";
                            startX = mouseX;
                            startY = mouseY;
                            break;
                        case "dot":
                            mouseAction = "rotate";
                            break;
                        case "ul":
                        case "t":
                        case "ur":
                        case "r":
                        case "lr":
                        case "b":
                        case "ll":
                        case "l":
                            mouseAction = "scale";
                            break;
                        default:
                            mouseAction = null;
                    }
                })
                .on("mousemove",function(e){
                    var interactDoingLayer = _self.interactDoingLayer;                        
                    if(!interactDoingLayer) return; //非交互模式的情况
                    
                    var mouseX          = e.offsetX != undefined ? e.offsetX : e.pageX - Node(e.target).offset().left,
                        mouseY          = e.offsetY != undefined ? e.offsetY : e.pageY - Node(e.target).offset().top,
                        mouseStat       = getMousePosition(mouseX,mouseY),
                        mousePosition   = mouseStat.position,
                        mouseInfo       = mouseStat.info,
                        mouseShadow     = mouseStat.shadowMouse,
                        captureCanvasEl = _self.interactCaptureLayer.canvasEl,
                        captureCursor   = "auto",
                        cursorMap = {
                            "in" : "move",
                            "out": "auto",
                            "dot": "url('http://gtms01.alicdn.com/tps/i1/T1TBtSFbtiXXbzrQHa-22-22.gif'),pointer", //TODO : 修改
                            "ul" : "nw-resize",
                            "ur" : "ne-resize",
                            "ll" : "ne-resize",
                            "lr" : "nw-resize",
                            "t"  : "n-resize",
                            "b"  : "n-resize",
                            "l"  : "e-resize",
                            "r"  : "e-resize"
                        };

                    if(mouseAction == "move"){
                        interactDoingLayer.cordX += mouseX - startX;
                        interactDoingLayer.cordY += mouseY - startY;

                        interactDoingLayer.render();

                        _self._updateController();

                        startX = mouseX;
                        startY = mouseY;

                    //拉伸
                    }else if(mouseAction == "scale"){
                        var layerWidth  = interactDoingLayer.imgWidth,
                            layerHeight = interactDoingLayer.imgHeight,
                            layerCordX  = interactDoingLayer.cordX,
                            layerCordY  = interactDoingLayer.cordY,
                            scaleRateX,
                            scaleRateY,
                            scaleRate   = 1,

                        scaleRateX = Math.abs( mouseShadow[0] / (layerWidth  * 0.5) );
                        scaleRateY = Math.abs( mouseShadow[1] / (layerHeight * 0.5) );
                        scaleRate  = Math.min(scaleRateX , scaleRateY);

                        interactDoingLayer.set("scale", scaleRate );
                        interactDoingLayer.render();

                        _self._updateController();

                    //旋转
                    }else if(mouseAction == "rotate"){
                        var relativeX = mouseX - interactDoingLayer.cordX,
                            relativeY = -mouseY + interactDoingLayer.cordY,
                            angle;

                        if(relativeY == 0 && relativeX <= 0 ){
                            angle = 270;
                        }else if(relativeY == 0 && relativeX > 0){
                            angle = 90;
                        }else if(relativeY > 0){
                            angle = Math.atan( relativeX /  relativeY) * 180 / Math.PI;
                        }else{
                            angle = Math.atan( relativeX /  relativeY) * 180 / Math.PI + 180;
                        }

                        interactDoingLayer.set("rotate",angle);
                        interactDoingLayer.render();

                        _self._updateController();
                    }else{

                        //没有动作时，更新鼠标指针
                        captureCursor = cursorMap[mousePosition] || captureCursor;
                        Node(_self.get("wrapper")).css("cursor",captureCursor);
                        // Node(captureCanvasEl).parent().css("cursor",captureCursor);
                    }
                    
                });
            },
            addLayer:function(config){
                var newLayer = new Layer(
                    S.mix(config,{
                        father  : this,
                        height  : this.get("height"),
                        width   : this.get("width"),
                        wrapper : this.get("wrapper")
                    })
                );

                this.layers.push(newLayer);
                return (this.layers.length - 1);
            },
            activeInteract:function(layerIndex){
                this.layers[layerIndex].activeInteract();
            },
            deactiveInteract:function(layerIndex){
                var doingLayer = this.interactDoingLayer;
                if(!doingLayer) return;
                doingLayer.deactiveInteract();
                doingLayer = null;
                this._updateController();
            },
            _clearCapture:function(){
                var interactCaptureCtx = this.interactCaptureLayer.canvasCtx;
                interactCaptureCtx.setTransform(1,0,0,1,0,0);
                interactCaptureCtx.clearRect(0,0 , this.get("width") , this.get("height")); 
            },
            _updateController:function(){
                //draw controller frame
                var _self              = this,
                    interactCaptureCtx = _self.interactCaptureLayer.canvasCtx;

                if(!_self.interactDoingLayer){
                    //clear controller
                    _self._clearCapture();
                }else{
                    var squreWidth         = 6,
                        strokeStyle        = "#7777FF",
                        fillStyle          = "#7777FF",
                        lineWidth          = 2,
                        lineCap            = "square",
                        targetRotateDeg = _self.interactDoingLayer.get("rotate"),
                        targetScaleRate = _self.interactDoingLayer.get("scale"),
                        targetCordX     = _self.interactDoingLayer.cordX,
                        targetCordY     = _self.interactDoingLayer.cordY,
                        targetWidth     = _self.interactDoingLayer.imgWidth  * targetScaleRate,
                        targetHeight    = _self.interactDoingLayer.imgHeight * targetScaleRate,
                        targetXLeft     = 0 - 0.5 * targetWidth,
                        targetXRight    = 0 + 0.5 * targetWidth,
                        targetYUpper    = 0 - 0.5 * targetHeight,
                        targetYLower    = 0 + 0.5 * targetHeight;
                                    
                    _self._clearCapture(); 

                    interactCaptureCtx.setTransform(1,0,0,1,targetCordX,targetCordY);   //reset transform
                    interactCaptureCtx.rotate(targetRotateDeg * Math.PI/180);

                    // draw the rectangle outside
                    interactCaptureCtx.beginPath(); //upper left , clockwise
                    interactCaptureCtx.lineWidth   = lineWidth;
                    interactCaptureCtx.strokeStyle = strokeStyle;
                    interactCaptureCtx.lineCap     = lineCap;
                    interactCaptureCtx.fillStyle   = fillStyle;
                    interactCaptureCtx.moveTo(targetXLeft , targetYUpper);
                    interactCaptureCtx.lineTo(targetXRight, targetYUpper);
                    interactCaptureCtx.lineTo(targetXRight, targetYLower);
                    interactCaptureCtx.lineTo(targetXLeft , targetYLower);
                    interactCaptureCtx.lineTo(targetXLeft , targetYUpper);
                    interactCaptureCtx.stroke();
                    interactCaptureCtx.closePath();    

                    // draw the control point on the corner
                    drawControlPoint(interactCaptureCtx , squreWidth, targetXLeft , targetYUpper);
                    drawControlPoint(interactCaptureCtx , squreWidth, targetXRight, targetYUpper);
                    drawControlPoint(interactCaptureCtx , squreWidth, targetXRight, targetYLower);
                    drawControlPoint(interactCaptureCtx , squreWidth, targetXLeft , targetYLower);
                    drawControlPoint(interactCaptureCtx , squreWidth, targetXLeft , targetYUpper);

                    // draw the rotation handler
                    var pointRadius = 4; //TODO : 配置控制点尺寸
                    interactCaptureCtx.beginPath();
                    interactCaptureCtx.moveTo( 0 , targetYUpper );
                    interactCaptureCtx.lineTo( 0 , targetYUpper - 30);
                    interactCaptureCtx.stroke();
                    interactCaptureCtx.closePath();

                    interactCaptureCtx.beginPath();
                    interactCaptureCtx.arc(0 , targetYUpper -30, pointRadius, 0 , Math.PI * 2 );
                    interactCaptureCtx.fill();
                    interactCaptureCtx.closePath();

                }

                function drawControlPoint(ctx,width,centerX,centerY){
                    ctx.fillRect(centerX - width / 2 , centerY - width / 2 , width ,width);
                }                
            },
            //delay in ms
            getMergedData:function(callback,delay){
                var self  = this,
                    delay = delay || 4000,
                    captureEl  = this.interactCaptureLayer.canvasEl,
                    captureCtx = this.interactCaptureLayer.canvasCtx,
                    dataURL;
                self.deactiveInteract();

                for(var i = 1 ; i < self.layers.length ; i++){  //不要绘入capture层
                    var canvasEl = self.layers[i].canvasEl;
                    captureCtx.drawImage(canvasEl,0,0);
                }

                try{
                    if(self.flashCanvasEnabled){
                        setTimeout(function(){ //flashCanvas的getDataURL是异步操作，很慢
                            dataURL = captureEl.toDataURL("image/png");
                            self._clearCapture();
                            callback(dataURL);
                        } , delay);
                    }else{
                        dataURL = captureEl.toDataURL("image/png");
                        self._clearCapture();
                        if(!callback){
                            return dataURL;
                        }else{
                            callback(dataURL);
                        }
                    }
                }catch(e){
                    console.log("error when fetching data, maybe due to cross-domain issue");
                    return "";
                }
                
            }
        },{}
    );

    //检测浏览器是否原生支持canvas
    //在FlashCanvas中，动态生成的canvas必须init才能使用。故此处只探测原生性能
    function ifNativeCanvasSupport(){  
        var el = document.createElement("canvas");
        return (el.getContext && el.getContext("2d"));
    }

    function ifFlashCanvasEnabled(){
        return (typeof FlashCanvas != "undefined");
    }

    //FlashCanvas源码
    function invokeFlashCanvas(){
        window.FlashCanvasOptions = {
            swfPath: "http://www.tmall.com/go/rgn/tbs-proxy.php?file=http://a.tbcdn.cn/s/kissy/gallery/drawingPad/1.0/",  //modify to CDN
            disableContextMenu: true
        };

        window.ActiveXObject&&!window.CanvasRenderingContext2D&&function(i,j,z){function D(a){this.code=a;this.message=R[a]}function S(a){this.width=a}function v(a){this.id=a.C++}function k(a){this.G=a;this.id=a.C++}function m(a,b){this.canvas=a;this.B=b;this.d=b.id.slice(8);this.D();this.C=0;this.f=this.u="";var c=this;setInterval(function(){o[c.d]===0&&c.e()},30)}function A(){if(j.readyState==="complete"){j.detachEvent(E,A);for(var a=j.getElementsByTagName(r),b=0,c=a.length;b<c;++b)B.initElement(a[b])}}
        function F(){var a=event.srcElement,b=a.parentNode;a.blur();b.focus()}function G(){var a=event.propertyName;if(a==="width"||a==="height"){var b=event.srcElement,c=b[a],d=parseInt(c,10);if(isNaN(d)||d<0)d=a==="width"?300:150;c===d?(b.style[a]=d+"px",b.getContext("2d").I(b.width,b.height)):b[a]=d}}function H(){i.detachEvent(I,H);for(var a in s){var b=s[a],c=b.firstChild,d;for(d in c)typeof c[d]==="function"&&(c[d]=l);for(d in b)typeof b[d]==="function"&&(b[d]=l);c.detachEvent(J,F);b.detachEvent(K,G)}i[L]=
        l;i[M]=l;i[N]=l;i[C]=l;i[O]=l}function T(){var a=j.getElementsByTagName("script"),a=a[a.length-1];return j.documentMode>=8?a.src:a.getAttribute("src",4)}function t(a){return(""+a).replace(/&/g,"&amp;").replace(/</g,"&lt;")}function U(a){return a.toLowerCase()}function h(a){throw new D(a);}function P(a){var b=parseInt(a.width,10),c=parseInt(a.height,10);if(isNaN(b)||b<0)b=300;if(isNaN(c)||c<0)c=150;a.width=b;a.height=c}var l=null,r="canvas",L="CanvasRenderingContext2D",M="CanvasGradient",N="CanvasPattern",
        C="FlashCanvas",O="G_vmlCanvasManager",J="onfocus",K="onpropertychange",E="onreadystatechange",I="onunload",w=((i[C+"Options"]||{}).swfPath||T().replace(/[^\/]+$/,""))+"flashcanvas.swf",e=new function(a){for(var b=0,c=a.length;b<c;b++)this[a[b]]=b}("toDataURL,save,restore,scale,rotate,translate,transform,setTransform,globalAlpha,globalCompositeOperation,strokeStyle,fillStyle,createLinearGradient,createRadialGradient,createPattern,lineWidth,lineCap,lineJoin,miterLimit,shadowOffsetX,shadowOffsetY,shadowBlur,shadowColor,clearRect,fillRect,strokeRect,beginPath,closePath,moveTo,lineTo,quadraticCurveTo,bezierCurveTo,arcTo,rect,arc,fill,stroke,clip,isPointInPath,font,textAlign,textBaseline,fillText,strokeText,measureText,drawImage,createImageData,getImageData,putImageData,addColorStop,direction,resize".split(",")),
        u={},p={},o={},x={},s={},y={};m.prototype={save:function(){this.b();this.c();this.n();this.m();this.z();this.w();this.F.push([this.g,this.h,this.A,this.v,this.k,this.i,this.j,this.l,this.q,this.r,this.o,this.p,this.f,this.s,this.t]);this.a.push(e.save)},restore:function(){var a=this.F;if(a.length)a=a.pop(),this.globalAlpha=a[0],this.globalCompositeOperation=a[1],this.strokeStyle=a[2],this.fillStyle=a[3],this.lineWidth=a[4],this.lineCap=a[5],this.lineJoin=a[6],this.miterLimit=a[7],this.shadowOffsetX=
        a[8],this.shadowOffsetY=a[9],this.shadowBlur=a[10],this.shadowColor=a[11],this.font=a[12],this.textAlign=a[13],this.textBaseline=a[14];this.a.push(e.restore)},scale:function(a,b){this.a.push(e.scale,a,b)},rotate:function(a){this.a.push(e.rotate,a)},translate:function(a,b){this.a.push(e.translate,a,b)},transform:function(a,b,c,d,f,g){this.a.push(e.transform,a,b,c,d,f,g)},setTransform:function(a,b,c,d,f,g){this.a.push(e.setTransform,a,b,c,d,f,g)},b:function(){var a=this.a;if(this.g!==this.globalAlpha)this.g=
        this.globalAlpha,a.push(e.globalAlpha,this.g);if(this.h!==this.globalCompositeOperation)this.h=this.globalCompositeOperation,a.push(e.globalCompositeOperation,this.h)},n:function(){if(this.A!==this.strokeStyle){var a=this.A=this.strokeStyle;if(typeof a!=="string")if(a instanceof k||a instanceof v)a=a.id;else return;this.a.push(e.strokeStyle,a)}},m:function(){if(this.v!==this.fillStyle){var a=this.v=this.fillStyle;if(typeof a!=="string")if(a instanceof k||a instanceof v)a=a.id;else return;this.a.push(e.fillStyle,
        a)}},createLinearGradient:function(a,b,c,d){(!isFinite(a)||!isFinite(b)||!isFinite(c)||!isFinite(d))&&h(9);this.a.push(e.createLinearGradient,a,b,c,d);return new k(this)},createRadialGradient:function(a,b,c,d,f,g){(!isFinite(a)||!isFinite(b)||!isFinite(c)||!isFinite(d)||!isFinite(f)||!isFinite(g))&&h(9);(c<0||g<0)&&h(1);this.a.push(e.createRadialGradient,a,b,c,d,f,g);return new k(this)},createPattern:function(a,b){a||h(17);var c=a.tagName,d,f=this.d;if(c)if(c=c.toLowerCase(),c==="img")d=a.getAttribute("src",
        2);else if(c===r||c==="video")return;else h(17);else a.src?d=a.src:h(17);b==="repeat"||b==="no-repeat"||b==="repeat-x"||b==="repeat-y"||b===""||b===l||h(12);this.a.push(e.createPattern,t(d),b);!p[f][d]&&u[f]&&(this.e(),++o[f],p[f][d]=!0);return new v(this)},z:function(){var a=this.a;if(this.k!==this.lineWidth)this.k=this.lineWidth,a.push(e.lineWidth,this.k);if(this.i!==this.lineCap)this.i=this.lineCap,a.push(e.lineCap,this.i);if(this.j!==this.lineJoin)this.j=this.lineJoin,a.push(e.lineJoin,this.j);
        if(this.l!==this.miterLimit)this.l=this.miterLimit,a.push(e.miterLimit,this.l)},c:function(){var a=this.a;if(this.q!==this.shadowOffsetX)this.q=this.shadowOffsetX,a.push(e.shadowOffsetX,this.q);if(this.r!==this.shadowOffsetY)this.r=this.shadowOffsetY,a.push(e.shadowOffsetY,this.r);if(this.o!==this.shadowBlur)this.o=this.shadowBlur,a.push(e.shadowBlur,this.o);if(this.p!==this.shadowColor)this.p=this.shadowColor,a.push(e.shadowColor,this.p)},clearRect:function(a,b,c,d){this.a.push(e.clearRect,a,b,c,
        d)},fillRect:function(a,b,c,d){this.b();this.c();this.m();this.a.push(e.fillRect,a,b,c,d)},strokeRect:function(a,b,c,d){this.b();this.c();this.n();this.z();this.a.push(e.strokeRect,a,b,c,d)},beginPath:function(){this.a.push(e.beginPath)},closePath:function(){this.a.push(e.closePath)},moveTo:function(a,b){this.a.push(e.moveTo,a,b)},lineTo:function(a,b){this.a.push(e.lineTo,a,b)},quadraticCurveTo:function(a,b,c,d){this.a.push(e.quadraticCurveTo,a,b,c,d)},bezierCurveTo:function(a,b,c,d,f,g){this.a.push(e.bezierCurveTo,
        a,b,c,d,f,g)},arcTo:function(a,b,c,d,f){f<0&&isFinite(f)&&h(1);this.a.push(e.arcTo,a,b,c,d,f)},rect:function(a,b,c,d){this.a.push(e.rect,a,b,c,d)},arc:function(a,b,c,d,f,g){c<0&&isFinite(c)&&h(1);this.a.push(e.arc,a,b,c,d,f,g?1:0)},fill:function(){this.b();this.c();this.m();this.a.push(e.fill)},stroke:function(){this.b();this.c();this.n();this.z();this.a.push(e.stroke)},clip:function(){this.a.push(e.clip)},w:function(){var a=this.a;if(this.f!==this.font)try{var b=y[this.d];b.style.font=this.f=this.font;
        var c=b.currentStyle;a.push(e.font,[c.fontStyle,c.fontWeight,b.offsetHeight,c.fontFamily].join(" "))}catch(d){}if(this.s!==this.textAlign)this.s=this.textAlign,a.push(e.textAlign,this.s);if(this.t!==this.textBaseline)this.t=this.textBaseline,a.push(e.textBaseline,this.t);if(this.u!==this.canvas.currentStyle.direction)this.u=this.canvas.currentStyle.direction,a.push(e.direction,this.u)},fillText:function(a,b,c,d){this.b();this.m();this.c();this.w();this.a.push(e.fillText,t(a),b,c,d===z?Infinity:d)},
        strokeText:function(a,b,c,d){this.b();this.n();this.c();this.w();this.a.push(e.strokeText,t(a),b,c,d===z?Infinity:d)},measureText:function(a){var b=y[this.d];try{b.style.font=this.font}catch(c){}b.innerText=(""+a).replace(/[ \n\f\r]/g,"\t");return new S(b.offsetWidth)},drawImage:function(a,b,c,d,f,g,i,j,l){a||h(17);var k=a.tagName,n,q=arguments.length,m=this.d;if(k)if(k=k.toLowerCase(),k==="img")n=a.getAttribute("src",2);else if(k===r||k==="video")return;else h(17);else a.src?n=a.src:h(17);this.b();
        this.c();n=t(n);if(q===3)this.a.push(e.drawImage,q,n,b,c);else if(q===5)this.a.push(e.drawImage,q,n,b,c,d,f);else if(q===9)(d===0||f===0)&&h(1),this.a.push(e.drawImage,q,n,b,c,d,f,g,i,j,l);else return;!p[m][n]&&u[m]&&(this.e(),++o[m],p[m][n]=!0)},loadImage:function(a,b,c){var d=a.tagName,f,g=this.d;if(d)d.toLowerCase()==="img"&&(f=a.getAttribute("src",2));else if(a.src)f=a.src;if(f&&!p[g][f]){if(b||c)x[g][f]=[a,b,c];this.a.push(e.drawImage,1,t(f));u[g]&&(this.e(),++o[g],p[g][f]=!0)}},D:function(){this.globalAlpha=
        this.g=1;this.globalCompositeOperation=this.h="source-over";this.fillStyle=this.v=this.strokeStyle=this.A="#000000";this.lineWidth=this.k=1;this.lineCap=this.i="butt";this.lineJoin=this.j="miter";this.miterLimit=this.l=10;this.shadowBlur=this.o=this.shadowOffsetY=this.r=this.shadowOffsetX=this.q=0;this.shadowColor=this.p="rgba(0, 0, 0, 0.0)";this.font=this.f="10px sans-serif";this.textAlign=this.s="start";this.textBaseline=this.t="alphabetic";this.a=[];this.F=[]},H:function(){var a=this.a;this.a=
        [];return a},e:function(){var a=this.H();if(a.length>0)return eval(this.B.CallFunction('<invoke name="executeCommand" returntype="javascript"><arguments><string>'+a.join("&#0;")+"</string></arguments></invoke>"))},I:function(a,b){this.e();this.D();if(a>0)this.B.width=a;if(b>0)this.B.height=b;this.a.push(e.resize,a,b)}};k.prototype={addColorStop:function(a,b){(isNaN(a)||a<0||a>1)&&h(1);this.G.a.push(e.addColorStop,this.id,a,b)}};D.prototype=Error();var R={1:"INDEX_SIZE_ERR",9:"NOT_SUPPORTED_ERR",11:"INVALID_STATE_ERR",
        12:"SYNTAX_ERR",17:"TYPE_MISMATCH_ERR",18:"SECURITY_ERR"},B={initElement:function(a){if(a.getContext)return a;var b=Math.random().toString(36).slice(2)||"0",c="external"+b;u[b]=!1;p[b]={};o[b]=1;x[b]={};P(a);a.innerHTML='<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="'+location.protocol+'//fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,0,0" width="100%" height="100%" id="'+c+'"><param name="allowScriptAccess" value="always"><param name="flashvars" value="id='+
        c+'"><param name="wmode" value="transparent"></object><span style="margin:0;padding:0;border:0;display:inline-block;position:static;height:1em;overflow:visible;white-space:nowrap"></span>';s[b]=a;var d=a.firstChild;y[b]=a.lastChild;var f=j.body.contains;if(f(a))d.movie=w;else var g=setInterval(function(){if(f(a))clearInterval(g),d.movie=w},0);if(j.compatMode==="BackCompat"||!i.XMLHttpRequest)y[b].style.overflow="hidden";var h=new m(a,d);a.getContext=function(a){return a==="2d"?h:l};a.toDataURL=function(a,
        b){(""+a).replace(/[A-Z]+/g,U)==="image/jpeg"?h.a.push(e.toDataURL,a,typeof b==="number"?b:""):h.a.push(e.toDataURL,a);return h.e()};d.attachEvent(J,F);return a},saveImage:function(a,b){a.firstChild.saveImage(b)},setOptions:function(){},trigger:function(a,b){s[a].fireEvent("on"+b)},unlock:function(a,b,c){var d,e,g;o[a]&&--o[a];if(b===z){d=s[a];b=d.firstChild;P(d);e=d.width;c=d.height;d.style.width=e+"px";d.style.height=c+"px";if(e>0)b.width=e;if(c>0)b.height=c;b.resize(e,c);d.attachEvent(K,G);u[a]=
        !0;typeof d.onload==="function"&&setTimeout(function(){d.onload()},0)}else if(g=x[a][b])e=g[0],c=g[1+c],delete x[a][b],typeof c==="function"&&c.call(e)}};j.createElement(r);j.createStyleSheet().cssText=r+"{display:inline-block;overflow:hidden;width:300px;height:150px}";j.readyState==="complete"?A():j.attachEvent(E,A);i.attachEvent(I,H);if(w.indexOf(location.protocol+"//"+location.host+"/")===0){var Q=new ActiveXObject("Microsoft.XMLHTTP");Q.open("GET",w,!1);Q.send(l)}i[L]=m;i[M]=k;i[N]=v;i[C]=B;i[O]=
        {init:function(){},init_:function(){},initElement:B.initElement};keep=[m.measureText,m.loadImage]}(window,document);
    }

    return DrawingPad;

}, {requires:['node','dom', 'base']});



