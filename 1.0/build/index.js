/*
combined files : 

gallery/drawingPad/1.0/index

*/
/**
 * @fileoverview 
 * @author 加里<xiaofeng.mxf@taobao.com>
 * @module drawingPad
 **/

//TODO : flashCanvas下的鼠标手势
//TODO : 扔了cordX这个属性
KISSY.add('gallery/drawingPad/1.0/index',function (S, Node,Dom,Base) {
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
                                _self.render.call(_self);   //flashCanvas下会有一些异步操作，直接渲染会出错，原因不详
                            },100);    
                        }else{
                             _self.render();
                        }
                    });
                    newSrc    = _self.fatherPad.get("proxyPrefix") ?
                                _self.fatherPad.get("proxyPrefix") + ( /http:\/\//.test(v) ? v : "http://" + v ) + "?_random=" + new Date().getTime():
                                v;
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
            deactiveInteract:function(){
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
                    captureEl  = self.interactCaptureLayer.canvasEl,
                    captureCtx = self.interactCaptureLayer.canvasCtx,
                    dataURL;
                self.deactiveInteract();

                for(var i = 1 ; i < self.layers.length ; i++){  //不要绘入capture层

                    // alert(i.toString());
                    // alert(self.layers[i]);
                    // alert(self.layers[i].canvasEl);
                    var canvasElement = self.layers[i].canvasEl;
                    captureCtx.drawImage(canvasElement,0,0);
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
                    S.log("error when fetching data, maybe due to cross-domain issue");
                    return "";
                }
                
            },
            getLayerInfo:function(layerIndex){
                var self        = this,
                    layers      = self.layers,
                    ret         = [];

                if(layerIndex){
                    return getSingleLayerData(layerIndex);
                }else{
                    var ret = [],
                        i;
                    for (i = 1 ; i < layers.length ; i ++){ //escape capture layer
                        ret[i] = getSingleLayerData(i);
                    }
                    return ret;
                }

                function getSingleLayerData(layerIndex){
                    var layer = layers[layerIndex];
                    return {
                        centerX : layer.cordX,
                        centerY : layer.cordY,
                        rotate  : layer.get("rotate"),
                        scale   : layer.get("scale")
                    }
                }

                return ret;
            },
            setLayerPara:function(layerIndex,paraName,paraValue){
                var self  = this,
                    layer = self.layers[layerIndex];
                if(arguments.length != 3 || !layer) return;

                layer.set(paraName,paraValue);
                layer.render();
                self._updateController();
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
            // proxy:"http://www.tmall.com/go/rgn/tbs-proxy.php",
            disableContextMenu: true
        };

        /*
         * FlashCanvas Pro
         *
         * Copyright (c) 2009      Tim Cameron Ryan
         * Copyright (c) 2009-2011 Shinya Muramatsu
         */
        window.ActiveXObject&&!window.CanvasRenderingContext2D&&function(l,k,q){function N(a){this.code=a;this.message=fa[a]}function v(a,b,c){if(!c)for(var c=[],d=0,e=a*b*4;d<e;++d)c[d]=0;this.width=a;this.height=b;this.data=c}function ga(a){this.width=a}function w(a){this.id=a.F++}function o(a){this.J=a;this.id=a.F++}function A(a,b){this.canvas=a;this.z=b;this.e=b.id.slice(8);this.G();this.F=0;this.j=this.D="";this.d=0}function B(){if(k.readyState==="complete"){k.detachEvent(O,B);for(var a=k.getElementsByTagName(r),
        b=0,c=a.length;b<c;++b)C.initElement(a[b])}}function P(){var a=event.srcElement,b=a.parentNode;a.blur();b.focus()}function D(){event.button&2&&event.srcElement.parentNode.setCapture()}function E(){event.button&2&&event.srcElement.parentNode.releaseCapture()}function Q(){var a=event.propertyName;if(a==="width"||a==="height"){var b=event.srcElement,c=b[a],d=parseInt(c,10);if(isNaN(d)||d<0)d=a==="width"?300:150;c===d?(b.style[a]=d+"px",b.getContext("2d").K(b.width,b.height)):b[a]=d}}function R(){l.detachEvent(S,
        R);for(var a in j){var b=j[a],c=b.firstChild,d;for(d in c)typeof c[d]==="function"&&(c[d]=g);for(d in b)typeof b[d]==="function"&&(b[d]=g);c.detachEvent(T,P);c.detachEvent(F,D);b.detachEvent(G,E);b.detachEvent(U,Q)}l[V]=g;l[W]=g;l[X]=g;l[H]=g;l[Y]=g}function ha(a){return a.toLowerCase()}function i(a){throw new N(a);}function Z(a){var b=parseInt(a.width,10),c=parseInt(a.height,10);if(isNaN(b)||b<0)b=300;if(isNaN(c)||c<0)c=150;a.width=b;a.height=c}function I(a,b){for(var c in j){var d=j[c].getContext("2d");
        d.g.push(d.a.length+2);d.a.push(x,a,b)}}var g=null,r="canvas",V="CanvasRenderingContext2D",W="CanvasGradient",X="CanvasPattern",H="FlashCanvas",Y="G_vmlCanvasManager",T="onfocus",F="onmousedown",G="onmouseup",U="onpropertychange",O="onreadystatechange",S="onunload",m;try{m=(new ActiveXObject("ShockwaveFlash.ShockwaveFlash")).GetVariable("$version").match(/[\d,]+/)[0].replace(/,/g,".")}catch(ka){m=0}var n=l[H+"Options"]||{},ia=function(){var a=k.getElementsByTagName("script"),a=a[a.length-1];return k.documentMode>=
        8?a.src:a.getAttribute("src",4)}().replace(/[^\/]+$/,""),t=n.swfPath||ia;t+=parseInt(m)>9?"flash10canvas.swf":"flash9canvas.swf";var x="4",s={},u={},$={},J={},p={},aa={},y={},j={},z={},K="turbo"in n?n.turbo:1,L=n.delay||0,ba=n.disableContextMenu||0,ca=n.imageCacheSize||100,M=n.usePolicyFile||0,da=n.proxy||"proxy.php",ea=n.save||"save.php";m==="10.1.53.64"&&(K=0,L=30);A.prototype={save:function(){this.h(15);this.I.push([this.m,this.n,this.w,this.l,this.q,this.o,this.p,this.r,this.u,this.v,this.s,this.t,
        this.j,this.A,this.B]);this.a.push("B")},restore:function(){var a=this.I;if(a.length)a=a.pop(),this.globalAlpha=a[0],this.globalCompositeOperation=a[1],this.strokeStyle=a[2],this.fillStyle=a[3],this.lineWidth=a[4],this.lineCap=a[5],this.lineJoin=a[6],this.miterLimit=a[7],this.shadowOffsetX=a[8],this.shadowOffsetY=a[9],this.shadowBlur=a[10],this.shadowColor=a[11],this.font=a[12],this.textAlign=a[13],this.textBaseline=a[14];this.a.push("C")},scale:function(a,b){this.a.push("D",a,b)},rotate:function(a){this.a.push("E",
        a)},translate:function(a,b){this.a.push("F",a,b)},transform:function(a,b,c,d,e,f){this.a.push("G",a,b,c,d,e,f)},setTransform:function(a,b,c,d,e,f){this.a.push("H",a,b,c,d,e,f)},createLinearGradient:function(a,b,c,d){(!isFinite(a)||!isFinite(b)||!isFinite(c)||!isFinite(d))&&i(9);this.a.push("M",a,b,c,d);return new o(this)},createRadialGradient:function(a,b,c,d,e,f){(!isFinite(a)||!isFinite(b)||!isFinite(c)||!isFinite(d)||!isFinite(e)||!isFinite(f))&&i(9);(c<0||f<0)&&i(1);this.a.push("N",a,b,c,d,e,
        f);return new o(this)},createPattern:function(a,b){a||i(17);var c=a.tagName,d,e,f,h=this.e;if(c)if(c=c.toLowerCase(),c==="img")d=a.getAttribute("src",2);else if(c===r)e=this.C(a),f=a!==this.canvas;else if(c==="video")return;else i(17);else a.src?d=a.src:i(17);b==="repeat"||b==="no-repeat"||b==="repeat-x"||b==="repeat-y"||b===""||b===g||i(12);e||(e=u[h][d],(f=e===q)&&(e=this.k(d)));this.a.push("O",e,b);f&&s[h]&&(this.f(),++p[h]);return new w(this)},clearRect:function(a,b,c,d){this.a.push("X",a,b,c,
        d);this.b||this.c();this.d=0},fillRect:function(a,b,c,d){this.h(1);this.a.push("Y",a,b,c,d);this.b||this.c();this.d=0},strokeRect:function(a,b,c,d){this.h(6);this.a.push("Z",a,b,c,d);this.b||this.c();this.d=0},beginPath:function(){this.a.push("a")},closePath:function(){this.a.push("b")},moveTo:function(a,b){this.a.push("c",a,b)},lineTo:function(a,b){this.a.push("d",a,b)},quadraticCurveTo:function(a,b,c,d){this.a.push("e",a,b,c,d)},bezierCurveTo:function(a,b,c,d,e,f){this.a.push("f",a,b,c,d,e,f)},
        arcTo:function(a,b,c,d,e){e<0&&isFinite(e)&&i(1);this.a.push("g",a,b,c,d,e)},rect:function(a,b,c,d){this.a.push("h",a,b,c,d)},arc:function(a,b,c,d,e,f){c<0&&isFinite(c)&&i(1);this.a.push("i",a,b,c,d,e,f?1:0)},fill:function(){this.h(1);this.a.push("j");this.b||this.c();this.d=0},stroke:function(){this.h(6);this.a.push("k");this.b||this.c();this.d=0},clip:function(){this.a.push("l")},isPointInPath:function(a,b){this.a.push("m",a,b);return this.f()==="true"},fillText:function(a,b,c,d){this.h(9);this.g.push(this.a.length+
        1);this.a.push("r",a,b,c,d===q?Infinity:d);this.b||this.c();this.d=0},strokeText:function(a,b,c,d){this.h(10);this.g.push(this.a.length+1);this.a.push("s",a,b,c,d===q?Infinity:d);this.b||this.c();this.d=0},measureText:function(a){var b=z[this.e];try{b.style.font=this.font}catch(c){}b.innerText=a.replace(/[ \n\f\r]/g,"\t");return new ga(b.offsetWidth)},drawImage:function(a,b,c,d,e,f,h,ja,l){a||i(17);var g=a.tagName,k,j,n,m=arguments.length,o=this.e;if(g)if(g=g.toLowerCase(),g==="img")k=a.getAttribute("src",
        2);else if(g===r)j=this.C(a),n=a!==this.canvas;else if(g==="video")return;else i(17);else a.src?k=a.src:i(17);j||(j=u[o][k],(n=j===q)&&(j=this.k(k)));this.h(0);if(m===3)this.a.push("u",m,j,b,c);else if(m===5)this.a.push("u",m,j,b,c,d,e);else if(m===9)(d===0||e===0)&&i(1),this.a.push("u",m,j,b,c,d,e,f,h,ja,l);else return;n&&s[o]?(this.f(),++p[o]):this.b||this.c();this.d=0},createImageData:function(a,b){var c=Math.ceil;arguments.length===2?((!isFinite(a)||!isFinite(b))&&i(9),(a===0||b===0)&&i(1)):(a instanceof
        v||i(9),b=a.height,a=a.width);a=c(a<0?-a:a);b=c(b<0?-b:b);return new v(a,b)},getImageData:function(a,b,c,d){(!isFinite(a)||!isFinite(b)||!isFinite(c)||!isFinite(d))&&i(9);(c===0||d===0)&&i(1);this.a.push("w",a,b,c,d);a=this.f();c=typeof JSON==="object"?JSON.parse(a):k.documentMode?eval(a):a.slice(1,-1).split(",");a=c.shift();b=c.shift();return new v(a,b,c)},putImageData:function(a,b,c,d,e,f,h){a instanceof v||i(17);(!isFinite(b)||!isFinite(c))&&i(9);var g=arguments.length,j=a.width,k=a.height,l=a.data;
        g===3?this.a.push("x",g,j,k,l.toString(),b,c):g===7&&((!isFinite(d)||!isFinite(e)||!isFinite(f)||!isFinite(h))&&i(9),this.a.push("x",g,j,k,l.toString(),b,c,d,e,f,h));this.b||this.c();this.d=0},loadFont:function(a){this.g.push(this.a.length+1);this.a.push("6",a);s[this.e]?(this.f(),++p[this.e]):this.b||this.c()},loadImage:function(a,b,c){var d=a.tagName,e,f=this.e;if(d)d.toLowerCase()==="img"&&(e=a.getAttribute("src",2));else if(a.src)e=a.src;if(e&&u[f][e]===q){d=this.k(e);if(b||c)y[f][d]=[a,b,c];
        this.a.push("u",1,d);s[f]&&(this.f(),++p[f])}},G:function(){this.globalAlpha=this.m=1;this.globalCompositeOperation=this.n="source-over";this.fillStyle=this.l=this.strokeStyle=this.w="#000000";this.lineWidth=this.q=1;this.lineCap=this.o="butt";this.lineJoin=this.p="miter";this.miterLimit=this.r=10;this.shadowBlur=this.s=this.shadowOffsetY=this.v=this.shadowOffsetX=this.u=0;this.shadowColor=this.t="rgba(0, 0, 0, 0.0)";this.font=this.j="10px sans-serif";this.textAlign=this.A="start";this.textBaseline=
        this.B="alphabetic";this.a=[];this.I=[];this.i=[];this.g=[];this.b=g;this.H=1},h:function(a){var b=this.a,c;if(this.m!==this.globalAlpha)b.push("I",this.m=this.globalAlpha);if(this.n!==this.globalCompositeOperation)b.push("J",this.n=this.globalCompositeOperation);if(this.u!==this.shadowOffsetX)b.push("T",this.u=this.shadowOffsetX);if(this.v!==this.shadowOffsetY)b.push("U",this.v=this.shadowOffsetY);if(this.s!==this.shadowBlur)b.push("V",this.s=this.shadowBlur);if(this.t!==this.shadowColor)c=this.t=
        this.shadowColor,(""+c).indexOf("%")>0&&this.i.push(b.length+1),b.push("W",c);if(a&1&&this.l!==this.fillStyle)c=this.l=this.fillStyle,typeof c==="string"?(c.indexOf("%")>0&&this.i.push(b.length+1),b.push("L",c)):(c instanceof o||c instanceof w)&&b.push("L",c.id);if(a&2&&this.w!==this.strokeStyle)c=this.w=this.strokeStyle,typeof c==="string"?(c.indexOf("%")>0&&this.i.push(b.length+1),b.push("K",c)):(c instanceof o||c instanceof w)&&b.push("K",c.id);if(a&4){if(this.q!==this.lineWidth)b.push("P",this.q=
        this.lineWidth);if(this.o!==this.lineCap)b.push("Q",this.o=this.lineCap);if(this.p!==this.lineJoin)b.push("R",this.p=this.lineJoin);if(this.r!==this.miterLimit)b.push("S",this.r=this.miterLimit)}if(a&8){if(this.j!==this.font)a=z[this.e].offsetHeight,this.g.push(b.length+2),b.push("o",a,this.j=this.font);if(this.A!==this.textAlign)b.push("p",this.A=this.textAlign);if(this.B!==this.textBaseline)b.push("q",this.B=this.textBaseline);if(this.D!==this.canvas.currentStyle.direction)b.push("1",this.D=this.canvas.currentStyle.direction)}},
        c:function(){var a=this;a.b=setTimeout(function(){p[a.e]?a.c():(a.b=g,a.f(K))},L)},L:function(){clearTimeout(this.b);this.b=g},f:function(a){var b,c,d,e=this.i,f=this.g,h=this.a,g=this.z;if(h.length){this.b&&this.L();if(a){for(b=0,c=e.length;b<c;++b)d=e[b],h[d]=encodeURI(h[d]);for(b=0,c=f.length;b<c;++b)d=f[b],h[d]=encodeURIComponent(h[d])}else for(b=0,c=f.length;b<c;++b)d=f[b],h[d]=(""+h[d]).replace(/&/g,"&amp;").replace(/</g,"&lt;");b=h.join("\u0001");this.a=[];this.i=[];this.g=[];if(a)g.flashvars=
        "c="+b,g.width=g.clientWidth+this.H,this.H^=-2;else return g.CallFunction('<invoke name="executeCommand" returntype="javascript"><arguments><string>'+b+"</string></arguments></invoke>")}},K:function(a,b){this.f();this.G();if(a>0)this.z.width=a;if(b>0)this.z.height=b;this.a.push("2",a,b);this.b||this.c();this.d=0},C:function(a){var b=a.getContext("2d").e,c=r+":"+b;(a.width===0||a.height===0)&&i(11);if(b!==this.e&&(a=j[b].getContext("2d"),!a.d))b=++aa[b],c+=":"+b,a.a.push("3",b),a.b||a.c(),a.d=1;return c},
        k:function(a){var b=this.e,c=u[b],d=$[b],e=c[a]=J[b]++;e>=ca-1&&(J[b]=0);e in d&&delete c[d[e]];this.g.push(this.a.length+2);this.a.push("5",e,a);d[e]=a;return e}};o.prototype={addColorStop:function(a,b){(isNaN(a)||a<0||a>1)&&i(1);var c=this.J,d=this.id;(""+b).indexOf("%")>0&&c.i.push(c.a.length+3);c.a.push("y",d,a,b)}};N.prototype=Error();var fa={1:"INDEX_SIZE_ERR",9:"NOT_SUPPORTED_ERR",11:"INVALID_STATE_ERR",12:"SYNTAX_ERR",17:"TYPE_MISMATCH_ERR",18:"SECURITY_ERR"},C={initElement:function(a){if(a.getContext)return a;
        var b=Math.random().toString(36).slice(2)||"0",c="external"+b;s[b]=0;u[b]={};$[b]=[];J[b]=0;p[b]=1;aa[b]=0;y[b]=[];Z(a);a.innerHTML='<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="'+location.protocol+'//fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,0,0" width="100%" height="100%" id="'+c+'"><param name="allowScriptAccess" value="always"><param name="flashvars" value="id='+c+'"><param name="wmode" value="transparent"></object><span style="margin:0;padding:0;border:0;display:inline-block;position:static;height:1em;overflow:visible;white-space:nowrap"></span>';
        j[b]=a;var d=a.firstChild;z[b]=a.lastChild;var e=k.body.contains;if(e(a))d.movie=t;else var f=setInterval(function(){if(e(a))clearInterval(f),d.movie=t},0);if(k.compatMode==="BackCompat"||!l.XMLHttpRequest)z[b].style.overflow="hidden";var h=new A(a,d);a.getContext=function(a){return a==="2d"?h:g};a.toDataURL=function(b,c){if(a.width===0||a.height===0)return"data:,";(""+b).replace(/[A-Z]+/g,ha)==="image/jpeg"?h.a.push("A",b,typeof c==="number"?c:""):h.a.push("A",b);return h.f().slice(1,-1)};d.attachEvent(T,
        P);ba&&(d.attachEvent(F,D),a.attachEvent(G,E));M&&h.a.push(x,"usePolicyFile",M);b=h.a.length;h.g.push(b+2,b+5);h.a.push(x,"proxy",da,x,"save",ea);return a},saveImage:function(a){a.firstChild.saveImage()},setOptions:function(a){for(var b in a){var c=a[b];switch(b){case "turbo":K=c;break;case "delay":L=c;break;case "disableContextMenu":ba=c;var d=void 0;for(d in j){var e=j[d],f=c?"attachEvent":"detachEvent";e.firstChild[f](F,D);e[f](G,E)}break;case "imageCacheSize":ca=c;break;case "usePolicyFile":I(b,
        M=c?1:0);break;case "proxy":I(b,da=c);break;case "save":I(b,ea=c)}}},trigger:function(a,b){j[a].fireEvent("on"+b)},unlock:function(a,b,c){var d,e,f;p[a]&&--p[a];if(b===q){d=j[a];b=d.firstChild;Z(d);e=d.width;c=d.height;d.style.width=e+"px";d.style.height=c+"px";if(e>0)b.width=e;if(c>0)b.height=c;b.resize(e,c);d.attachEvent(U,Q);s[a]=1;typeof d.onload==="function"&&setTimeout(function(){d.onload()},0)}else if(f=y[a][b])e=f[0],c=f[1+c],delete y[a][b],typeof c==="function"&&c.call(e)}};k.createElement(r);
        k.createStyleSheet().cssText=r+"{display:inline-block;overflow:hidden;width:300px;height:150px}";k.readyState==="complete"?B():k.attachEvent(O,B);l.attachEvent(S,R);t.indexOf(location.protocol+"//"+location.host+"/")===0&&(m=new ActiveXObject("Microsoft.XMLHTTP"),m.open("GET",t,!1),m.send(g));l[V]=A;l[W]=o;l[X]=w;l[H]=C;l[Y]={init:function(){},init_:function(){},initElement:C.initElement}}(window,document);


    }

    return DrawingPad;

}, {requires:['node','dom', 'base']});




