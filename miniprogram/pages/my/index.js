//index.js
const app = getApp()
const util = require('../../utils/util.js');

Page({
  data: {
    greeting:'你好',
    isPageAuthorized: false,
    isUserInfoLoaded: false,
    avatarUrl: './user-unlogin.png',
    nickName: '陌生人',
  },

  navigateToDiaryWritting() {
    wx.switchTab({
      url: '../index/index',
    })
  },

  onPullDownRefresh: function () {
    let that = this
    that.onShow()
  },

  refreshPage: function () {
    let that = this
    that.onShow()
  },

  onShow: function(){
    wx.showLoading({
      title: '页面加载中...',
    })
    let that = this
    that.getGreeting()
    if (app.globalData.userInfo) {
      that.setData({
        isPageAuthorized: true,
        avatarUrl: app.globalData.userInfo.avatarUrl,
        nickName: app.globalData.userInfo.nickName,
      })
    }
    if (app.globalData.openid){
      //调用云函数拿用户信息
      wx.cloud.callFunction({
        name: 'getUser',
        data: { openId: app.globalData.openid},
        success: res => {
          if(res){
            let userInfo = res.result.data[0]
            if (userInfo.emotionMoney){
              userInfo.emotionMoney = util.round(userInfo.emotionMoney, 1)
            }
            that.setData({
              userInfo,
              isUserInfoLoaded: true
            })
            app.globalData.userData = userInfo
            wx.hideLoading()
          }else{
            that.setData({
              isUserInfoLoaded: false
            })
            wx.showToast({
              title: '加载失败 :(',
              icon: 'none'
            })
          }

          console.log('[云函数] [getUser]: ', res)
        },
        fail: err => {
          that.setData({
            isUserInfoLoaded: false
          })
          wx.showToast({
            title: '加载失败 :(',
            icon: 'none'
          })
          console.error('[云函数] [getUser] 调用失败', err)
        }
      })
    }else{
      wx.showToast({
        title: '页面还没有准备好哦~请刷新一下',
        icon: 'none',
        duration: 4000
      })
    }
    
  },

  //获取问候语
  getGreeting() {
    let greeting = '';
    let now = new Date(), hour = now.getHours();
    if (hour < 5) { greeting = "你也睡不着吗 ):" }
    else if (hour < 9) { greeting = "早上好~" }
    else if (hour < 12) { greeting = "上午好~" }
    else if (hour < 14) { greeting = "中午好~" }
    else if (hour < 17) { greeting = "下午好~" }
    else if (hour < 19) { greeting = "傍晚好~" }
    else if (hour < 22) { greeting = "晚上好~" }
    else { greeting = "早点休息 :)" }
    this.setData({
      greeting
    })
  },


})
