var util = require("../../../utils/util.js")
const app = getApp();

Page({
  data: {
    //图片地址
    imgList: [],

    //屏幕高度、宽度
    windowHeight: '',
    windowWidth: '',

    //所有图片的高度  （必须）
    imgheights: [],
    //图片高度居中
    imgmargintop:[],
    //图片宽度 
    imgwidth: 750,
    //默认  （必须）
    current: 0,
    //显示图片详情
    showMsg: true,
    des: "",
    //用户是否收藏此图片
    isCollect: false
  },
  onLoad: function (options) {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        console.log(res);
        // 高度,宽度 单位为px
        that.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth
        })
      }
    });

    var token = app.globalData.user.token;

    var picId = options.id;
    this.getData(picId, token);

    this.setData({
      userInfo: app.globalData.userInfo
    })
  },

  /**
   * 获取图片详情
   */
  getData: function (picId, token){
    var data = {
      "picId": picId,
      "token": token
    };
    util.getHttp(this.success, this.fail, data, "/getImage/getImageById");
  },

  success: function(data){
    var objList = data.data;
    this.setData({
      imgList: objList,
      des: objList[0].des,
      avatarUrl: objList[0].avatarUrl,
      nickName: objList[0].nickName
    });
    this.isCollect();

    wx.showToast({
      title: '共 ' + objList.length + ' 张图片',
      icon: 'success',
      duration: 2000
    })
  },

  fail: function(){
    wx.showModal({
      title: 'Sorry',
      content: '获取图片信息异常',
      showCancel: false
    })
  },
  
  /**
   * 设置图片属性
   */
  imageLoad: function (e) {//获取图片真实宽度
    var imgwidth = e.detail.width,
    imgheight = e.detail.height,
    ratio = imgwidth / imgheight,
    percent = this.data.windowWidth / imgwidth;

    var imgmargintop = this.data.imgmargintop;

    imgmargintop[e.target.dataset.id] = (this.data.windowHeight - imgheight * percent) / 2;

    //计算的高度值
    var viewHeight = 750 / ratio;
    var imgheight = viewHeight;
    var imgheights = this.data.imgheights;
    //把每一张图片的对应的高度记录到数组里  
    imgheights[e.target.dataset.id] = imgheight;

    this.setData({
      imgheights: imgheights,
      imgmargintop: imgmargintop
    })
  },

  //图片转换
  bindchange: function (e) {
    // console.log(e.detail.current)
    this.setData({ current: e.detail.current });
    this.isCollect();
  },

  //获取用户是否收藏图片
  isCollect: function(){
    var userId = app.globalData.user.userId;
    var imageList = this.data.imgList;
    var current = this.data.current;

    console.log("current: " + current + " imageList: " + imageList);

    var id = imageList[current].id;
    var token = app.globalData.user.token;

    var data = {
      "token":token,
      "picId": id,
      "userId": userId
    }

    util.getHttp(this.collectSuccess, this.collectFail, data, "/getImage/isCollect");
  },

  collectSuccess:function(data){
    var status = data.status;
    console.log("status: " + status)
    this.setData({
      isCollect: status
    })
  },

  collectFail:function(){
    wx.showModal({
      title: 'Sorry',
      content: '获取收藏信息异常',
      showCancel: false
    })
  },

  //收藏功能
  onCollectionTip: function (event) {
    var userId = app.globalData.user.userId;
    var imageList = this.data.imgList;
    var current = this.data.current;
    var id = imageList[current].id;
    var token = app.globalData.user.token;

    var data = {
      "token": token,
      "picId": id,
      "userId": userId
    }

    var isCollect = this.data.isCollect;

    //操作提示
    wx.showToast({
      title: !isCollect ? '收藏成功' : '取消成功',
      icon: 'success',
      duration: 1000
    })

    if (!isCollect){
      util.getHttp(this.collectSuccess, this.collectFail, data, "/getImage/collect");
    }else{
      util.getHttp(this.collectSuccess, this.collectFail, data, "/getImage/cancel");
    }
  },

  //欣赏图片
  viewPic: function (e){
    var that = this;
    var id = e.target.dataset.id;
    var imgList = this.data.imgList;
    var nowImgUrl = imgList[id];

    var imgListStr = []

    for(var i = 0; i < imgList.length; i++){
      imgListStr[i] = imgList[i].path
    }

    wx.previewImage({
      current: nowImgUrl.path, // 当前显示图片的http链接
      urls: imgListStr // 需要预览的图片http链接列表
    })
  },

  downloadImg: function(){
    var imageList = this.data.imgList;
    var current = this.data.current;
    var image = imageList[current];

    wx.downloadFile({
      url: image.path,
      success: function (res) {
        console.log(res)
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: function (res) {
            console.log(res)
          },
          fail: function (res) {
            console.log(res)
            console.log('fail')
          }
        })
      },
      fail: function () {
        console.log('fail')
      }
    })
  }
});