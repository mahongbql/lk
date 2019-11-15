//index.js
//获取应用实例
const app = getApp()
var util = require("../../utils/util.js")

Page({
  data: {
    // setInter : '',
    // saying: '老铁，您来啦，欢迎欢迎 ~~~ 下面功能有的能用，有的不行，哈哈哈 ~~~ 我是 luckydog ~~~ ',
    // userSaying: null,
    functionNumber: 4,
    routers: [
      {
        name: '文章',
        url: '/pages/posts/post',
        icon: '../resource/icon/index/write.png',
        show: true
      },
      {
        name: '图片',
        url: '/pages/pic/pic',
        icon: '../resource/icon/index/pic.png',
        show: true
      },
      {
        name: '周公解梦',
        url: '/pages/dream/dream',
        icon: '../resource/icon/dream/dream.png',
        show: true
      },
      {
        name: '老黄历',
        url: '/pages/rili/rili',
        icon: '../resource/icon/rili/rili.png',
        show: false
      }
    ]
  },
  jumpToUser: function () {
    wx.navigateTo({
      url: '../login/login'
    })
  },
  onLoad: function () {
    var that = this;
    var loadFinaish = app.globalData.loadFinaish;

    if (!loadFinaish){
      wx.showLoading({
        title: 'Loading',
      })
    }
    that.data.setInter = setInterval(function () {
      if (null != app.globalData.user) {
        wx.hideLoading();
        clearInterval(that.data.setInter);
        that.checkUserRole();
      }
    }, 1000) //循环间隔 单位ms
  },
  //防止审核被查
  checkUserRole: function(e){
    //正常用户使用功能
    var role = app.globalData.user.role;
    var functionNumber = this.data.functionNumber;
    if(role < 1) {
      for (var i = 0; i < functionNumber; i++) {
        var routers = 'routers[' + i + '].url'
        this.setData({
           [routers] : 'index'
        })
      }
    }
  },

  //与luckydog交流
  // textInput: function(e){
  //   this.setData({
  //     userSaying: e.detail.value
  //   })
  // },
  // 
  // sendMsgToRobot:function(){
  //   var userSaying = this.data.userSaying

  //   if(null == userSaying){
  //     this.setData({
  //       saying: '别不说话嘛，亲 ~~~ '
  //     })

  //     return
  //   }
    
  //   var data = {
  //     token: app.globalData.user.token,
  //     msg: userSaying
  //   }

  //   util.getHttp(this.getTalkSuccess, this.fail, data, "/user/robotTalk");

  // },

  // getTalkSuccess: function(data){
  //   var result = data.rtnMsg;
  //   this.setData({
  //     saying: result
  //   })
  // },

  // fail: function(){
  //   this.setData({
  //     saying: "luckydog 病了，不想说话 。。。。。"
  //   })
  // }
})
