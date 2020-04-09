//index.js
const app = getApp()
const util = require('../../utils/util.js');

Page({
  data: {
    diaries:[],
    pageLoadFailed: false,
  },

 onLoad: function() {
    // 调用云函数拿 openid
    // wx.cloud.callFunction({
    //   name: 'login',
    //   data: {},
    //   success: res => {
    //     console.log('[云函数] [login] user openid: ', res.result.openid)
    //     app.globalData.openid = res.result.openid
    //   },
    //   fail: err => {
    //     console.error('[云函数] [login] 调用失败', err)
    //   }
    // })
  },

  onShareAppMessage() {
    return {
      title: app.globalData.shareTitle,
      path: '/pages/index/index?recommandOpenId=' + app.globalData.openid, //分享页面路径
      imageUrl: app.globalData.shareImg //分享图片 宽高比 5:4
    }
  },
  
  previewDonationImage: function () {
    wx.previewImage({
      urls: ['cloud://emtionfreecloud-gai22.656d-emtionfreecloud-gai22-1300907052/images/BuddhaDonation.jpg']
    });
  },
  
  navigateToDrift(){
    wx.switchTab({
      url: '../drift/index',
    })
  },

  navigateToRank() {
    wx.switchTab({
      url: '../rank/index',
    })
  },

  onShow: function() {

    
      
  },

  refreshPage(){
    this.onShow()
  },

  onPullDownRefresh: function () {
    
  },

  navigateToDiaryWritting() {
    wx.switchTab({
      url: '../index/index',
    })
  },

  formatTime(result){
    result.data.forEach((el,index) => {
      if (el.createAt) {
        result.data[index].createAt = util.formatTime(new Date(el.createAt))
      }
    })
  }

})
