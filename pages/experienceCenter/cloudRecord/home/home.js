Page({
  data: {
    server_instruction_text: '面向设备提供便捷的视频内容录制存储服务，支持音视频通话、实时与历史录像、设备抓拍或视频抽帧录制',
    audio_src: 'http://resource.eziot.com/group2/M00/00/60/CtwQF2DR2eiAGtlsAAg4x9mOEVg863.m4a',
    audioName: '云录制',
    // 服务优势
    advantageList: [{
      url: '/pages/experienceCenter/images/icon-tanxing.png',
      title: '弹性扩容',
      tip: '灵活支撑系统快速增长'
    },{
      url: '/pages/experienceCenter/images/icon-luzhi.png',
      title: '一键录制',
      tip: 'API方便业务集成与二次开发，更换内容制造源头'
    },{
      url: '/pages/experienceCenter/images/icon-kekaoxing.png',
      title: '高可靠性',
      tip: '分布式集群部署与重试机制保障关键内容稳定'
    }],
    // 价格
    priceContent: {
      type: 'list', // table/list/free
      data:[{
        title: '音视频通话费用',
        content: ['720p 单路音视频单价：30元/千分钟', '1080p 单路音视频单价：60元/千分钟']
      },{
        title: '视频抽帧费用',
        content: ['单价：5元/千张']
      },{
        title: '带宽/流量费用',
        content: ['拉取视频转存消耗按现有带宽/流量计费方式计入企业版套餐（2.5元/GB、1.2元/Mbps/日）']
      },{
        title: '存储费用',
        content: ['单价：0.01元/GB/日']
      },{
        title: '转码费用',
        content: ['单价：7元/千分钟']
      },{
        title: '下载费用',
        content: ['单价：0.5元/GB']
      },
    ],
      tips: '', // 备注信息
    },

    pageScroll: false, //滚动
    
  },

  onLoad: function (options) {
   this.serverInstruction = this.selectComponent("#serverInstruction-container");
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
