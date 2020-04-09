//index.js
const app = getApp()

var util = require('../../utils/util.js');

Page({
  data: {
    greeting: '',
    userInfo:{isLoaded: false},
    inputDiary: '',
    inputDiaryChineseWordNum: 0,
    isDiaryShared: false,
    diarylowerLimit: 10,
    diaryUpperLimit: 100,
    shareCheckBox: app.globalData.shareCheckBox || {
      name: 'changeShareCheckBox',
      value: '公开情绪赚双倍情绪币~',
      checked: false
    },
    saveDiaryButtonDisabled: false,
    authorizedButtonDisabled: false,
    diariesPermitInterval: 1,
    pageLoadFailed: false,
    frontendFormat: 1,
    isfrontendFormatLoaded: false,
    emotionRadios: [{value: '我今天真的过得特别开心啊~', name: '开心', checked: true},
      { value: '我今天过得比较难过呢~', name: '难过'},
      { value: '今天真的是气死我了啊！', name: '愤怒' },
      { value: '哈哈哈哈今天心情真是不错~', name: '喜悦' }],
  },  
  
  onLoad: async function (options) {
    
    let that = this
    let recommandOpenId = options.recommandOpenId
    //console.log(recommandOpenId)
    if (recommandOpenId){
      app.globalData.recommandOpenId = recommandOpenId
    }else{
      // 埋坑
    }
    wx.showLoading({
      title: '页面正在加载中...',
    })

    let isFromSearch = !(app.globalData.recommandOpenId)
    console.log('是否来源于自然搜索（非用户推荐而来）: ' + isFromSearch)
    // change frontend format
    await wx.cloud.callFunction({
      name: 'changeFrontendFormat',
      data: {isFromSearch},
      success: res => {
        app.globalData.frontendFormat = res.result
        that.setData({
          frontendFormat: res.result,
          isfrontendFormatLoaded: true,
          pageLoadFailed: false
        })
        console.log('[云函数] [frontendFormat] : ', app.globalData.frontendFormat)
      },
      fail: err => {
        that.setData({
          isfrontendFormatLoaded: false,
          pageLoadFailed: true
        })
        console.error('[云函数] [frontendFormat] 调用失败', err)
      }
    })

    // 调用云函数拿 openid
    await wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => { 
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        that.setData({
          pageLoadFailed: false
        })
      },
      fail: err => {
        wx.showToast({
          title: '您可能是断网了:(',
          icon: 'none'
        })
        that.setData({
          pageLoadFailed: true
        })
        console.error('[云函数] [login] 调用失败', err)
      }
    })

    that.checkAuthSetting();
    
  },

  onShow: async function () {
    let that = this
    that.setData({
      saveDiaryButtonDisabled: false,
      authorizedButtonDisabled: false
    })
    that.getGreeting();
  },

  onShareAppMessage() {
    return {
      title: app.globalData.shareTitle,
      path: '/pages/index/index?recommandOpenId=' + app.globalData.openid, //分享页面路径
      imageUrl: app.globalData.shareImg //分享图片 宽高比 5:4
    }
  },

  onRadioChange: function(e){
    let that = this
    let emotionRadios = [{ value: util.randomChoiceElement(app.globalData.preparedEmotions.happy), name: '开心'},
      { value: util.randomChoiceElement(app.globalData.preparedEmotions.sad), name: '难过' },
      { value: util.randomChoiceElement(app.globalData.preparedEmotions.angry), name: '愤怒' },
      { value: util.randomChoiceElement(app.globalData.preparedEmotions.cheerful), name: '喜悦' }]
    that.setData({
      inputDiary: e.detail.value,
      emotionRadios
    })
    console.log(e)
  },

  shareCheckboxChange: function (e) {
    let that = this
    let isDiaryShared = e.detail.value.length > 0
    that.setData({
      isDiaryShared
    })
    // console.log('isDiaryShared值为：', that.data.isDiaryShared)
  },

  refreshPage(){
    this.onLoad()
  },

  // 判断距离上一篇日记是否已经超过了一天（日期不同即可）
  // checkDiaryPermit(openId, diariesPermitInterval){
  //   let that = this
  //   // 调用云函数拿 createAt
  //   wx.cloud.callFunction({
  //     name: 'checkDiaryPermit',
  //     data: {
  //        openId: openId,
  //        diariesPermitInterval: diariesPermitInterval
  //     },
  //     success: res => {
  //       that.setData({
  //         isPermitNewDiary: res
  //       })
  //       console.log('[云函数] [checkDiaryPermit] : ', res)
  //     },
  //     fail: err => {
  //       console.error('[云函数] [checkDiaryPermit] 调用失败', err)
  //     }
  //   })
  // },

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


  // 检测权限，在旧版小程序若未授权会自己弹起授权
  checkAuthSetting() {
    let that = this
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: async (res) => {
              if (res.userInfo) {
                const userInfo = res.userInfo
                // 将用户数据放在临时对象中，用于后续写入数据库
                that.setUserTemp(userInfo)
                app.globalData.userInfo = userInfo
              }
              const userInfo = that.data.userInfo || {}
              userInfo.isLoaded = true
              that.setData({
                userInfo,
                isAuthorized: true,
                pageLoadFailed: false
              })
              console.log(that.data)
            },
            fail: async (res) => {
              that.setData({
                pageLoadFailed: true
              })
              console.log(res)
            }
          })
        } else {
          this.setData({
            userInfo: {
              isLoaded: true,
              pageLoadFailed: false
            }
          })
        }
        wx.hideLoading()
      },
    fail: (res) => {
      that.setData({
        pageLoadFailed: true
      })
      console.log(res)
    }
    })
  },

  // 设置临时数据，待 “真正登录” 时将用户数据写入 collection "users" 中
  setUserTemp(userInfo = null, isAuthorized = true, cb = () => { }) {
    this.setData({
      userTemp: userInfo,
      isAuthorized,
    }, cb)
  },

  // 查看是否是新用户
  // async isNewUser(openId){
  //   wx.cloud.callFunction({
  //     name: 'checkUser',
  //     data: {
  //       openId: openId
  //     },
  //     success: res => {
  //       console.log('[云函数] [checkUser]: 调用成功', res)

  //       if (res.total && res.total > 0){
  //         return false
  //       }else{
  //         return true
  //       }
  //     },
  //     fail: err => {
  //       console.error('[云函数] [checkUser] 调用失败', err)
  //       return true
  //     }
  //   })
  // },

  // 手动获取用户数据
  async bindGetUserInfoNew(e) {
    let that = this
    if (!e.detail.userInfo){
      wx.showToast({
        title: '授权一下嘛~',
        icon: 'none'
      })
    }else{
      that.setData({
        authorizedButtonDisabled: true
      })
      wx.showToast({
        title: '授权成功:)',
      })

      const userInfo = e.detail.userInfo
      // 将用户数据放在临时对象中，用于后续写入数据库
      this.setUserTemp(userInfo)
      app.globalData.userInfo = userInfo

      let createUserData = {
        openId: app.globalData.openid,
        userInfo: this.data.userTemp
      }

      if (app.globalData.recommandOpenId){
        createUserData.recommandOpenId = app.globalData.recommandOpenId
      }

      // 调用云函数新建用户
      wx.cloud.callFunction({
        name: 'createUser',
        data: createUserData,
        success: res => {
          console.log('[云函数] [createUser]: 调用成功', res)
        },
        fail: err => {
          console.error('[云函数] [createUser] 调用失败', err)
        }
      })
    }
  },

  checkChineseWord: function (str, lowerLimit = this.data.diarylowerLimit, upperLimit = this.data.diaryUpperLimit){
    let checkResult = {'status': 'ok', 'showToast': ''}
    let re = /[\u4E00-\u9FA5]/g
    if (str && re.test(str)){
      if (str.match(re).length < lowerLimit){
        checkResult.status = 'failed'
        checkResult.showToast = '请输入至少 ' + lowerLimit + ' 个汉字~'
        return checkResult
      } else if (str.match(re).length > upperLimit){
        checkResult.status = 'failed'
        checkResult.showToast = '最多只能输入 ' + upperLimit + ' 个汉字哦~'
        return checkResult
      }else{
        return checkResult
      }
    }else{
      checkResult.status = 'failed'
      checkResult.showToast = '请输入汉字~'
      return checkResult
    }
  },

  getChineseWordNum: function(str){
    let re = /[\u4E00-\u9FA5]/g
    if (str && re.test(str)){
      return str.match(re).length
    }else{
      return 0
    }
  },

  bindDiaryInput: function (e) {
    this.setData({
      inputDiary: e.detail.value
    })
    let chineseWordNum = this.getChineseWordNum(this.data.inputDiary)
    this.setData({
      inputDiaryChineseWordNum: chineseWordNum
    })
  },

  sendDiary: function(){
    let that = this
    wx.cloud.callFunction({
      name: 'sendDiary',
      data: {
        createAt: new Date(),
        nickName: that.data.userTemp.nickName,
        gender: that.data.userTemp.gender,
        avatarUrl: that.data.userTemp.avatarUrl,
        openId: app.globalData.openid,
        diary: that.data.inputDiary,
        isDiaryShared: that.data.isDiaryShared,
        diariesPermitInterval: that.data.diariesPermitInterval,
      },
      success: function (res) {
        
        if (res.result === 'notPermitted'){
          that.setData({
            saveDiaryButtonDisabled: false,
          })
          wx.showToast({
            title: '你今天已经写过情绪啦~',
            icon: 'none'
          })
        }else{
          app.globalData.needToLoadDiaries = true

          wx.showToast({
            title: '保存成功',
            duration: 1000
          })

          console.log(res)

          let diaryId = res.result._id
          let diaryOwner = that.data.userTemp.nickName

          wx.showLoading({
            title: '页面跳转中...',
          })

          that.setData({
            inputDiary: '',
            inputDiaryChineseWordNum: 0
          })

          wx.navigateTo({
            url: '../diaryDetail/diaryDetail?diaryId='
              + diaryId + '&diaryOwner=' + diaryOwner + '&fromMy=0',
          })
          
          wx.hideLoading()
        }
      },
      fail: function (res) {
        that.setData({
          saveDiaryButtonDisabled: false,
        })
        wx.showToast({
          title: '保存失败:(',
          icon: 'none'
        })
        console.log(res)
      }
    })
  },

  saveDiary: function(){
    
    let that = this
    let inputDiary = that.data.inputDiary
    let checkDiaryContent = that.checkChineseWord(inputDiary)
    if (checkDiaryContent.status === 'ok'){

      wx.requestSubscribeMessage({
        tmplIds: ['-csBIWqHbI1ConN8VY5WaXt3lJf60dHJjcOoGjl6I2E'],
        success(res) {
          if (res['-csBIWqHbI1ConN8VY5WaXt3lJf60dHJjcOoGjl6I2E'] === 'accept'){
            console.log('有人接受了签到提醒: ' + app.globalData.openid)
            // 更新 User 数据
            wx.cloud.callFunction({
              name: 'updateUser',
              data: {
                openId: app.globalData.openid,
                isSubscribeMessage: true,
              },
              success: function (res) {
                console.log(res)
              },
              fail: function (res) {
                console.log(res)
              }
            })
          } else if (res['-csBIWqHbI1ConN8VY5WaXt3lJf60dHJjcOoGjl6I2E'] === 'reject'){
            console.log('有人拒绝了签到提醒: ' + app.globalData.openid)
          }
         }
      })

      wx.showModal({
        title: '保存后不可更改哦~',
        content: '点击确定保存',
        success: function (res) {
          if (res.confirm){
            that.setData({
              saveDiaryButtonDisabled: true,
            })
            wx.showLoading({
              title: '保存中...'
            })
            that.sendDiary()
          }else{
            wx.showToast({
              title: util.randomChoiceElement(['情绪可马虎不得~', '确实要谨慎对待~', '先想清楚再做决定~']),
              icon: 'none',
            })
          }
        }
      })
    }else{
      wx.showToast({
        title: checkDiaryContent.showToast,
        icon: 'none',
      })
    }
  },
})


