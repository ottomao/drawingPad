## drawingPad

* drawingPad是基于HTML5 canvas的绘图板组件，可以允许用户进行图层互动，进行图片合成等。它可以支持包括IE6在内的全部浏览器。

* 一个典型的使用场景：用户上传图片，自主旋转缩放后合成贺卡，上传到服务器。

* 强烈建议从[Demo](http://gallery.kissyui.com/drawingPad/1.0/demo/index.html)入手理解组件。

* 如在使用过程中遇到问题，欢迎联系作者 xiaofeng.mxf@taobao.com

* 版本：2.1，作者：加里（茅晓锋）
* <span style="color:#FF6200">此版本改造中，不建议外部用户使用</span>
* Demo：[http://gallery.kissyui.com/drawingPad/2.1/demo/index.html](http://gallery.kissyui.com/drawingPad/2.1/demo/index.html)

## 创建绘图板

    S.use('gallery/drawingPad/2.1/index', function (S, DrawingPad) {
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
	    cusClass : "myClass",
	    hide     : false
	}); 

## 图层的各个属性

- `img` 图层图像，必选
- `centerX` 图片在绘图板的中心x，可选，默认0
- `centerY` 图片在绘图板的中心y，可选，默认0
- `rotate`  旋转角度，可选，正负皆可，默认0
- `scale`   缩放比例，可选，默认0
- `cusClass` 图层需要添加的自定义样式，可选
- `hide` 是否隐藏图层，可选，默认false

## 修改图层属性
除了cusClass外，图层属性都可以在运行时动态修改。

语法

	drawingPad.setLayerPara(Layer,ParamName,ParaValue);

例如

	drawingPad.setLayerPara(itemLayer,"rotate",180); //设置旋转180度
	drawingPad.setLayerPara(itemLayer,"scale",2); //设置缩放比例
	drawingPad.setLayerPara(frameLayer,"hide",true); //隐藏	

## 激活/退出图层互动状态
激活交互状态后，图层周围会显示一圈控制点，用户可以对内容进行自由缩放、旋转

	drawingPad.activeInteract(itemLayer); //激活该层的互动状态
	drawingPad.deactiveInteract(); //退出

## 获取图层交互数据

	var data = drawingPad.getLayerInfo(itemLayer); //获取单一图层数据
	var data = drawingPad.getLayerInfo(); //获取全部图层数据
	
单层数据样例：

	{
    	centerX: 200,
    	centerY: 200,
    	rotate: 10,
    	scale: 1
	}

全部图层数据样例：

	[
	    null,
	    {
	        "centerX": 200,
	        "centerY": 200,
	        "rotate": 10,
	        "scale": 1
	    },
	    {
	        "centerX": 350,
	        "centerY": 215,
	        "rotate": 0,
	        "scale": 1
	    },
	    {
	        "centerX": 50,
	        "centerY": 50,
	        "rotate": 0,
	        "scale": 1
	    }
	];
	
	//假设上述数据被赋到了变量data中
	var layerData1 = data[itemLayer1]; //获取对应图层的数据
	var layerData2 = data[itemLayer2]; //获取对应图层的数据
	var layerData3 = data[itemLayer3]; //获取对应图层的数据
	
	

## 获取合成后的Base64图像
	drawingPad.getMergedData(function(base64Img){},delayInMs); //异步获取
	var base64Img = drawingPad.getMergedData(); //同步获取

注意：

- 合成图片为jpg格式，生成dataURI
- 低版本浏览器中使用了flashCanvas，采取异步回调的形式可以兼容所有浏览器。如果不考虑对IE8及以下浏览器的兼容，可以直接获取数据，同步输出。
- 异步模式下，对于原生支持canvas的浏览器，callback是立即执行的。
- delayInMs参数只针对IE8以下的浏览器生效（它们原生不支持canvas)。
- 由于flashCanvas的技术限制，这里的delay值只能手动调整测试，大尺寸图片要用高delay。最终使得浏览器能正确输出合成后的图片即可。
- 代码里已经嵌入了flashCanvas Pro，阿里系已经购买过此License（[内网Ref](http://work.tmall.net/issues/8271)）。其他同学如需在IE8及以下浏览器使用此组件，请记得遵守[FlashCanvas相关协议](http://flashcanvas.net/purchase)。