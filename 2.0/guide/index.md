## drawingPad

drawingPad是基于HTML5 canvas的绘图板组件，可以允许用户进行图层互动，进行图片合成等。它可以支持包括IE6在内的全部浏览器。

一个典型的使用场景：用户上传图片，旋转缩放后合成贺卡，上传到服务器。

强烈建议从Demo入手理解组件：[http://gallery.kissyui.com/drawingPad/1.0/demo/index.html](http://gallery.kissyui.com/drawingPad/1.0/demo/index.html)

如在使用过程中遇到问题，欢迎联系作者 xiaofeng.mxf@taobao.com


* 版本：2.0
* 作者：加里（茅晓锋）
* demo：[http://gallery.kissyui.com/drawingPad/1.0/demo/index.html](http://gallery.kissyui.com/drawingPad/1.0/demo/index.html)

## 创建绘图板

    S.use('gallery/drawingPad/2.0/index', function (S, DrawingPad) {
    	var drawingPad = new DrawingPad({
    	    height      : 430,
    	    width       : 700,
    	    wrapper     : S.get(".canvasWrapper")
    	});
    });

- `height` 绘图板高度
- `width` 绘图板宽度
- `wrapper` 绘图板容器


## 新建图层

	var itemLayer = drawingPad.addLayer({
	    img      : "http://gtms01.alicdn.com/tps/i1/T1oVxmXqVhXXb4HOvo-600-375.jpg",
	    centerX  : 200,     
	    centerY  : 200,     
	    rotate   : 10,      
	    scale    : 1,       
	    cusClass : "myClass"
	}); 

- `img` 图层图像，必选
- `centerX` 图片在绘图板的中心x，可选，默认0
- `centerY` 图片在绘图板的中心y，可选，默认0
- `rotate`  旋转角度，可选，正负皆可，默认0
- `scale`   缩放比例，可选，默认0
- `cusClass` 图层需要添加的自定义样式，可选

## 激活/退出图层互动状态

	drawingPad.activeInteract(itemLayer); //激活
	drawingPad.deactiveInteract(); //退出

## 获取图层交互数据

	var data = drawingPad.getLayerInfo(itemLayer); //获取单一图层数据
	var data = drawingPad.getLayerInfo(); //获取全部图层数据

## 获取合成后的Base64图像
	drawingPad.getMergedData(function(base64Img){},delayInMs); //异步形式
	var base64Img = drawingPad.getMergedData(); //同步形式

注意：
- 合成图片为jpg格式
- 低版本浏览器中使用了flashCanvas，建议采取异步回调的形式，这样可以兼容所有浏览器。如果不考虑对IE8及以下浏览器的兼容，可以直接获取数据，同步输出。
- delayInMs参数只针对IE8以下的浏览器生效（它们原生不支持canvas)。
- 由于flashCanvas的技术限制，这里的delay值只能手动调整测试，大尺寸要用高delay，最终使得浏览器能正确输出合成后的图片即可。





