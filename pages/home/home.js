//index.js
//获取应用实例
const app = getApp();

Page({
  data: {
    list: [
      {
        id: 'experienceDevice',
        name: '试用设备',
        path: '../experienceDevice/experienceDevice',
        icon: './images/home_icon_try.png',
      },
      {
        id: 'deviceLive',
        name: '设备直播',
        path: '../preview/preview',
        icon: './images/home_icon_live.png',
      },
      {
        id: 'ai',
        name: 'AI识别',
        //path: '../index/index',
        path:'../../packageA/pages/index/index',
        icon: './images/home_icon_ai.png',
      },
      {
        id: 'devicePlayback',
        name: '设备回放',
        path: '../experienceDevice/experienceDevice?type=playback',
        icon: './images/home_icon_huifang.png',
      },
      {
        id: 'experienceCenter',
        name: '设备托管',
        path: '../../packageA/pages/experienceCenter/deviceTrust/home/home',
        icon: './images/home_icon_tuoguan.png',
      },
      {
        id: 'experienceCenter',
        name: '云录制',
        path: '../../packageA/pages/experienceCenter/cloudRecord/home/home',
        icon: './images/home_icon_yunluzhi.png',
      },
      {
        id: 'experienceCenter',
        name: '消息推送',
        path: '../../packageA/pages/experienceCenter/messageSend/home/home',
        icon: './images/home_icon_xiaoxi.png',
      },
      {
        id: 'xp2p',
        name: 'P2Pdemo',
        path: '../xp2p/index/index',
        icon: './images/home_icon_try.png',
      },
      {
        id: 'worklist',
        name: '工单',
        path: '',
        icon: './images/home_icon_worklist.png',
        openType: 'redirect'
      }
      ,
      {
        id: 'comingSoon',
        name: '敬请期待',
        path: '../comingSoon/comingSoon',
        icon: './images/home_icon_more.png',
        disabled: true
      },
    ],
    url: '',
  },
  onLoad: function (options) {
   
    console.log("options======>",options);
   
    var launchOptions = wx.getLaunchOptionsSync();
    // const { accessToken, deviceSerial,channelNo,scene } = query;
    // console.log("scene",scene)
    const that = this;
    // 工单登录
    wx.getStorage({
      key: 'accesstoken',
      success(res) {
        console.log('缓存accesstoken',res.data);
        if (res.data) {
          that.setData({
            url: '/packageC/pages/worklist/worklist'
          })
        } else {
          that.setData({
            url: '/pages/workListLogin/workListLogin?url=/packageC/pages/worklist/worklist'
          })
        }
      },
      fail(){
        that.setData({
          url: '/pages/workListLogin/workListLogin?url=/packageC/pages/worklist/worklist'
        })
      }
    });

  },

  onShow: function() {
    var launchOptions = wx.getEnterOptionsSync();
    const pathParam = launchOptions.query.scene;
    console.log('pathParam:',pathParam); // company_brochure---表示来源于公司宣传手册
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () { },

  gotoWorkList(){
    const {url} = this.data;
    wx.navigateTo({
      url: url,
    })
  },
});
