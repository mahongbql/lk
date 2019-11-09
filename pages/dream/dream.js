// pages/dream/dream.js
const app = getApp()
var util = require("../../utils/util.js")
var index;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sendData: "黄金",
    trendsList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    const query = wx.createSelectorQuery();
    query.selectAll('.textFour_box').fields({
      size: true,
    }).exec(function (res) {
      let lineHeight = 26; //固定高度值 单位：PX
      for (var i = 0; i < res[0].length; i++) {
        if ((res[0][i].height / lineHeight) > 3) {
          that.data.trendsList[i].auto = true;
          that.data.trendsList[i].seeMore = true;
        }
      }
      that.setData({
        trendsList: that.data.trendsList
      })
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  //展开更多
  toggleHandler: function (e) {
    var that = this;
    index = e.currentTarget.dataset.index;
    for (var i = 0; i < that.data.trendsList.length; i++) {
      if (index == i) {
        that.data.trendsList[index].auto = true;
        that.data.trendsList[index].seeMore = false;
      }
    }
    that.setData({
      trendsList: that.data.trendsList
    })
  },
  //收起更多
  toggleContent: function (e) {
    var that = this;
    index = e.currentTarget.dataset.index;
    for (var i = 0; i < that.data.trendsList.length; i++) {
      if (index == i) {
        that.data.trendsList[index].auto = true;
        that.data.trendsList[index].seeMore = true;
      }
    }
    that.setData({
      trendsList: that.data.trendsList
    })
  },
  SearchConfirm: function(e) {
      //发送请求，默认发送 ‘黄金’
      //输入框获取用户输入
    var sendData = this.data.sendData
    console.log(sendData);
    var data = {
      token: app.globalData.user.token,
      q: sendData
    }
    util.getHttp(this.getDreamSuccess, this.fail, data, "/publicApi/getDreamAnalytical");
  },
  getDreamSuccess: function(data) {
    var result = data.dreamAnalyticalDetails;
    console.log(result);
    var trendsLists = [];
    for(var i = 0; i < result.length; i++) {
      var resultData = result[i];
      var msg = (i + 1) + " : " + resultData.title + "\n";
      //封装解析的des描述阶段
      msg += "简述 ：" + "\n &nbsp;&nbsp;&nbsp;&nbsp;" + (resultData.des + "\n");
      //封装各个部分不同角度的解析
      var list = resultData.list;
      for(var j = 0; j < list.length; j++) {
        msg += "&nbsp;&nbsp;&nbsp;&nbsp;角度 " + (j + 1) + " ：\n &nbsp;&nbsp;&nbsp;&nbsp;" + list[j];
        if (j != list.length) {
          msg += "\n"
        }
      }
      var dreamModel = {
        auto: false,
        seeMore: false,
        text: msg
      }
      trendsLists.push(dreamModel);
    }
    this.setData({
      trendsList: trendsLists
    })
  },
  SearchInput: function(e) {
    this.setData({
      sendData: e.detail.value
    })
  }
})