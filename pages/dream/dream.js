// pages/dream/dream.js
var index;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    trendsList: [
      {
        auto: false,
        seeMore: false,
        text: '小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟',
      },
      {
        auto: false,
        seeMore: false,
        text: '小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟',
      },
      {
        auto: false,
        seeMore: false,
        text: '小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟',
      },
      {
        auto: false,
        seeMore: false,
        text: '小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟',
      },
      {
        auto: false,
        seeMore: false,
        text: '小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟小老弟',
      },
    ]
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
      console.log(res[0], '所有节点信息');
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
    console.log("e.currentTarget.dataset -> " + e.currentTarget.dataset)
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
  }
})