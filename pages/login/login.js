//index.js
//获取应用实例
const app = getApp()
var util = require("../../utils/util.js")

Page({
  data: {
    winHeight: "", //窗口高度 
    currentTab: 0, //预设当前项的值 
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    identity: "",
    dataList: [],

    picHasMore: true,
    postsHasMore: true,
    collectHasMore: true,

    picPageIndex: 1,   //分页查询页码
    postsPageIndex: 1,
    collectPageIndex: 1,

    pageSize: 10,    //分页查询数量
    dataListKey: "data_list_",  //缓存key
    isUpLevel: false,
    userCollectNum: 0
  },

  /**
   * 提升用户等级
   */
  upLevel: function () {
    var userId = app.globalData.user.userId;
    var token = app.globalData.user.token;
    var data = {
      "token": token,
      "userId": userId
    }

    util.getHttp(this.upLevelSuccess, this.fail, data, "/getImage/getCollectNumber");
  },

  upLevelSuccess: function (data) {
    var userCollectNumber = data.number;
    this.setData({
      userCollectNumber: userCollectNumber
    })

    var isUpLevel = this.data.isUpLevel;
    this.setData({
      isUpLevel: !isUpLevel
    })
  },

  getUserInfo: function (e) {
    app.globalData.userInfo = e.detail.userInfo;
    if (app.globalData.userInfo != undefined) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })

      var data = {
        token: this.data.token,
        userId: this.data.userId,
        nickName: this.data.userInfo.nickName,
        avatarUrl: this.data.userInfo.avatarUrl
      }
      //获取到用户信息之后进行用户数据填充
      util.getHttp(this.perfectUserInfo, this.fail, data, "/user/perfectUserInfo");
    }
  },

  onLoad: function () {
    var token = app.globalData.user.token;
    var userId = app.globalData.user.userId;
    this.setData({
      token: token,
      userId: userId
    })

    if (app.globalData.userInfo) {
      console.log("用户已验证，全局存在用户信息");
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      console.log("在 Page.onLoad 之后返回");
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      console.log("在没有版本兼容处理");
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }

    if (app.globalData.user && app.globalData.userInfo) {
      this.setData({
        hasUserInfo: true
      })
    }

    this.identity();

    var that = this; //  高度自适应 
    wx.getSystemInfo({
      success: function (res) {
        var clientHeight = res.windowHeight,
          clientWidth = res.windowWidth,
          rpxR = 550 / clientWidth;
        var calc = clientHeight * rpxR;
        that.setData({ winHeight: calc });
      }
    });

    //进行数据获取
    this.getData(token);
  },

  perfectUserInfo: function (data) {
    console.log("信息完善成功");
  },

  /**
   * 用户角色
   */
  identity: function () {
    //用户
    var role = app.globalData.user.role
    var userType = "";
    var identityClass = "";

    switch (role) {
      case 1:
        userType = "普 通 用 户";
        identityClass = "user";
        break;
      case 2:
        userType = "VIP 用户";
        identityClass = "vip";
        break;
      case 10:
        userType = "admin";
        identityClass = "vip";
    }

    this.setData({
      identity: userType,
      identityClass: identityClass,
      role: role
    })
  },

  // 点击标题切换当前页时改变样式 
  swichNav: function (e) {
    var cur = e.target.dataset.current;
    if (this.data.currentTaB == cur) {
      return false;
    } else {
      this.setData({
        currentTab: cur,
        dataList: []
      })
      this.getData(this.data.token)
    }
  },

  getData: function (token) {
    var cur = this.data.currentTab;
    var userId = app.globalData.user.userId;
    var type = this.data.currentTab;
    var key = this.data.dataListKey;
    var dataList = util.getCache(key + type, false);

    if (dataList) {
      this.setData({
        dataList: dataList
      })
    } else {
      var data = {
        "pageNum": this.getPageIndex(cur),
        "pageSize": this.data.pageSize,
        "type": cur,
        "userId": userId,
        "token": token
      };

      util.getHttp(this.success, this.fail, data, "/user/getDataList");
    }
  },

  getPageIndex: function (cur) {
    var pageIndex = 1
    switch (cur) {
      case 0:
        pageIndex = this.data.postsPageIndex
        break;
      case 1:
        pageIndex = this.data.picPageIndex
        break;
      case 2:
        pageIndex = this.data.collectPageIndex
        break;
    }

    return pageIndex;
  },

  /**
   * 获取对应的index（更多）
   */
  getPageIndexMore: function (cur) {
    var pageIndex = 1
    switch (cur) {
      case 0:
        pageIndex = this.data.postsPageIndex
        this.setData({
          postsPageIndex: pageIndex + 1
        })
        break;
      case 1:
        pageIndex = this.data.picPageIndex
        this.setData({
          picPageIndex: pageIndex + 1
        })
        break;
      case 2:
        pageIndex = this.data.collectPageIndex
        this.setData({
          collectPageIndex: pageIndex + 1
        })
        break;
    }

    return pageIndex;
  },

  success: function (data) {
    var type = this.data.currentTab;
    var key = this.data.dataListKey;
    var pageSize = this.data.pageSize
    var list = data.data;
    var dataList = list == null ? [] : list;
    this.setData({
      dataList: dataList
    })
    util.putCache(key + type, dataList, 300);

    this.setHasMoreStatus(type, dataList.length >= pageSize ? true : false);

    this.judgeHasMore(dataList.length);
  },

  onPicTap: (event) => {
    //target 和 currenTarget
    //target 指的点击的当前组件 而 currenTarget指的是事件捕获的组件
    var id = event.currentTarget.dataset.id;

    //页面跳转
    wx.navigateTo({
      url: '../pic/pic-detail/pic-detail?id=' + id
    })
  },

  onPostsTap: (event) => {
    var postName = event.currentTarget.dataset.postname;
    wx.navigateTo({
      url: '../edit/postEdit?postName=' + postName
    })
  },

  switchTab: function (e) {
    var dataList = this.data.dataList
    this.setData({
      currentTab: e.detail.current
    });
    this.judgeHasMore(dataList.length);
  },

  /**
   * 获取更多数据
   */
  moreData: function () {
    var pageSize = this.data.pageSize
    var type = this.data.currentTab;
    var token = app.globalData.user.token;
    var userId = app.globalData.user.userId;
    var currentTab = this.data.currentTab;
    var pageIndex = this.getPageIndexMore(currentTab)

    var hasMore = false;

    switch (currentTab) {
      case 0:
        hasMore = this.data.postsHasMore;
        break;
      case 1:
        hasMore = this.data.picHasMore;
        break;
      case 2:
        hasMore = this.data.collectHasMore;
        break;
    }

    if (!hasMore) {
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
      "userId": userId,
      "token": token
    };

    //操作提示
    wx.showLoading({ //期间为了显示效果可以添加一个过度的弹出框提示“加载中”  
      title: '加载中',
      icon: 'loading',
    });
    util.getHttp(this.moreSuccess, this.fail, data, "/user/getDataList");
  },

  moreSuccess: function (data) {
    var list = data.data;
    var dataList = this.data.dataList;
    var winHeight = this.data.winHeight;
    var type = this.data.currentTab;
    var key = this.data.dataListKey;

    winHeight = winHeight - 10;

    this.judgeHasMore(list.length);

    this.setData({
      dataList: dataList.concat(list),
      winHeight: winHeight
    })
    util.putCache(key + type, this.data.dataList, 300);
    wx.hideLoading();
  },

  /**
 * 判断是否有更多图片
 */
  judgeHasMore: function (length) {
    var pageSize = this.data.pageSize;
    var currentTab = this.data.currentTab;
    var hasMore = false;

    if (length >= pageSize) {
      hasMore = true
    }

    this.setHasMoreStatus(currentTab, hasMore);
  },

  /**
   * 设置是否有更多状态
   */
  setHasMoreStatus: function (currentTab, hasMore) {
    switch (currentTab) {
      case 0:
        this.setData({
          postsHasMore: hasMore
        })
        console.log("postsHasMore hasMore: " + this.data.postsHasMore)
        break;
      case 1:
        this.setData({
          picHasMore: hasMore
        })
        console.log("picHasMore hasMore: " + this.data.picHasMore)
        break;
      case 2:
        this.setData({
          collectHasMore: hasMore
        })
        console.log("collectHasMore hasMore: " + this.data.collectHasMore)
        break;
    }
  },

  /**
   * 升级vip取消按钮
   */
  concel: function () {
    this.setData({
      isUpLevel: false
    })
  },

  /**
   * 升级vip成功按钮
   */
  confirm: function () {
    var userCollectNumber = this.data.userCollectNumber;
    var userCollectNum = this.data.userCollectNum;
    if (userCollectNumber < userCollectNum) {
      wx.showModal({
        title: '申请 vip',
        content: '不满足条件',
        showCancel: false
      })
    } else {
      //进行数据修改
      var token = app.globalData.user.token;
      var userId = app.globalData.user.userId;

      var data = {
        "token": token,
        "userId": userId
      }

      util.getHttp(this.upSuccess, this.fail, data, "/user/upVipLevel");
    }

    this.setData({
      isUpLevel: false
    })
  },

  upSuccess: function (data) {
    wx.showToast({
      title: '申请成功',
      icon: 'success',
      duration: 1000
    })
  },

  admin: function () {
    var role = app.globalData.user.role;
    if (10 == role) {
      wx.navigateTo({
        url: '../admin/admin',
      })
    }
  }
})
