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
  
  navigateToDiaryWritting(){
    wx.switchTab({
      url: '../index/index',
    })
  },

  onShow: function() {

    // 调用云函数拿 openid
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })


    let that = this
    if (app.globalData.needToLoadDiaries){
      if (app.globalData.openid){
        wx.showLoading({
          title: '加载情绪中...',
        })
        // 调用云函数拿 diaries
        wx.cloud.callFunction({
          name: 'getDiaries',
          data: { _openId: app.globalData.openid },
          success: res => {
            wx.hideLoading()
            app.globalData.needToLoadDiaries = false
            that.formatTime(res.result)
            that.setData({
              pageLoadFailed: false,
              diaries: res.result
            })
            console.log('[云函数] [getDiaries] diaries: ', that.data.diaries)
          },
          fail: err => {
            wx.showToast({
              title: '加载失败 :(',
              icon: 'none'
            })
            that.setData({
              pageLoadFailed: true
            })
            console.error('[云函数] [getDiaries] 调用失败', err)
          }
        })
      }else{
        wx.showToast({
          title: '情绪还没准备好呢~',
          icon: 'none',
          duration: 3000
        })
        that.setData({
          pageLoadFailed: true
        })
      }
    }else{
      wx.showToast({
        title: '顶部下拉可刷新情绪~',
        icon: 'none',
        duration: 3000
      })
    }
  },

  refreshPage(){
    app.globalData.needToLoadDiaries = true
    this.onShow()
  },

  onPullDownRefresh: function () {
    app.globalData.needToLoadDiaries = true
    let that = this
    that.setData({
      diaries: [],
      pageLoadFailed: false
    })
    that.onShow()
  },

  formatTime(result){
    result.data.forEach((el,index) => {
      if (el.createAt) {
        result.data[index].createAt = util.formatTime(new Date(el.createAt))
      }
    })
  }

})
