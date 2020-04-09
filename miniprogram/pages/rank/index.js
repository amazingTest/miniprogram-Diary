//index.js
const app = getApp()
const util = require('../../utils/util.js');

Page({
  data: {
  },

  onShareAppMessage() {
    return {
      title: app.globalData.shareTitle,
      path: '/pages/index/index?recommandOpenId=' + app.globalData.openid, //分享页面路径
      imageUrl: app.globalData.shareImg //分享图片 宽高比 5:4
    }
  },
  

  navigateToBuddhaRank(){
    wx.navigateTo({
      url: '../buddhaRank/buddhaRank',
    })
  },

  navigateToMoneyRank() {
    wx.navigateTo({
      url: '../emotionMoneyRank/emotionMoneyRank',
    })
  },

  navigateToSalvageRank() {
    wx.navigateTo({
      url: '../salvageRank/salvageRank',
    })
  },

  navigateToSuccessiveRank() {
    wx.navigateTo({
      url: '../successiveDiariesRank/successiveDiariesRank',
    })
  },


})
