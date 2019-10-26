const app = getApp()

const util = require("../../utils/util.js")

Page({
  /**
   * 页面的初始数据
   */
  data: {
    //小程序总是会读取data对象来做数据绑定，这个动作我们称为动作A
    //而这个动作A的执行，是在onLoad事件执行之后发生的
    techPageIndex: 1,   //分页查询页码
    lifePageSize: 1,

    pageSize: 10,    //分页查询数量
    hasMore: true,
    currentTab: 0,
    postsListKey: "posts_list_",  //缓存key
    array: ['科 技', '生 活'],
    winHeight: "" //窗口高度
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    var role = app.globalData.user.role

    if(0 == role){
      wx.navigateTo({
        url: '../login/login'
      })
    }

    var that = this; //  高度自适应 
    wx.getSystemInfo({
      success: function (res) {
        var clientHeight = res.windowHeight,
          clientWidth = res.windowWidth,
          rpxR = 750 / clientWidth;
        var calc = clientHeight * rpxR;
        that.setData({ winHeight: calc });
      }
    });

    this.getData();
  },

  getData: function () {
    wx.showLoading({
      title: 'Loading',
    })

    var type = this.data.currentTab;
    var key = this.data.postsListKey;
    var postsList = util.getCache(key + type, false)
    var pageSize = this.data.pageSize

    if(postsList){
      if (pageSize <= postsList.length){
        this.setData({
          hasMore: true, 
          posts_key: postsList
        })
      }else{
        this.setData({
          hasMore: false,
          posts_key: postsList
        })
      }

      wx.hideLoading();
    }else{
      var token = app.globalData.user.token;
      var data = {
        "pageNum": this.getPageIndex(type),
        "pageSize": this.data.pageSize,
        "type": type,
        "token": token
      }

      util.getHttp(this.success, this.fail, data, "/posts/getPostsList");
    }
  },

  getPageIndex: function(cur){
    var pageIndex = 1;

    switch(cur){
      case 0:
        pageIndex = this.data.techPageIndex
        break;
      case 1:
        pageIndex = this.data.lifePageSize
        break;
    }

    return pageIndex;
  },

  success:function(data){
    if(data) {
      var postsList = data.postList;
      var key = this.data.postsListKey;
      var type = this.data.currentTab;
      util.putCache(key + type, postsList, 300);
      this.judgeHasMore(postsList.length);
      this.setData({
        posts_key: postsList
      })

      wx.hideLoading();
    }
  },

  fail:function(){
    console.log("获取文章信息异常");
    wx.showModal({
      title: 'Sorry',
      content: '获取文章信息异常',
      showCancel: false
    })
  },

  onPostTap:(event)=>{
    //target 和 currenTarget
    //target 指的点击的当前组件 而 currenTarget指的是事件捕获的组件

    var data = event.currentTarget.dataset;
    //页面跳转
    wx.navigateTo({
      url: '../posts/post-detail/post-detail?postName=' + data.post_name + "&avatarUrl=" + data.avatarurl + "&nickName=" + data.nickname + "&title=" + data.title
    })

  },

  jumpToEdit:function(){
    var role = app.globalData.user.role;

    if (role >= 3) {
      wx.navigateTo({
        url: '../edit/postEdit'
      })
    }else {
      util.showConnectMessage();
    }
  },

  /**
 * 判断是否有更多文章
 */
  judgeHasMore: function (length) {
    var pageSize = this.data.pageSize;

    if (length < pageSize) {
      this.setData({
        hasMore: false
      })
    } else {
      this.setData({
        hasMore: true
      })
    }
    console.log("judgeHasMore hasMore: " + this.data.hasMore)
  },

  swichNav: function (e) {
    var cur = e.target.dataset.current;
    if (this.data.currentTaB == cur) {
      return false;
    } else {
      this.setData({ 
        currentTab: cur,
        posts_key:[]
      })
      this.getData()
    }
  },

  switchTab: function (e) {
    var postsList = this.data.posts_key
    this.setData({
      currentTab: e.detail.current,
      posts_key: []
    });
    // this.judgeHasMore(postsList.length);
    this.getData()
  },

  morePosts:function(){
    var pageSize = this.data.pageSize
    var type = this.data.currentTab;
    var token = app.globalData.user.token;
    var hasMore = this.data.hasMore;

    if (!hasMore) {
      //操作提示
      wx.showToast({
        title: '无更多文章',
        icon: 'success',
        duration: 1000
      })
      return;
    }

    var pageIndex = 1
    switch (type) {
      case 0:
        pageIndex = this.data.techPageIndex + 1
        this.setData({
          techPageIndex: pageIndex
        })
        break;
      case 1:
        pageIndex = this.data.lifePageIndex + 1
        this.setData({
          lifePageIndex: pageIndex
        })
        break;
    }

    var data = {
      "pageNum": pageIndex,
      "pageSize": pageSize,
      "type": type,
      "token": token
    };

    //操作提示
    wx.showLoading({ //期间为了显示效果可以添加一个过度的弹出框提示“加载中”  
      title: '加载中',
      icon: 'loading',
    });

    util.getHttp(this.moreSuccess, this.fail, data, "/posts/getPostsList");
  },

  moreSuccess:function(data){
    var postsList = data.postList;
    var posts_key = this.data.posts_key;
    var winHeight = this.data.winHeight;

    winHeight = winHeight - 10;

    this.judgeHasMore(postsList.length);

    this.setData({
      posts_key: posts_key.concat(postsList),
      winHeight: winHeight
    })
    
    wx.hideLoading();
  }
})