Page({
  data: {
    
    server_instruction_text: '可以帮助开发者用户安全获取其他用户授权的设备，进行终端设备管理、录像查看、报警消息处理等',
    audio_src: 'http://resource.eziot.com/group2/M00/00/5F/CtwQF2DR19iAX8aFAAkR9shwJXQ933.m4a',
    audioName: '设备托管',
    // 服务优势
    advantageList: [{
      url: '/pages/experienceCenter/images/icon_chengbendi.png',
      title: '成本低',
      tip: 'C端用户观看视频不产生取流带宽'
    },{
      url: '/pages/experienceCenter/images/icon_anquan.png',
      title: '安全性高',
      tip: '按需托管不同功能权限，保障信息安全'
    },{
      url: '/pages/experienceCenter/images/icon_fengfu.png',
      title: '功能丰富',
      tip: '可根据开发者方案定制开发不同功能'
    }],
    // 价格
    priceContent: {
      type: 'table', // table/list/free
      data:[{
        title: '被授权设备数 (通道)',
        content: '保证金 (元)'
      },{
        title: '50',
        content: '无需保证金'
      },{
        title: '1000',
        content: '3万'
      },{
        title: '2000',
        content: '5万'
      },{
        title: '5000',
        content: '10万'
      },{
        title: '10000',
        content: '15万'
      },
    ],
      tips: '托管服务费=0.1元/通道/月', // 备注信息
    },

    pageScroll: false, //滚动
    scrollTimer: '', // 滚动时间
    
  },

  onLoad: function (options) {
   
  },

  onHide: function () {
    console.log('离开home');
    this.serverInstruction = this.selectComponent("#serverInstruction-container");
    
    this.serverInstruction.__proto__._stopVoice()
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
