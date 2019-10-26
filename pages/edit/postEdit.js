const app = getApp()

const util = require("../../utils/util.js")

Page({
  data: {
    array: ['科技', '生活'],
    index: 0,
    host_url: util.host + "/fileUpload/uploadPostPic",
    header: {
      "Content-Type": "multipart/form-data"
    },
    postName:"",
    formData : {
      token: "",
      upload_name: ""
    },
    existText: false,
    loadDataFinish: false
  },

  /**
 * 选择图片类型
 */
  bindPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value
    })
  },

  onLoad: function (options) {
    var role = app.globalData.user.role;
    var token = app.globalData.user.token;
    var postName = options.postName;
    if (postName) {
      this.setData({
        postName: postName,
        role: role
      })
      var data = {
        token: token,
        postName: postName
      }
      util.getHttp(this.authorSuccess, this.fail, data, "/posts/authorGetPosts");
    } else {
      var timestamp = Date.parse(new Date()) / 1000;
      var userId = app.globalData.user.userId;
      var postName = userId + "_" + timestamp;
      this.setData({
        formData: {
          token: token,
          upload_name: postName,
          userId: app.globalData.user.userId,
          role: role
        },
        postName: postName,
        loadDataFinish: true
      });
    }
  },

  authorSuccess: function(data){
    var html = data.data;
    this.setData({
      html: html,
      loadDataFinish:true
    })
  },

  finish: function (e) {
    var content = e.detail.content;

    this.setData({
      existText:true,
      content: content
    })
  },

  textInput: function (e) {
    this.setData({
      title: e.detail.value
    })
  },

  onCancel:function(){
    this.setData({
      existText: false
    })
  },

  onConfirm:function(){
    this.checkAuth();

    var content = this.data.content;
    var title = this.data.title;

    if (0 == content.length) {
      console.log("文章不能为空");
      wx.showModal({
        title: 'Dear',
        content: '文章不能为空',
        showCancel: false
      })
      return;
    } 

    if (0 == title.length && 20 >= title.length) {
      console.log("题目命名违规");
      wx.showModal({
        title: 'Dear',
        content: '题目命名违规',
        showCancel: false
      })
      return;
    }

    var data = {
      token: app.globalData.user.token,
      upload_name: this.data.postName,
      userId: app.globalData.user.userId,
      content: content,
      title: title,
      type: this.data.index
    }

    if(this.data.title){
      util.http(this.success, this.fail, data, "/posts/uploadPost");
    }
  },

  success:function(data){
    //文章上传成功后，跳转到文章详情页面
    //传递参数有：文章名，作者名称，作者头像
    var postName = this.data.postName;
    var avatarUrl = app.globalData.userInfo.avatarUrl;
    var nickName = app.globalData.userInfo.nickName;
    var title = this.data.title;
    wx.navigateTo({
      url: '../posts/post-detail/post-detail?postName=' + postName + "&avatarUrl=" + avatarUrl + "&nickName=" + nickName + "&title=" + title
    })
  },

  fail:function(){
    wx.showLoading({
      title: '加载中',
      icon: 'loading',
    });
  },

  checkAuth: function () {
    if (this.data.role < 3) {
      wx.navigateTo({
        url: '../login/login'
      })
    }
  }
})
