// pages/pic/pic.js
const app = getApp();
var util = require("../../utils/util.js")

Page({
  /**
   * 页面的初始数据
   */
  data: {
    winHeight: "", //窗口高度 
    currentTab: 0, //预设当前项的值 
    scrollLeft:0,  //tab标题的滚动条位置
    pageIndex:1,   //分页查询页码
    pageSize:10,    //分页查询数量
    pic_key: [],     //图片列表
    picListKey:"pic_list_",  //缓存key
    hasMore: true
  },

  switchTab: function (e) {
    //切换图片类型时，展示更多hasMore赋值为true
    var picList = this.data.pic_key
    this.setData({ 
      currentTab: e.detail.current,
      pic_key: [],
      hasMore: true
    }); 
    this.checkCor(); 
    this.getData(this.data.token)
  }, 
  
  // 点击标题切换当前页时改变样式 
  swichNav:function(e){ 
    var cur=e.target.dataset.current; 
    if(this.data.currentTaB==cur){
      return false;
    } else{ 
      this.setData({ 
        currentTab:cur,
        pic_key: []
      }) 
      this.getData(this.data.token)
    } 
  }, 
  
  //判断当前滚动超过一屏时，设置tab标题滚动条。 
  checkCor:function(){ 
    if (this.data.currentTab>4){ 
      this.setData({ scrollLeft:300 }) 
    }else{ 
      this.setData({ scrollLeft:0 }) 
    } 
  }, 

  onLoad: function(option) {
    var that = this; //  高度自适应 
    wx.getSystemInfo({ 
      success: function( res ) { 
        var clientHeight=res.windowHeight,         
        clientWidth=res.windowWidth, 
        rpxR=750/clientWidth;
        var calc = clientHeight * rpxR - 230;
        that.setData( { winHeight: calc }); 
      } 
    });

    //进行数据获取
    var token = app.globalData.user.token;
    this.setData({
      token:token
    })
    this.getData(token);
  },

  getData: function(token){
    var type = this.data.currentTab;
    var key = this.data.picListKey;
    var picList = util.getCache(key + type, false)

    if(picList){
      var pageSize = this.data.pageSize
      if(picList.length >= pageSize){
        this.setData({
          hasMore: true,
          pic_key: picList
        })
      }else{
        this.setData({
          hasMore: false,
          pic_key: picList
        })
      }
    }else{
      this.setData({
        hasMore: true
      })
      var data = {
        "pageNum": this.data.pageIndex,
        "pageSize": this.data.pageSize,
        "type": type,
        "token": token
      };
      util.getHttp(this.success, this.fail, data, "/getImage/getImageList");
    }
  },

  success:function(data){
    var picList = data.data; 
    var type = this.data.currentTab;
    var key = this.data.picListKey;
    this.setData({
      pic_key: picList
    })
    util.putCache(key + type, picList, 300);
    this.judgeHasMore(picList.length);
  },

  fail:function(){
    console.log("获取图片信息异常");
    wx.showModal({
      title: 'Sorry',
      content: '获取图片信息异常',
      showCancel: false
    })
  },

  onPicTap: (event) => {
    //target 和 currenTarget
    //target 指的点击的当前组件 而 currenTarget指的是事件捕获的组件
    var picId = event.currentTarget.dataset.picid;
    var url = './pic-detail/pic-detail?id=' + picId;
    //页面跳转
    wx.navigateTo({
      url: url,
    })
  },

  /**
   * 自定义函数
   */
  back: function () {
    wx.navigateBack({
      delta: 1
    })
  },

  upload: function () {
    var role = app.globalData.user.role

    if (role >= 2) {
      wx.navigateTo({
        url: '/pages/upload/upload',
      });
    }else{
      util.showConnectMessage();
    }
  },

  /**
   * 展示更多图片
   */
  morePic:function(){
    //从缓存中取出的数据取下pageSize个
    var type = this.data.currentTab;
    var key = this.data.picListKey;
    var picList = util.getCache(key + type, false)

    var pageSize = this.data.pageSize
    //下一页 = 缓存中的个数 / 每页个数 + 1
    var pageIndex = parseInt(picList.length / pageSize) + 1
    var token = app.globalData.user.token;
    var hasMore = this.data.hasMore;

    if(!hasMore){
      //操作提示
      wx.showToast({
        title: '无更多图片',
        icon: 'success',
        duration: 1000
      })
      return;
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

    util.getHttp(this.moreSuccess, this.fail, data, "/getImage/getImageList");
  },

  moreSuccess: function (data) {
    var picList = data.data;
    var pic_key = this.data.pic_key;
    var winHeight = this.data.winHeight;
    var type = this.data.currentTab;
    var key = this.data.picListKey;

    winHeight = winHeight - 10;

    this.judgeHasMore(picList.length);
    /**
     * 去重
     */
    var list = pic_key.concat(picList); var hash = {};
    var hash = {};
    list = list.reduce(function (item, next) {
      hash[next.id] ? '' : hash[next.id] = true && item.push(next);
      return item
    }, []);
    
    this.setData({
      pic_key: list,
      winHeight: winHeight
    })

    util.putCache(key + type, list, 300);
  
    wx.hideLoading();
  },

/**
 * 判断是否有更多图片
 */
  judgeHasMore: function(length){
    var pageSize = this.data.pageSize;

    if (length < pageSize){
      this.setData({
        hasMore: false
      })
    }else{
      this.setData({
        hasMore: true
      })
    }
    console.log("judgeHasMore hasMore: " + this.data.hasMore)
  }
})