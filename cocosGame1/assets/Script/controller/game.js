// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

var NodeModel = require("nodeModel");

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },

        bulletPrefab: cc.Prefab     //子弹预制节点
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad: function () {
        //获取节点下的Label属性,层级过多可以通过 cc.find("路径") 查找
        NodeModel.speedlab = cc.find("Canvas/speedNode/label").getComponent(cc.Label);
        //给label赋值
        NodeModel.speedlab.string = "100";

        NodeModel.firelab = cc.find("Canvas/fireNode/label").getComponent(cc.Label);

        //层级单一可以通过 this.node.getChildByName("节点名")查找
        NodeModel.score = this.node.getChildByName("scoreLab").getComponent(cc.Label);

        NodeModel.cannon = this.node.getChildByName('cannon');

        NodeModel.bulletSpeed = 1.3;    //子弹速度
        NodeModel.bulletFire = 0.1;    //子弹火力,为单位时间内子弹的数量

        this.init();
    },

    //初始化事件
    init: function () {
        this.cannonTouch();
        this.createBulletPool();
    },

    //注册大炮移动事件
    cannonTouch: function () {
        var star_X;  //记录初始点击位置
        var cannonStar_X; //记录大炮初始位置
        NodeModel.cannon.on(cc.Node.EventType.TOUCH_START, function (event) {
            console.log('-----开始移动');
            star_X = event.getLocationX();
            cannonStar_X = NodeModel.cannon.getPositionX();
            this.buildTimer();
        },this);
        
        NodeModel.cannon.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
            console.log('------移动');
            var loc_X = event.getLocationX() - star_X + cannonStar_X;
            // console.log('loc_X--' + loc_X);
            NodeModel.cannon.setPositionX(loc_X);
        },this);

        NodeModel.cannon.on(cc.Node.EventType.TOUCH_END, function (event) {
            console.log('-------移动结束');
            this.removeTimer();
        },this);

        //当手指在目标节点区域外离开屏幕时
        NodeModel.cannon.on(cc.Node.EventType.TOUCH_CANCEL, function (event) {
            console.log('------取消');
            this.removeTimer();
        },this);
    },

    //创建子弹对象池
    createBulletPool: function () {
        this.bulletPool = new cc.NodePool();
        var bullet = cc.instantiate(this.bulletPrefab);     //创建节点
        this.bulletPool.put(bullet);                        //放入对象池
    },

    //创建子弹对象
    createBullet: function (parentNode) {
        var bullet = null;
        if (this.bulletPool.size() > 0) {
            bullet = this.bulletPool.get();
        }else {
            bullet = cc.instantiate(this.bulletPrefab);
        }

        bullet.parent = parentNode;

        return bullet;
    },

    //将子弹对象返回对象池
    onBulletKilled: function (bullet) {
        this.bulletPool.put(bullet);
    },

    //发射子弹
    fire: function () {
        var bullet = this.createBullet(this.node);
        var position = NodeModel.cannon.getPosition();
        bullet.setPosition(position);

        //动作完成回调事件
        var finished = cc.callFunc(function (bul) {
            this.onBulletKilled(bul);
        }, this, bullet);

        this.bulletAction(bullet, finished);


    },

    //子弹动作
    bulletAction: function (bulletNode, finishCallBack) {
        var bulletAct = cc.sequence(
            // cc.spawn(
            //     cc.moveBy(2, cc.v2(0, window.screen.height))
            //
            // )
            cc.moveBy(2, cc.v2(0, 1334)),
            finishCallBack

        ).speed(1);
        bulletNode.runAction(bulletAct);
    },

    //创建子弹定时器
    buildTimer: function () {
        // if (this.fireTimer) {
        //     this.unschedule(this.fireTimer);
        // }
        this.fireTimer = function () {
            console.log('');
            this.fire();
        }
        this.schedule(this.fireTimer, NodeModel.bulletFire);
    },
    //移除定时器
    removeTimer: function () {
        this.unschedule(this.fireTimer);
    }

    // update (dt) {},
});

