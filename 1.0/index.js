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
                        imgEl = document.createElement("img"), //document.getElementById("frame"),// 
                        newSrc;

                    Node(imgEl).on("load",function(){  //异步载入，更新宽高
                        _self.imgWidth  = imgEl.width;
                        _self.imgHeight = imgEl.height;

                        _self.cordX = S.isNumber(_self.get("centerX"))?  _self.get("centerX") : 0.5 * _self.imgWidth; 
                        _self.cordY = S.isNumber(_self.get("centerY"))?  _self.get("centerY") : 0.5 * _self.imgHeight; 
                        _self.render();
                    });

                    newSrc = _self.fatherPad.get("proxyPrefix") + ( /http:\/\//.test(v) ? v : "http://" + v );
                    imgEl.src = newSrc;
                    _self.img = imgEl;

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
            }
        });
        Layer.superclass.constructor.call(_self,config);

        _self.canvasEl           = document.createElement("canvas");  //TODO : flashCanvas只接受这样的生成方法
        _self.canvasEl.innerHTML = "您的浏览器版本过低，请升级";  

        var itemTpl    = Node('<div class="_drawingPad_canvasLayer"></div>')
                        .append(_self.canvasEl)
                        .css("position","absolute")
                        .css("top","0px")
                        .css("left","0px"),
            canvasNode    = itemTpl.one("canvas"),
            canvasWrapper = Node(config.wrapper),
            interLayer    = canvasWrapper.one("." + CLASS_INTERACT),
            imgSrc        = _self.get("img");

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

        //载入图片，设置宽高信息。
        if(!imgSrc){
            _self.imgWidth  = _self.fatherPad.width;
            _self.imgHeight = _self.fatherPad.height;
        }

        _self.cordX = S.isNumber(_self.get("centerX"))?  _self.get("centerX") : 0.5 * _self.imgWidth; 
        _self.cordY = S.isNumber(_self.get("centerY"))?  _self.get("centerY") : 0.5 * _self.imgHeight; 
        
        //set canvas prop
        _self.canvasEl.width  = config.width;
        _self.canvasEl.height = config.height;
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
                // _self.height        = config.height;
                // _self.width         = config.width;
                // _self.wrapper       = Node(config.wrapper);
                _self.layers        = [];
                _self.interactDoingLayer   = null;
                _self.interactCaptureLayer = null; 

                Node(_self.get("wrapper")).empty()
                                    .css("position","relative")
                                    .css("height",_self.get("height") + "px")
                                    .css("width",_self.get("width") + "px");


                //添加交互捕获层和相应事件
                //交互捕捉层会自动生成，不提供用户自定义配置
                _self.interactCaptureLayer = _self.addLayer({  
                    img     : null,
                    cusClass: CLASS_INTERACT
                });

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
                return newLayer;
            },
            deactiveInteract:function(){
                this.interactDoingLayer = null;
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
                    delay = delay || 2000,
                    captureEl = this.interactCaptureLayer.canvasEl,
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

    return DrawingPad;

}, {requires:['node','dom', 'base']});



