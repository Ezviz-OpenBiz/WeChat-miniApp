//index.js
//获取应用实例
const app = getApp();
var accessToken = '';
import {OPEN_DOMAIN} from '../config/config';

Page({
  data: {
    list: [
    {
      id: 'open',
      name: 'C3W(C78957921)',
      deviceSerial: 'C78957921',
      label: [
        "云台控制、",
        "语音播报"
      ],
      path: '',
      link: '/pages/live/live?accessToken=' + accessToken + '&deviceSerial=C78957921&channelNo=1'
    },
      {
        id: 'sbmc',
        name: '测试设备AA',
        deviceSerial: '203751922',
        label: [
          "云台控制、",
          "语音播报"
        ],
        path: '',
        link: '/pages/live/live?accessToken=' + accessToken + '&deviceSerial=203751922&channelNo=1'
      },
      // {
      //   id: 'test112',
      //   name: 'C87319710',
      //   deviceSerial: 'C87319710',
      //   label: [
      //     "云台控制、",
      //     "语音播报"
      //   ],
      //   path: '',
      //   link: '/pages/live/live?accessToken=' + accessToken + '&deviceSerial=C87319710&channelNo=1'
      // },
    ],
    accessToken: accessToken,
    param: '',
    url: ''
  },
  onLoad: function (options) {
    // this.getAccessToken();
    console.log('获取参数',options);
    const { type } = options;
    this.setData({
      param: type
    })
    if (type) {
      this.setData({
        url: '../customDevice/customDevice?type=' + type
      })
    } else {
      this.setData({
        url: '../customDevice/customDevice'
      })
    }

    this.getDevicePoster('C78957921');
    this.getDeviceInfo('C78957921','1');
    this.getDevicePoster('203751922');
    this.getDeviceInfo('203751922','1');

    // TODO 线上需删除
    this.getDevicePoster('C87319710');
    this.getDeviceInfo('C87319710','1');
    
  },
  // 获取token
  getAccessToken(device){
    const { list } = this.data;
    wx.request({
      url: `${OPEN_DOMAIN}/api/lapp/token/get`,
      method: 'POST',
      data: {
        appKey: appKey,
        appSecret: appSecret,
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      success:(res) => {
        console.log(res.data)
        if(res.data.code == 200 && res.data.data){
          this.setData({
            accessToken: res.data.data.accessToken
          },()=>{
            // this.getDevicePoster('C21022143');
            
            this.getDevicePoster('C78957921');
            this.getDeviceInfo('C78957921','1');
            this.getDevicePoster('203751922');
            this.getDeviceInfo('203751922','1');
          })
        }
      },
      fail: (err)=>{
        console.log(err);
      }
    })
  },
  getDeviceInfo(deviceSerial,channelNo){
    const { accessToken,list  } = this.data;
    var _this = this;
    var index = list.findIndex((value, index, arr) => {
      return value.deviceSerial === deviceSerial ;
    })
    wx.request({
      url: `${OPEN_DOMAIN}/api/v3/console/weChat/api/lapp/device/info`,
      method: 'POST',
      data: {
        accessToken,
        deviceSerial,
        channelNo,
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      success:(res) =>{
        console.log(res.data);
        const { param } = this.data;
        if(res.data.code ==200 && res.data.data){
          var result = res.data.data;
          list[index].name = result.deviceName
          if (param == 'playback') {
            list[index].link =  '/pages/playback/playback?accessToken=' + accessToken + '&deviceSerial='+ deviceSerial+'&channelNo=1'
            
          } else {
            list[index].link =  '/pages/live/live?accessToken=' + accessToken + '&deviceSerial='+deviceSerial+'&channelNo=1'
          }
          
          _this.setData({
            list: list,
            })
          }
        }
      })
  },
  // 获取设备封面
  getDevicePoster(device){
    var list = this.data.list;
    var accessToken = this.data.accessToken;
    var _this = this;
    var index = list.findIndex((value, index, arr) => {
      return value.deviceSerial === device;
    })
    wx.request({
      url: `${OPEN_DOMAIN}/api/v3/console/weChat/api/lapp/device/capture`, //仅为示例，并非真实的接口地址
      method: 'POST',
      data: {
        accessToken: accessToken,
        deviceSerial: device,
        channelNo: "1",
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      success(res) {
        console.log(res.data)
        if(res.data.code == 200 && res.data.data){
          list[index]["path"] = res.data.data.picUrl;
          _this.setData({
            list:list
          })
        }
      }
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () { },
});
