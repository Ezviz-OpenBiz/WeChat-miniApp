

Page({

  data: {
    modalVisible: false, // 弹窗
    modalText: '', // 弹窗文案
    userType: 'C', // 默认用户类型为C用户
    applicationIcon: '', // 应用logo
    modalVisible: false,
    modalText: '当前正在体验托管设备流程，是否退出当前流程'
  },


  /**
   * 生命周期函数--监听页面卸载
   */
  onLoad: function () {
    this._getApplicationInfo()
  },

  onUnload: function () {
    
  },

  _changeUserTypeToB () {
    this.setData({
      userType: 'B'
    })
  },

  _changeUserTypeToC () {
    this.setData({
      userType: 'C'
    })
  },

  // 开始体验 
  _handdleExperience () {
    this.setData({
      modalVisible: true,
      modalText: '当前正在体验托管设备流程，是否退出当前流程'
    })
  },

  _handdleOk () {
    // wx.navigateTo({
    //   url: 'pages/experienceCenter/deviceTrust/urlConfig/urlConfig',
    // })
  },

  _handCancel () {
    this.setData({
      modalVisible: true,
    })
  },

   // 校验账户appkey
   _getApplicationInfo () {
    wx.request({
      url: 'https://openauth.ys7.com/trust/device/info?client_id=' + appKey,
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      success:(res) => {
        console.log(res);
        const data = res.data;
        if (data.code == 200) {
          console.log(data.data.logo);
          this.setData({
            applicationIcon: data.data.logo
          })
        } else {
          console.log(data.code)
        }
      },
      fail: (err)=>{
        console.log(err);
      }
    })
  },

  // 前往官网
  _goToOpenweb () {
    let url = '/pages/experienceCenter/openweb/openweb';
    wx.navigateTo({
      url: url,
    })
  }

})