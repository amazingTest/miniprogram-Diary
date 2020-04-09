//index.js
const app = getApp()
const util = require('../../utils/util.js');

Page({
  data: {
    stableRankLoaded: false,
    stableRank: [],
    isOnLoadHappening: false,
    currentUserRank: null,
  },

  onShareAppMessage() {
    return {
      title: app.globalData.shareTitle,
      path: '/pages/index/index?recommandOpenId=' + app.globalData.openid, //分享页面路径
      imageUrl: app.globalData.shareImg //分享图片 宽高比 5:4
    }
  },
  
  stableFilter(stable) {
    if (stable.emotionMoneyHistory){
      return true
    }else{
      return false
    }
  },

  setCurrentRank(stableRank){
    let that = this
    let currentUserOpenId = app.globalData.openid
    for (let i = 0; i < stableRank.length; i++){
      let rankOpenId = stableRank[i].openId
      if (currentUserOpenId === rankOpenId){
        that.setData({
          currentUserRank: i
        })
        return
      }
    }
  },

  getRankToast(stableRank){
    let that = this
    let toast = '加油~'
    if (that.data.currentUserRank !== null){
      let title = stableRank[that.data.currentUserRank].rankTitle
      let realRank = that.data.currentUserRank + 1
      let nickName = stableRank[that.data.currentUserRank].nickName
      toast = '财富榜第 ' + realRank + ', ' + title + ' ' + nickName + '！'
    }else{
      toast = '您尚未出现在榜单中，快去做任务赚币吧~'
    }
    return toast

  },

  formatRank(result) {
    result.forEach((el, index) => {
      if (el.emotionMoneyHistory) {
        result[index].emotionMoneyHistory = 
          util.round(el.emotionMoneyHistory, 1)

        if (index < 1) {
          result[index].rankTitle = '情绪至尊'
        } else if (index < 5) {
          result[index].rankTitle = '情绪天王'
        } else if (index < 10) {
          result[index].rankTitle = '情绪护法'
        } else if (index < 20) {
          result[index].rankTitle = '情绪护卫'
        } else {
          result[index].rankTitle = '情绪小兵'
        }
      }else{
        console.log('元素不存在 emotionMoneyHistory 属性！')
      }
    })
  },

  onLoad: function() {
    let that = this

    that.setData({
      isOnLoadHappening: true
    })

    wx.showLoading({
      title: '正在加载榜单...',
    })
    
    //调用云函数拿情绪币榜单
    wx.cloud.callFunction({
      name: 'getEmotionMoneyRank',
      data: {},
      success: res => {
        let stableRank = res.result.data
        stableRank = stableRank.filter(that.stableFilter)
        that.formatRank(stableRank)
        that.setCurrentRank(stableRank)
        that.setData({
          stableRankLoaded: true,
          stableRank,
          isOnLoadHappening: false
        })
        
        let rankToast = that.getRankToast(stableRank)
        wx.showToast({
          title: rankToast,
          icon: 'none',
          duration: 3500
        })

        console.log('[云函数] [getStableRank] rank: ', that.data.stableRank)
      },
      fail: err => {
        that.setData({
          isOnLoadHappening: false
        })
        wx.showToast({
          title: '加载失败...',
          icon: 'none'
        })
        console.error('[云函数] [getStableRank] 调用失败', err)
      }
    })
  },

  onShow: function () {
    let that = this
    if (!that.data.isOnLoadHappening){
      wx.showToast({
        title: '顶部下拉可刷新榜单~',
        icon: 'none'
      })
    }
  },

  onPullDownRefresh: function () {
    let that = this
    that.setData({
      stableRank: []
    })
    that.onLoad()
  }
})
