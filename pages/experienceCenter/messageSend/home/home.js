Page({
  data: {
    server_instruction_text: '提供设备消息上行传输和下载的能力，可实现智能联动，消息监控等功能',
    audio_src: 'http://resource.eziot.com/group2/M00/00/60/CtwQFmDR2iaAUo-HAAli5sCANhI869.m4a',
    audioName: '消息推送',
    // 服务优势
    advantageList: [{
      url: '/pages/experienceCenter/images/icon-daodalv.png',
      title: '到达率高',
      tip: '订阅消息准确率高达99%'
    },{
      url: '/pages/experienceCenter/images/icon-sudukuai.png',
      title: '处理速度快',
      tip: '消息延迟低，延迟时间在200-400ms'
    },{
      url: '/pages/experienceCenter/images/icon_anquan.png',
      title: '信息安全',
      tip: '图文多重加密，保障信息安全'
    }],
    // 价格
    priceContent: {
      type: 'free', // table/list/free
      data:[],
      tips: '', // 备注信息
    },

    pageScroll: false, //滚动
    
  },

  onLoad: function (options) {
   
  },

  onHide: function () {
    console.log('离开home');
    this.serverInstruction = this.selectComponent("#serverInstruction-container");
    this.serverInstruction.__proto__._stopVoice();
  },

  _goToOpenweb () {
    let url = '/pages/experienceCenter/openweb/openweb';
    wx.navigateTo({
      url: url,
    })
  },

   // 监听页面滚动
   _pageScroll (e) {
    const { scrollTop } = e.detail;
    if (scrollTop > 0) {
      this.setData({
        pageScroll: true
      })
    } 
  },
  // 前往专家咨询
  _handdleToExperienceApply () {
    const { pageScroll } = this.data;
    if (pageScroll == true) {
      this.setData({
        pageScroll: false
      });
      return
    } else {
      wx.navigateTo({
        url: '/pages/component/experienceApply/experienceApply',
      })
    }
  }
  
});
