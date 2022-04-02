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
        path: '../experienceCenter/deviceTrust/home/home',
        icon: './images/home_icon_tuoguan.png',
      },
      {
        id: 'experienceCenter',
        name: '云录制',
        path: '../experienceCenter/cloudRecord/home/home',
        icon: './images/home_icon_yunluzhi.png',
      },
      {
        id: 'experienceCenter',
        name: '消息推送',
        path: '../experienceCenter/messageSend/home/home',
        icon: './images/home_icon_xiaoxi.png',
      },
      {
        id: 'comingSoon',
        name: '敬请期待',
        path: '../comingSoon/comingSoon',
        icon: './images/home_icon_more.png',
        disabled: true
      },
    ],
  },
  onLoad: function () {
   

    var launchOptions = wx.getLaunchOptionsSync();
    // const { accessToken, deviceSerial,channelNo,scene } = query;
    // console.log("scene",scene)
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
});
