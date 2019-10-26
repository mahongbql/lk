// pages/admin/admin.js
const app = getApp();
var util = require("../../utils/util.js")

let col1H = 0;
let col2H = 0;

Page({
  data: {
    userList:[],
    currentTab: 0, //预设当前项的值
    pageSize:10,
    pageIndex:1,
    imgpass:false,

    scrollH: 0,
    imgWidth: 0,
    loadingCount: 0,
    images: [],
    col1: [],
    col2: [],

    posts: [],
    deleteIndex: 0
  }, 
  
  switchTab: function (e) {
    var cur = e.detail.current;
    var dataList = [];

    switch(cur){
      case 0:
        this.initUser();
        dataList = this.data.userList;
        break;
      case 1:
        this.loadImages();
        dataList = this.data.images;
        break;
      case 2:
        this.initPosts();
        dataList = this.data.posts;
        break;
    }
    this.setData({
      currentTab: cur,
      dataList: dataList
    });
  },

  initPosts:function(){
    var data = {
      token: app.globalData.user.token
    }
    
    wx.showLoading({
      title: '加载中',
      icon: 'loading',
    });
    util.getHttp(this.getPostSuccess, this.fail, data, "/admin/getPostsList");
  },

  getPostSuccess: function(data){
    var postList = data.data;
    this.setData({
      posts: postList
    })
    wx.hideLoading();
  },

  // 点击标题切换当前页时改变样式 
  swichNav: function (e) {
    var cur = e.target.dataset.current;
    if (this.data.currentTaB == cur) {
      return false;
    } else {
      this.setData({ currentTab: cur })
    }
  }, 

  onLoad: function () {
    this.initUser();

    wx.getSystemInfo({
      success: (res) => {
        let ww = res.windowWidth;
        let wh = res.windowHeight;
        let imgWidth = ww * 0.48;
        let scrollH = wh;

        this.setData({
          scrollH: scrollH,
          imgWidth: imgWidth
        });
      }
    })
  },

  initUser: function(){
    var token = app.globalData.user.token;

    var data = {
      "token": token,
      "status": 0
    }

    wx.showLoading({
      title: '加载中',
      icon: 'loading',
    });

    util.getHttp(this.success, this.fail, data, "/admin/showUserList");

    this.setData({
      token: token
    })
  },

  success: function(data){
    var dataList = data.data;
    this.setData({
      userList: dataList
    })
    wx.hideLoading();
  },

  fail: function(){
    wx.showModal({
      title: 'Sorry',
      content: '获取数据失败',
      showCancel: false
    })
  },

  updateLevel: function(e){
    var index = e.currentTarget.dataset.id;
    var type = e.currentTarget.dataset.type;
    var userList = this.data.userList;
    var userId = userList[index].userId;
    var that = this;

    wx.showModal({
      title: '提示',
      content: '确定要升级用户【' + userId + '】成为 ' + type + '？',

      success: function (res) {
        if (res.confirm) {
          console.log('点击确定了');
          var data = {
            "token": that.data.token,
            "status": 0,
            "type": type,
            "userId": userId
          }
          util.getHttp(that.upsuccess, that.fail, data, "/admin/updateUserStatus");
        } else if (res.cancel) {
          console.log('点击取消了');
          return false;
        }
      }
    })
    this.setData({
      index:index
    })
  },

  upsuccess:function(data){
    wx.showToast({
      title: '升级成功',
      icon: 'success',
      duration: 2000
    })
    var userList = this.data.userList;
    var index = this.data.index;
    userList.splice(index, 1);
    this.setData({
      userList: userList
    })
  },

  onImageLoad: function (e) {
    var loadingCount = this.data.loadingCount - 1;

    if (0 > loadingCount) {
      return;
    }

    var images = this.data.images;
    var imageId = e.target.id;
    var oImgW = e.detail.width;         //图片原始宽度
    var oImgH = e.detail.height;        //图片原始高度
    var imgWidth = this.data.imgWidth;  //图片设置的宽度
    var scale = imgWidth / oImgW;        //比例计算
    var imgHeight = oImgH * scale;      //自适应高度

    var imageObj = null;

    for (var i = 0; i < images.length; i++) {
      var img = images[i];
      if (img.id == imageId) {
        imageObj = img;
        break;
      }
    }

    imageObj.height = imgHeight;

    var col1 = this.data.col1;
    var col2 = this.data.col2;

    if (col1H <= col2H) {
      col1H += imgHeight;
      col1.push(imageObj);
    } else {
      col2H += imgHeight;
      col2.push(imageObj);
    }

    this.setData({
      loadingCount: loadingCount,
      col1: col1,
      col2: col2,
      images: images
    })
  },

  loadImages: function () {
    var data = {
      "token": this.data.token,
      "status": 2
    }

    wx.showLoading({
      title: '加载中',
      icon: 'loading',
    });
    util.getHttp(this.picsuccess, this.fail, data, "/admin/showPicList");
  },

  picsuccess:function(data){
    var images = data.data;

    for (var i = 0; i < images.length; i++) {
      images[i].height = 0
    }

    this.setData({
      loadingCount: images.length,
      images: images
    })

    wx.hideLoading();
  },

  picAuth: function(e){
    this.setData({
      imgpass: true,
      des: e.currentTarget.dataset.des,
      path: e.currentTarget.dataset.path,
      usericon: e.currentTarget.dataset.usericon,
      checkid: e.currentTarget.dataset.id,
      index: e.currentTarget.dataset.index,
      col: e.currentTarget.dataset.col
    })
  },

  onCancel:function(){
    this.setData({
      imgpass: false
    })
  },

  onNopass: function(){
    var data = {
      "token": this.data.token,
      "status": 0,
      "picId": this.data.checkid
    }

    util.getHttp(this.updatepicsuccess, this.fail, data, "/admin/updatePicStatus");
  },

  onConfirm:function(){
    var data = {
      "token": this.data.token,
      "status": 1,
      "picId": this.data.checkid
    }

    util.getHttp(this.updatepicsuccess, this.fail, data, "/admin/updatePicStatus");
  },

  updatepicsuccess:function(data){
    wx.showToast({
      title: '修改完毕',
      icon: 'success',
      duration: 2000
    })

    var col = this.data.col;
    var index = this.data.index;
    var temCol = null;

    if(1 == col){
      temCol = this.data.col1
      temCol.splice(index, 1)
      this.setData({
        imgpass: false,
        col1: temCol
      })
    }else{
      temCol = this.data.col2
      temCol.splice(index, 1)
      this.setData({
        imgpass: false,
        col2: temCol
      })
    }
  },

  checkPosts:function(e){
    var index = e.currentTarget.dataset.index;
    var posts = this.data.posts;
    var post = posts[index];

    wx.navigateTo({
      url: '../posts/post-detail/post-detail?postName=' + post.post_name + "&avatarUrl=" + post.avatarUrl + "&nickName=" + post.nickName + "&title=" + post.title
    })
  },

  updataPostsStatus:function(e){
    var that = this;
    var index = e.currentTarget.dataset.index;
    var posts = this.data.posts;
    var post = posts[index];
    var postName = post.post_name;

    wx.showModal({
      title: '提示',
      content: '文章是否通过审核？',

      success: function (res) {
        if (res.confirm) {
          var data = {
            token: that.data.token,
            status: 1,
            postName: postName
          }

          util.getHttp(that.updataSuccess, that.fail, data, "/admin/updatePostsStatus");
        } else if (res.cancel) {
          return false;
        }
        that.setData({
          deleteIndex: index
        })
      }
    })
  },

  updataSuccess:function(data){
    var index = this.data.deleteIndex;
    var posts = this.data.posts;

    posts.splice(index, 1);
    this.setData({
      posts: posts
    })
  }
})