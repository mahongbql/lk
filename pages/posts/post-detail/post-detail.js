const app = getApp(); //获取全局
const util = require("../../../utils/util.js")
var WxParse = require('../../wxParse/wxParse.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    postName: null,
    avatarUrl: null,
    nickName: null,
    title: null
  },

  onLoad: function(option) {
    var postName = option.postName;
    var avatarUrl = option.avatarUrl;
    var nickName = option.nickName;
    var title = option.title;

    var token = app.globalData.user.token;

    this.setData({
      postName: postName,
      avatarUrl: avatarUrl,
      nickName: nickName,
      title: title,
      token: token
    })

    var data = {
      token: this.data.token,
      postName: postName,
      userId: app.globalData.user.userId
    }

    wx.showLoading({ //期间为了显示效果可以添加一个过度的弹出框提示“加载中”  
      title: '加载中',
      icon: 'loading',
    });

    var that = this;
    wx.request({
      url: util.host + '/posts/getPosts',
      method: 'GET',
      data: data,
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        var posts = res.data.data.data;
        var collect = posts.collect;
        var article = posts.content;
        WxParse.wxParse('article', 'html', article, that, 5);

        var postId = posts.id;
        var dateTime = posts.sendTime;

        that.setData({
          posts: posts,
          postId: postId,
          collected: collect
        })

        wx.hideLoading();
      }
    })
  },

  //收藏功能
  onCollectionTip:function(event){
    var collect = this.data.collected;

    collect = !collect;

    var data = {
      token:this.data.token,
      postId: this.data.postId,
      userId: app.globalData.user.userId,
      collect: collect
    }
    util.getHttp(this.collectSuccess, this.fail, data, "/posts/setCollectStatus");
  },

  collectSuccess: function (data) {
    var status = data.status;
    
    this.setData({
      collected: status
    })

    //操作提示
    wx.showToast({
      title: status ? '收藏成功' : '取消成功',
      icon: 'success',
      duration: 1000
    })
  },

//分享功能
  onShareTap:function(event){
    //清除缓存
    //wx.removeStorageSync('key')
    //清除所有缓存
    //wx.clearStorageSync()
    // var itemList=[
    //   "分享给微信好友",
    //   "分享到朋友圈",
    //   "分享到QQ",
    //   "分享到微博"
    // ]
    // wx.showActionSheet({
    //   itemList: itemList,
    //   itemColor:'#405f80',
    //   success:function(res){
    //       //res.tapIndex 数组元素的序号，从0开始
    //     if (res.tapIndex!=undefined){
    //         wx.showModal({
    //           title: '用户' + itemList[res.tapIndex],
    //           content: '用户是否取消？现在无法实现分享功能',
    //         })
    //       }
    //   }
    // })
  },

  //转发
  onShareAppMessage: function (event) {
    return {
      title: this.data.title,
      path: './post-detail/post-detail?postName=' + this.data.postName + "%avatarUrl=" + this.data.avatarUrl + "%nickName=" + this.data.nickName + "%title=" + this.data.title,
      success: function (res) {
        console.log(res)
        wx.getShareInfo()
      },
      fail: function () {
        console.log("分享失败")
      }
    }
  }
})