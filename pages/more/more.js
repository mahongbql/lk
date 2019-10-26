// pages/more/more.js
var util = require("../../utils/util.js")
const app = getApp();

Page({
  data: {
    
  },

  onLoad(){

    var token = app.globalData.user.token;

    var data = {
      "token": token
    }

   
  }
  
})