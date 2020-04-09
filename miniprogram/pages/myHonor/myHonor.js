//index.js
const app = getApp()
const util = require('../../utils/util.js');

Page({
  data: {
    honorCreateAt: '',
    honorContent: '',
    pageLoadFailed: false,
  },

 onShow: function() {
   wx.showLoading({
     title: '页面加载中...',
     icon: 'none'
   })
   let that = this
   if (app.globalData.userData){
     that.setData({
       userInfo: app.globalData.userData,
       pageLoadFailed: false
     })
     that.getHonorCreateAt()
     that.getHonorContent()
     wx.hideLoading()
   }else{
     that.setData({
       pageLoadFailed: true
     })
     wx.showToast({
       title: '加载失败...',
       icon: 'none'
     })
   }
  },

  getHonorCreateAt() {
    let that = this
    that.setData({
      honorCreateAt: util.formatTime(new Date())
    })

  },

  previewDonationImage: function () {
    wx.previewImage({
      urls: ['cloud://emtionfreecloud-gai22.656d-emtionfreecloud-gai22-1300907052/images/BuddhaDonation.jpg']
    });
  },

  getHonorContent(){
    let that = this
    let now = new Date()
    let userInfo = that.data.userInfo
    let accompanyTime = Math.floor((now - new Date(userInfo.createAt)) / (24 * 60 * 60 * 1000)) || 0
    let diariesNum = userInfo.diariesNum || 0
    let currentSuccessiveDiariesNum = userInfo.currentSuccessiveDiariesNum || 0
    let emotionMoneyHistory = userInfo.emotionMoneyHistory || 0
    let salvageDiariesNum = userInfo.salvageDiariesNum || 0
    let thumbUpDiariesNum = userInfo.thumbUpDiariesNum || 0
    let recommandEmotionDiariesNum = userInfo.recommandEmotionDiariesNum || 0

    let honorSentence_1 = '不知不觉，我已经与情绪小日记携手度过了 ' + accompanyTime + ' 天。'
    let honorSentence_2 = '在这段旅程中，我一共写了 ' + diariesNum + ' 篇情绪，'
    let honorSentence_3 = '我现在已经连续坚持 ' + currentSuccessiveDiariesNum + ' 天不断更了。'
    let honorSentence_4 = '目前为止，我已经收获了 ' + util.round(emotionMoneyHistory, 1) + ' 枚情绪币，'
    let honorSentence_5 = '邀请好友创造了 ' + recommandEmotionDiariesNum + ' 篇情绪，'
    let honorSentence_6 = '成功打捞了 ' + salvageDiariesNum + ' 篇情绪，' 
    let honorSentence_7 = '给其中 ' + thumbUpDiariesNum + ' 篇情绪赠予了我的爱心。'
    let honorSentence_8 = '在接下来的日子里，我会与情绪小日记共同前行，为这个世界传播更多的爱与善意。'

    let honorContent = honorSentence_1 + honorSentence_2 + honorSentence_3 + honorSentence_4 + honorSentence_5 + honorSentence_6 + honorSentence_7 + honorSentence_8

    that.setData({
      honorContent
    })
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


  refreshPage(){
    this.onShow()
  },

  onPullDownRefresh: function () {
    
  },

  formatTime(result){
    result.data.forEach((el,index) => {
      if (el.createAt) {
        result.data[index].createAt = util.formatTime(new Date(el.createAt))
      }
    })
  }

})
