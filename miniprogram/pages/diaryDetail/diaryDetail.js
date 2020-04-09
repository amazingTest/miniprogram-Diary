// miniprogram/pages/diaryDetail.js

const app = getApp()
const util = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isInfoLoaded: false,
    diaryId: null,
    isDiaryShared:false,
    isDiariesNumLoaded: false,
    diariesNum: null,
    diaryOwner: null,
    diaryContent:null,
    diaryCreateAt: null,
    isEmotionGenerated: false,
    emotionPositive: '????',
    emotionNegative: '????',
    emotionStable: '????',
    isEmotionSaved: false,
    emotionSaveToast: '',
    emotionColor: '#00BFFF',
    pageLoadFailed: false,
    fromMy: '1', // 是否从 Tab 我的 进入
  },
  

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    wx.showLoading({
      title: '页面加载中...',
    })

    let diaryOwner = options.diaryOwner
    let diaryId = options.diaryId
    let fromMy = options.fromMy

    that.setData({
      fromMy,
      diaryOwner,
      diaryId
    })

    wx.cloud.callFunction({
      name: 'getDiary',
      data: {
        diaryId: that.data.diaryId,
      },
      success: function (res) {
        if (res.result.data.emotionPositive && res.result.data.emotionNegative && res.result.data.emotionStable){
          that.setData({
            emotionPositive: res.result.data.emotionPositive,
            emotionNegative: res.result.data.emotionNegative,
            emotionStable: res.result.data.emotionStable,
            isDiaryShared: res.result.data.isShared,
            isEmotionGenerated: true,
            isEmotionSaved: true
          })
        }
        let diaryContent = res.result.data.diary
        let diaryCreateAt = util.formatTime(new Date(res.result.data.createAt))
        let isDiaryShared = res.result.data.isShared
        that.setData({
          diaryContent,
          diaryCreateAt,
          isDiaryShared,
          isInfoLoaded: true,
          pageLoadFailed: false,
        })
      },
      fail: function (res) {
        wx.showToast({
          title: '加载失败:(',
          icon: 'none'
        })
        that.setData({
          pageLoadFailed: true,
        })
        console.log(res)
      }
    }) 

    wx.cloud.callFunction({
      name: 'getSpecificDiariesNum',
      data: {
        openId: app.globalData.openid,
      },
      success: function (res) {
        let diariesNum = res.result.total
        that.setData({
          diariesNum,
          isDiariesNumLoaded: true,
          pageLoadFailed: false,
        })
        // 需要优化
        wx.hideLoading() 
      },
      fail: function (res) {
        wx.showToast({
          title: '加载失败:(',
          icon: 'none'
        })
        that.setData({
          pageLoadFailed: true,
        })
        console.log(res)
      }
    }) 
  },

  generateDiaryEmotion: function() {

    let that = this

    wx.showLoading({
      title: '情绪生成中...',
    })
    
    wx.cloud.callFunction({
      name: 'getEmotion',
      data: {
        text: that.data.diaryContent,
      },
      success: function (res) {

        let emotionValid = res && res.result.result.data.positive &&
        res.result.result.data.negative && res.result.result.data.emotionStable

        if (emotionValid){

          that.setData({
            emotionPositive: res.result.result.data.positive,
            emotionNegative: res.result.result.data.negative,
            emotionStable: res.result.result.data.emotionStable,
          })

          let emotions = [res.result.result.data.positive, res.result.result.data.negative,
            res.result.result.data.emotionStable]
          let maximun = Math.max.apply(null, emotions)
          let emotionColor = ''
          let showToasts = []
          if (res.result.result.data.negative === maximun){
            emotionColor = '#660099'
            showToasts = ['阳光总在风雨后~', '请相信会有彩虹~', '伤心只是一时的~',
              '明天会变得更好~', '人生不易，何必烦恼~', '坚定内心，克复一切']
          } else if (res.result.result.data.positive === maximun){
            emotionColor = '#FF9900'
            showToasts = ['祝愿你每天能都拥抱快乐~', '没有什么比开心更重要~', '快乐能医治百病~',
                          '明天会过的更开心~', '快乐是幸福的源泉~', '爱笑的人运气都不会太差~']
          } else {
            emotionColor = '#00CC00'
            showToasts = ['佛系生活每一天~', '心如止水,波澜不惊~', '宁静致远, 知足常乐~',
              '不以物喜，不以己悲~', '心态平和，凡事随缘~', '树高千丈，叶落归根~']
          }
          
          let emotionSaveToast = util.randomChoiceElement(showToasts)
          that.setData({
            emotionColor,
            isEmotionGenerated: true,
            emotionSaveToast
          })

          that.saveDiaryEmotion()

        }else{
          wx.showToast({
            title: '情绪获取失败 :(',
            icon: 'none'
          })
        }

        console.log(res)

      }, 
      fail: function (res) {
        wx.showToast({
          title: '情绪生成失败 :(',
          icon: 'none'
        })
        console.log(res)
      }
    })
  },

  saveDiaryEmotion: function() {

    let that = this

    wx.showLoading({
      title: '保存中...',
    })
    console.log(that.data.isDiaryShared)
    wx.cloud.callFunction({
      name: 'updateDiary',
      data: {
        diaryId: that.data.diaryId,
        openId: app.globalData.openid,
        recommandOpenId: app.globalData.recommandOpenId || app.globalData.userData.recommandOpenId, // 日记推荐人openId
        isDiaryShared: that.data.isDiaryShared, // 日记是否公开
        emotionPositive: that.data.emotionPositive,
        emotionNegative: that.data.emotionNegative,
        emotionStable: that.data.emotionStable,
      },
      success: function (res) {

        that.setData({
          isEmotionSaved: true
        })

        let congratsToast = that.data.isDiaryShared ? ' 恭喜您收获了佛系值双倍暴击: ' + that.data.emotionStable * 2 + ' 个情绪币~' : ' 恭喜您收获了与佛系值等额: ' + that.data.emotionStable + ' 个情绪币~'

        wx.showToast({
          title: that.data.emotionSaveToast + congratsToast,
          icon: 'none',
          duration: 5000
        })

        console.log(res)
      },
      fail: function (res) {
        wx.showToast({
          title: '保存失败 :(',
          icon: 'none'
        })
        console.log(res)
      }
    })
  },

  navigateToDrift() {
    wx.switchTab({
      url: '../drift/index',
    })
  },

  refreshPage(){
    this.onLoad()
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
    let that = this
    if (!that.data.isEmotionGenerated){
      wx.showToast({
        title: '情绪值可以在「我的情绪」中点开情绪后生成~',
        icon:'none',
        duration: 5000,
      })
    } else if (!that.data.isEmotionSaved){
      wx.showToast({
        title: '情绪值可以在「我的情绪」中点开情绪后生成后保存~',
        icon: 'none',
        duration: 5000,
      })
    }
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
    return {
      title: app.globalData.shareTitle, //自定义转发标题  
      path: '/pages/index/index?recommandOpenId=' + app.globalData.openid, //分享页面路径
      imageUrl: app.globalData.shareImg //分享图片 宽高比 5:4
    }
  }
})