// const host = "https://www.luckydogma.work";
// const host = "http://192.168.1.9:8080";
const host = "http://127.0.0.1:8080";

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/**
 * 发送请求 POST
 */
function http(callBackSuccess, callBackFail, data, url) {
  var _this = this
  wx.request({
    url: host + url,
    data: data,
    header: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    method: 'POST',
    success: function (res) {
      var data = res.data;
      if (1001 == data.code){
        wx.showModal({
          title: '错误',
          content: data == null ? "" : data.msg,
          showCancel: false
        })
        return;
      }
      callBackSuccess(data.data)
    },
    fail: callBackFail
  })
}

/**
 * 发送请求 GRT
 */
function getHttp(callBackSuccess, callBackFail, data, url) {
  var _this = this
  wx.request({
    url: host + url,
    data: data,
    header: {
      "Content-Type": "json"
    },
    method: 'GET',
    success: function (res) {
      var data = res.data;
      if (1001 == data.code) {
        wx.showModal({
          title: '错误',
          content: data == null ? "" : data.msg,
          showCancel: false
        })
        return;
      }

      callBackSuccess(data.data)
    },
    fail: callBackFail
  })
}

function putCache(key, val, time) {
  wx.setStorageSync(key, val)
  var seconds = parseInt(time);
  if (seconds > 0) {
    var timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000 + seconds;
    wx.setStorageSync(key + 'dtime', timestamp + "")
    console.log("放入缓存【" + key + 'dtime' + "】失效时间为：" + timestamp)
  } else {
    wx.removeStorageSync(key + 'dtime')
    console.log("clear cache【" + key + 'dtime】')
  }
}

function getCache(key, def) {
  var deadtime = parseInt(wx.getStorageSync(key + 'dtime'))

  if (!deadtime){
    console.log("缓存【" + key + "】无失效时间");
    return def;
  }

  if (deadtime) {
    console.log("缓存【" + key + "】失效时间剩余：" + deadtime);
    if (parseInt(deadtime) < Date.parse(new Date()) / 1000) {
      if (def) { return def; } else { return; }
    }
  }

  var res = wx.getStorageSync(key);

  if (res) {
    return res;
  } else {
    return def;
  }
}

function getUserData(code, success, fail){
  wx.request({
    url: host + "/user/login",
    data: { resCode: code },
    header: {
      "Content-Type": "json"
    },
    method: 'GET',
    success: success,
    fail: fail
  })
}

function showConnectMessage(){
  wx.showModal({
    title: '错误提示',
    content: '无权限上传，详情联系:\n qq:1318380423',
    showCancel: false
  })
}

module.exports = {
  formatTime: formatTime,
  host:host,
  showConnectMessage: showConnectMessage,
  http: http,
  getHttp: getHttp,
  putCache: putCache,
  getCache: getCache,
  getUserData: getUserData
}
