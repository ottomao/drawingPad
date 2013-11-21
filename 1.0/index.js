/**
 * @fileoverview 
 * @author 加里<xiaofeng.mxf@taobao.com>
 * @module drawingPad
 **/
KISSY.add(function (S, Node,Base) {
    var EMPTY = '';
    var $ = Node.all;
    /**
     * 
     * @class DrawingPad
     * @constructor
     * @extends Base
     */
    function DrawingPad(comConfig) {
        var self = this;
        //调用父类构造函数
        DrawingPad.superclass.constructor.call(self, comConfig);
    }
    S.extend(DrawingPad, Base, /** @lends DrawingPad.prototype*/{

    }, {ATTRS : /** @lends DrawingPad*/{

    }});
    return DrawingPad;
}, {requires:['node', 'base']});



