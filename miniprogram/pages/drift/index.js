//index.js
const app = getApp()
const util = require('../../utils/util.js');

Page({
  data: {
    isPageAuthorized: false,
    diaryId: '',
    diaryOwnerOpenId: '',
    diaryContent: '?????????????????????????????',
    diaryCreateAt: '???? 年 ?? 月 ?? 日',
    diaryAuthor: '??????',
    thumbUpNum: '???',
    remainedSharedDiariesNum: null,
    likeImageSrc:'/images/like/like-off.png',
    pageLoadFailed: false,
    isInfoLoaded: false,
    isOpenIdLoaded: false,
    isSalvagingDiariesLoaded: false,
    isSalvagingDiaries: false,
    likeButtonDisabled: true,
    isOnLoadHappening: false,
    isRandom: true,
    diariesNum: 1,
    ownerName: null,
    gambleMoney: 100,

  },

  onShareAppMessage() {
    return {
      title: app.globalData.shareTitle,
      path: '/pages/index/index?recommandOpenId=' + app.globalData.openid, //分享页面路径
      imageUrl: app.globalData.shareImg //分享图片 宽高比 5:4
    }
  },
  
  navigateToDiaryWritting() {
    wx.switchTab({
      url: '../index/index',
    })
  },

  onShow: function () {
    let that = this
    if (app.globalData.openid && app.globalData.userInfo) {
      that.setData({
        isPageAuthorized: true,
        isOpenIdLoaded: true,
      })

      if (!that.data.isOnLoadHappening){
        wx.showToast({
          title: '顶部下拉可刷新漂流池~',
          icon: 'none'
        })
      }
    }
  },

  onLoad: function() {
    wx.showLoading({
      title: '页面正在加载中...',
    })

    let that = this
    
    that.setData({
      isOnLoadHappening: true,
    })

    if (app.globalData.openid && app.globalData.userInfo){
      that.setData({
        isOpenIdLoaded: true,
        isPageAuthorized: true,
      })
      wx.cloud.callFunction({
        name: 'getSharedDiariesNum',
        data: {
          openId: app.globalData.openid
        },
        success: function (res) {
          if(res){
            let remainedSharedDiariesNum = res.result.total
            that.setData({
              remainedSharedDiariesNum,
              isInfoLoaded: true,
              pageLoadFailed: false,
              isOnLoadHappening:false,
            })
            wx.hideLoading()
          }else{
            that.setData({
              pageLoadFailed: true
            })
            wx.showToast({
              title: '加载失败:(',
              icon: 'none'
            })
          }
          console.log(res)
        },
        fail: function (res) {
          wx.showToast({
            title: '数据获取失败 :(',
            icon: 'none'
          })
          that.setData({
            isOnLoadHappening: false,
          })
          console.log(res)
        }
      })
      
    }else{
      that.setData({
        pageLoadFailed: true,
        isOnLoadHappening: false,
      })
      wx.showToast({
        title: '加载失败:(',
        icon: 'none'
      })
    }
  },

  getSharedDiaries: function (){
    let that = this
    that.setData({
      isSalvagingDiaries: true
    })
    wx.showModal({
      title: '需要花费 100 情绪币~',
      content: '决定好了吗？',
      success: function (res) {
        if (res.confirm) {
          wx.showLoading({
            title: '打捞情绪中...',
          })
          wx.cloud.callFunction({
            name: 'salvageDiaries',
            data: {
              openId: app.globalData.openid,
              isRandom: that.data.isRandom,
              diariesNum: that.data.diariesNum,
              ownerName: that.data.ownerName,
              gambleMoney: that.data.gambleMoney
            },
            success: res => {
              if (res){
                let result = res.result
                if (result == 'notEnoughEmotionMoney') {
                  wx.showToast({
                    title: '你的情绪币不足哦~ 快去做任务赚取情绪币吧 :)',
                    icon: 'none'
                  })
                } else if (result === 'gambleFailed') {
                  // 埋坑
                } else if (result.length < 1){
                  wx.showToast({
                    title: '情绪都被你看完啦！快去邀请好友一起写情绪吧 :)',
                    icon: 'none',
                    duration: 2500,
                  })
                } else {
                  let diaryId = result[0]._id
                  let diaryOwnerOpenId = result[0].openId
                  // let diaryAuthor = result[0].nickName // 匿名日记
                  let diaryCreateAt = util.formatTime(new Date(result[0].createAt))
                  let diaryContent = result[0].diary
                  let thumbUpNum = result[0].thumbUpNum || 0

                  that.onLoad()

                  that.setData({
                    likeImageSrc: '/images/like/like-off.png',
                    diaryId,
                    diaryOwnerOpenId,
                    // diaryAuthor,
                    diaryCreateAt,
                    diaryContent,
                    thumbUpNum,
                    likeButtonDisabled: false,
                    isSalvagingDiariesLoaded: true
                  })

                  wx.hideLoading()
                }
              }else{
                wx.showToast({
                  title: '打捞失败 :(',
                })
              }
              that.setData({
                isSalvagingDiaries: false
              })
              console.log('[云函数] [salvageDiaries]: ', res.result)
            },
            fail: err => {
              console.error('[云函数] [salvageDiaries] 调用失败', err)
              wx.showToast({
                title: '打捞失败 :(',
                icon: 'none'
              })
              that.setData({
                isSalvagingDiaries: false
              })
            }
          })
        } else {
          wx.showToast({
            title: util.randomChoiceElement(['打捞可马虎不得~', '确实要谨慎对待~', '先想清楚再做决定~']),
            icon: 'none',
          })
          that.setData({
            isSalvagingDiaries: false
          })
        }
      }
    })
  },

  refreshPage() {
    this.onLoad()
  },

  thumbUpDiary(){
    let that = this
    if (that.data.likeButtonDisabled){
      wx.showToast({
        title: util.randomChoiceElement(['我知道你真的特别有爱心~', '赶紧打捞下一篇情绪吧~']),
        icon: 'none',
      })
    }else{
      wx.cloud.callFunction({
        name: 'updateDiary',
        data: {
          openId: app.globalData.openid,
          diaryId: that.data.diaryId,
          diaryOwnerOpenId: that.data.diaryOwnerOpenId,
          pushThumbUpList: true
        },
        success: function (res) {

          that.setData({
            likeButtonDisabled: true,
            likeImageSrc: '/images/like/like-on.png',
            thumbUpNum: that.data.thumbUpNum + 1,
          })

          wx.showToast({
            title: util.randomChoiceElement(['感谢您的爱心~ ❥(^_-)', '世界将因你变得更美好~', '赠人玫瑰，手有余香~']),
            icon: 'none',
            duration: 3000
          })

          console.log(res)
        },
        fail: function (res) {
          wx.showToast({
            title: '点赞失败 :(',
            icon: 'none'
          })
          console.log(res)
        }
      })
    }
    
  },

  onPullDownRefresh: function () {
    this.refreshPage()
  },

  formatTime(result){
    result.data.forEach((el,index) => {
      if (el.createAt) {
        result.data[index].createAt = util.formatTime(new Date(el.createAt))
      }
    })
  }

})
