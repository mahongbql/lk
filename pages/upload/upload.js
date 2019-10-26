// pages/upload/upload.js
const app = getApp()

const util = require("../../utils/util.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    array: ['生活随拍', '自然风光', '书法绘画', '美女靓图'],
    index: 0,           //默认图片选择类型为 '生活随拍'
    img_arr: [],       //图片数组
    maxUploadNumber: 10,   //图片上传数量限制
    minUploadNumber: 5, 
    uploadId: 0,       //图片上传的批次
    userId: 0,         //用户id
    userIcon: null,     //用户头像
    token: "",         //会话token
    existpic:false,    //是否选择了图片
    existText:false,    //是否有图片描述
    des:null,
    isAllowedUpload: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var role = app.globalData.user.role
    var userInfo = app.globalData.userInfo;
  
    if (null == userInfo){
      wx.navigateTo({
        url: '../login/login'
      })
      return
    }

    this.setData({
      userId: app.globalData.user.userId,
      userIcon: app.globalData.userInfo,
      token: app.globalData.user.token,
      userIcon: userInfo.avatarUrl,
      role: role
    });

    this.checkAuth();
  },

  /**
   * 自定义函数
   */
  bindChooiceProduct: function () {
    var auth = this.checkAuth();
    var that = this;

    //开始选择图片
    if(auth){
      wx.chooseImage({
        count: that.data.uploadNumber,  //最多可以选择的图片总数  
        sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有  
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有  
        success: function (res) {
          // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片  
          var tempFilePaths = res.tempFilePaths;

          var timestamp = Date.parse(new Date()) / 1000;

          that.setData({
            img_arr: that.data.img_arr.concat(tempFilePaths),
            uploadId: timestamp + that.data.userId,
            existpic: true
          })
        }
      });
    }
    
  },
  bindUploadProduct: function () {
    this.checkAuth();

    var that = this;
    var tempFilePaths = this.data.img_arr;
    var maxUploadNumber = this.data.maxUploadNumber;
    var minUploadNumber = this.data.minUploadNumber;

    if (tempFilePaths > maxUploadNumber || tempFilePaths < minUploadNumber){
      wx.showModal({
        title: '错误提示',
        content: '上传张数范围: ' + minUploadNumber + " - " + maxUploadNumber,
        showCancel: false
      })
      return;
    } else if (0 == tempFilePaths){
      wx.showModal({ 
        title: 'Dear',
        content: '请选择图片',
        showCancel: false
      })
      return;
    }

    that.setData({
      existText: true
    })
  },
  textInput:function(e){
    this.setData({
      des: e.detail.value
    })
  },
  onConfirm: function () {
    var that = this;
    var tempFilePaths = this.data.img_arr;
    var imageNumberLimit = this.data.uploadNumber;
    var avatarUrl = that.data.userIcon;
    var index = this.data.index;
    var des = this.data.des;

    if(0 == des.length || des.length > 20){
      console.log("图片描述不合规");
      wx.showModal({
        title: 'Dear',
        content: '图片描述不可为空',
        showCancel: false
      })
      return;
    }

    if (null == avatarUrl){
      console.log("用户未登录，无法获取用户资料");
      wx.navigateTo({
        url: '../login/login'
      })
    }
    
    //启动上传等待中...  
    wx.showToast({
      title: '正在上传...',
      icon: 'loading',
      mask: true
    })
    var uploadImgCount = 0;

    for (var i = 0, h = tempFilePaths.length; i < h; i++) {
      wx.uploadFile({
        url: util.host + "/fileUpload/upload",
        filePath: tempFilePaths[i],
        name: 'file',
        formData: {
          "uploadId": that.data.uploadId,
          "token": that.data.token,
          "des": des,
          "type": index
        },
        header: {
          "Content-Type": "multipart/form-data"
        },
        success: function (res) {
          var filename = res.data;
          uploadImgCount += 1;
          //如果是最后一张,则隐藏等待中  
          if (uploadImgCount == tempFilePaths.length) {
            wx.hideToast();
          }
        },
        fail: function (res) {
          wx.hideToast();
          wx.showModal({
            title: '错误提示',
            content: 'VIP会员方可上传',
            showCancel: false,
            success: function (res) { }
          })
        }
      });
    }
    this.setData({
      existText: false
    })
  },
  deleteImage: function(e){
    var that = this;
    var index = e.currentTarget.dataset.index;//获取当前长按图片下标
    var images = this.data.img_arr;

    wx.showModal({
      title: '提示',
      content: '确定要删除此图片吗？',
      
      success: function (res) {
        if (res.confirm) {
          console.log('点击确定了');
          images.splice(index, 1);
          if (0 == images.length){
            console.log("图片已清空")
            that.setData({
              existpic:false,
              existText: false
            })
          }
        } else if (res.cancel) {
          console.log('点击取消了');
          return false;
        }
        that.setData({
          img_arr: images
        })
      }
    })
  },

  /**
   * 按钮动作（确定和取消）
   */
  onCancel:function(){
    this.setData({
      existText:false
    })
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

  checkAuth: function(){
    if (this.data.role < 2) {
      wx.navigateTo({
        url: '../login/login'
      })

      this.setData({
        isAllowedUpload: false
      })

      return false;
    }else {
      this.setData({
        isAllowedUpload: true
      })

      return true;
    }
  }
})