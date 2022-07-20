import { DateFormat } from '../common/utils';
// 生成uuid
const wxuuid = function () {
  var s = [];
  var hexDigits = "0123456789abcdef";
  for (var i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = "-";
 
  var uuid = s.join("");
  return uuid
};

//index.js
//获取应用实例
const app = getApp();
const recorderManager = wx.getRecorderManager();

const options = {
  duration: 60000, //指定录音的时长，单位 ms，最大为10分钟（600000），默认为1分钟（60000）
  sampleRate: 16000, //采样率
  numberOfChannels: 1, //录音通道数
  format: 'mp3', //音频格式，有效值 aac/mp3
}

var livePlayerContext;

import {OPEN_DOMAIN, PTZ_START, PTZ_STOP} from '../config/config';

Page({
  data: {
    scene: 1001,
    accessToken: '',
    deviceSerial: '',
    channelNo: '1',
    list: [
      {
        id: 'talk',
        name: '对讲',
        status: -1,
        imageUrl: './image/talk.svg',
        abnormalImage: './image/talk-disabled.svg'
      },
      {
        id: 'ptz',
        name: '云台控制',
        status: -1,
        imageUrl: './image/yuntai.svg',
        abnormalImage: './image/yuntai-disabled.svg'
      },
      {
        id: 'voice',
        name: '语音播报',
        status: -1,
        imageUrl: './image/record.svg',
        abnormalImage: './image/record-disable.svg'
      },
      {
        id: 'playback',
        name: '回看',
        status: 0,
        imageUrl: './image/backward.svg',
        abnormalImage: './image/backward.svg'
      },
      {
        id: 'capture',
        name: '截屏',
        status: -1,
        imageUrl: './image/picture-shoot.svg',
        abnormalImage: './image/pictureshoot-disabled.svg'
      },
      {
        id: 'mirror',
        name: '镜像翻转',
        status: -1,
        imageUrl: './image/jingxiang.svg',
        abnormalImage: './image/jingxiang-disabled.svg'
      },
      {
        id: 'cover',
        name: '镜头遮蔽',
        status: -1,
        imageUrl: './image/yinsi.svg',
        abnormalImage: './image/yinsi-disabled.svg'
      },
    ],
    videoSrc:"",
    videoHDSrc: "",
    panelStatus: 0, //0: 展示面板 1：进入云台 2-进入语音播报 3-进入镜像翻转 4-进入镜头遮蔽 5-对讲,
    ptzDisabled: true,
    voiceDiasbled: true,
    mirrorDisabled: true,
    mirrorInterval: false,
    coverDisabled: true,
    coverInterval: false,
    showVideoControls: true,
    autoHideTimer: undefined,
    videoLoadingStatus: 0,
    playVideo: false,
    videoNetWorkError: false,
    objectFit:'contain',
    openSound: true,
    isHD: true,
    showHDSelect: false,
    fullScreen: false,
    ptzStatus: 0, //0-初始化 1-top noraml 2-downnoraml 3-left normal 4-right normal  5-top noraml 6-down limit 7-left limit 8-right limit
    ptzLoading: false,
    ptzLimit: '',
    deviceOffline: false,
    deviceOfflineTime: new Date(),
    deviceName: '',
    currentPtzImg: './images/yuntai/normal.png',
    // 语音播报
    activeDefaultVoiceName: '',
    activeCustomVoiceName: '',
    defaultVoiceList: [], // 默认语音列表
    defaultVoiceTotal: 0, // 默认语音总数
    defaultVoicePage: 0,   // 默认语言当前页
    defaultVoiceListLoading: false,
    defaultVoiceNoMore: false,
    customVoiceList: [], // 默认语音列表
    customVoiceTotal: 0, // 默认语音总数
    customVoicePage: 0,   // 默认语言当前页
    customVoiceListLoading: false,
    customVoiceListNoMore: false,
    recoderTime:60,
    recoderTimer: undefined,
    sendingOnceVoice: false,
    dialogTitle: '',
    dialogContent: '',
    buttons: [{text: '知道了'}],
    dialogShow: false,
    pathParam: '',

    // 对讲过程
    talkStatus: 0, //0-未开始/结束，1-加载中，2-进行中, 3-启动失败, 4-设备对讲中
    token1: '', // 用于邀请设备入会
    token2: '', // 用于强制设备退会
    websocketUrl: '',
    customId: 'isZhangqianwei', // 开发者自定义用户id，以此换取clientId
    clientId: 993089712, // 注意：通讯过程中真实的clientId，此处仅供调试，无需赋值
    roomId: 0, // 注意：需要加入的房间号，需外部提供
    joinPassword: '', // 注意：加入房间的密码，需外部提供
    vtmHttpsAddress: '', 
    vtmIp: 'test11.ys7.com', // 此处仅供调试，无需赋值
    vtmPort: 8554, // 此处仅供调试，无需赋值
    rtmpAddress: '', // push/play地址
    rtmpPort: '', // 推流拉流端口地址
    lockReconnect: false, // websocket重连
    limit: 0,
    timer: null,
    pushVideo: true, // 推流
    pushVideoContext: null,
    pushUrl: '', // 推流地址
    livePlayerContext: [
      
    ], // 播放节点
    showVideoControls: false,
    videoNetWorkError: false,
    playSrc: '', // 播放地址
  },
  onLaunch(){
    console.log(onLaunch);
  },
  onShow () {
    console.log("show");
    var launchOptions = wx.getEnterOptionsSync();
    const pathParam = launchOptions.query.scene;
    console.log('pathParam:',pathParam);
    this.setData({
      pathParam: pathParam
    });
    if (pathParam) {
      this.getWxaInfo();
    }
    // Do something when show.
    this.checkNetWork();
  },
  onHide () {
    // Do something when hide.
    console.log("hide")
    this.setData({
      panelStatus:0,
      pathParam: ''
    });
    console.log(this.data.pathParam);
  },
  onError (msg) {
    console.log(msg)
  },
  onLoad(query){
    var launchOptions = wx.getLaunchOptionsSync();
    const { accessToken, deviceSerial,channelNo,scene } = query;
    console.log("分享获得的参数",accessToken, deviceSerial,channelNo,scene)
    this.setData({
      scene: parseInt(scene,10) || launchOptions.scene,
      accessToken: accessToken,
      deviceSerial: deviceSerial,
      channelNo: channelNo,
      panelStatus:0, // todo -0
    });
    
      this.getPlayUrl();
      this.getDeviceInfo();
      this.getDeviceCoverInfo();
    
    this.setData({
      showOneButtonDialog: true
    });
    // 录音模块
    recorderManager.onStart(() => {
      console.log('recorder start');
    })
    recorderManager.onPause(() => {
      console.log('recorder pause');
      this.speakEnd();
    })
    recorderManager.onInterruptionBegin(this.speakEnd);

    recorderManager.onStop((res) => {
      console.log('recorder stop', res)
      const { recoderTime } = this.data;
      const { tempFilePath } = res;
      if(recoderTime >= 59) {
        this.setData({
          recoderTime: 60,
        })
        clearTimeout(this.data.recoderTimer);
        return false;
      }
      this.setData({
        sendingOnceVoice: true,
      })
      wx.uploadFile({
        url: `${OPEN_DOMAIN}/api/v3/console/weChatFile/voice/sendonce`, //仅为示例，非真实的接口地址
        filePath: tempFilePath, //tempFilePaths[0],
        name: 'voiceFile',
        formData: {
          accessToken: accessToken,
          deviceSerial: deviceSerial,
          channelNo: channelNo,
        },
        header: {
          'content-type': 'amultipart/form-data' // 默认值
        },
        success: (res)=> {
          let data = res.data;
          if(!data.code){
            data = JSON.parse(data);
          }
          console.log(data);
          if(data.code == 200) {
            console.log("发送成功");
          }else if(data.code =='111012') { // 设备正忙
            wx.showToast({
              title: '语音下发失败',
              icon:'none',
            })
          }else if(data.code =='20007') { // 设备正忙
            wx.showToast({
              title: '设备不在线',
              icon:'none',
            })
          }else if(data.code =='20008') { // 设备正忙
            wx.showToast({
              title: '设备响应超时',
              icon:'none',
            })
          }else {
            wx.showToast({
              title: data.msg,
              icon: 'none',
            })
          }
          this.setData({
            recoderTime: 60,
          })
          //do something
        },
        fail: (res)=>{
          wx.showToast({
            title: '网络异常',
            icon: 'none'
          })
        },
        complete: ()=>{
          this.setData({
            sendingOnceVoice: false,
          })
        }
      })
    })
    recorderManager.onFrameRecorded((res) => {
      const { frameBuffer } = res
      console.log('frameBuffer.byteLength', frameBuffer.byteLength)
    });
    //视频
    livePlayerContext = wx.createLivePlayerContext('livePlayer');
    console.log("livePlayerContext", livePlayerContext);
    
  },

  initPannel (moduleId) {

  },
  checkNetWork(){
    const _this = this;
    wx.getNetworkType({
      success (res) {
        const networkType = res.networkType
        if(!networkType || networkType === 'none'){
          wx.showToast({
            title: '当前网络异常',
            icon: 'none',
            duration: 2000,
          })
        }
      }
    })
  },
  getPlayUrl(){
    const { accessToken, deviceSerial, channelNo } = this.data;
    var _this = this;
    wx.request({
      url: `${OPEN_DOMAIN}/api/v3/console/weChat/api/lapp/v2/live/address/get`, //仅为示例，并非真实的接口地址
      method: 'POST',
      data: {
        accessToken: accessToken,
        deviceSerial: deviceSerial,
        channelNo: channelNo,
        expireTime: 86400,
        quality: 2,
        protocol: 3,
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      success: (res) => {
        console.log(res.data);
        const { list } = this.data;
        if(res.data.code ==200 && res.data.data && res.data.data.url){
          var result = res.data;
          
          if(result.code == 200){
            _this.setData({
              videoSrc: result.data.url,
              // videoHDSrc: result.rtmpHd,
            })
          } else {
            list[0].status = -1;
            list[1].status = -1;
            list[2].status = -1;
            list[4].status = -1;
            list[5].status = -1;
            list[6].status = -1;
            _this.setData({
              list:list,
              dialogContent: result.msg,
              showVideoControls: false,
            })
          }
        } else if (res.data.code == "20001" ||res.data.code == "20002" || res.data.code == '20018'|| res.data.code == '10001'){ // 设备不存在 / 不属于用户
          this.setData({
            dialogTitle: '获取播放地址失败',
            dialogContent: '该用户不拥有该设备',
            dialogShow: true,
          })
        }else {
          console.log("获取播放地址失败")
          // _this.openPlayUrl();
        }
      }
    });
    wx.request({
      url: `${OPEN_DOMAIN}/api/v3/console/weChat/api/lapp/v2/live/address/get`, //仅为示例，并非真实的接口地址
      method: 'POST',
      data: {
        accessToken: accessToken,
        deviceSerial: deviceSerial,
        channelNo: channelNo,
        expireTime: 86400,
        quality: 1,
        protocol: 3,
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      success: (res) => {
        console.log(res.data);
        const { list } = this.data;
        if(res.data.code ==200 && res.data.data && res.data.data.url){
          var result = res.data;
          if(result.code == 200){
            _this.setData({
              //videoSrc: result.rtmp,
              videoHDSrc: result.data.url,
            })
          }else {
            llist[0].status = -1;
            list[1].status = -1;
            list[2].status = -1;
            list[4].status = -1;
            list[5].status = -1;
            list[6].status = -1;
            _this.setData({
              list:list,
              dialogContent: result.msg,
              showVideoControls: false,
            })
          }
        }else {
          console.log("获取高清播放地址失败")
          // _this.openPlayUrl();
        }
      }
    })
  },
   /*
  * 获取设备基本信息
  */
 getDeviceCoverInfo(){
  const { accessToken, deviceSerial, channelNo } = this.data;
  console.log(accessToken,deviceSerial,channelNo);
  var _this = this;
    wx.request({
      url: `${OPEN_DOMAIN}/api/v3/console/weChat/api/lapp/device/scene/switch/status`,
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
        if(res.data.code ==200 && res.data.data){
          const result = res.data.data;
          let list = this.data.list;
          if(result.enable == 1){ // 当前镜头遮蔽中
           
            list[0].status = -1;
            list[1].status = -1;
            list[2].status = -1;
            list[4].status = -1;
            list[5].status = -1;
            list[6].status = 1;
            this.setData({
              videoNetWorkError: false,
              showVideoControls: false,
              panelStatus: 4,
              videoLoadingStatus: 100,
              list: list,
            })
            console.log("panelStatus",this.data.panelStatus)
          }
        }
      },
      error:(err)=>{
        console.log(err);
      },
    })
  },

  /*
  * 获取设备基本信息
  */
  getDeviceInfo(){
    const { accessToken, deviceSerial, channelNo ,showVideoControls, videoNetWorkError,videoLoadingStatus } = this.data;
    var _this = this;
    wx.request({
      url: `${OPEN_DOMAIN}/api/v3/console/weChat/api/lapp/device/info`, //仅为示例，并非真实的接口地址
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
        if(res.data.code ==200 && res.data.data){
          let list = this.data.list;
          var result = res.data.data;
          _this.setData({
            deviceName: result.deviceName,
            deviceOffline: result.status !== 1,
            videoNetWorkError: result.status !==1 ? false : videoNetWorkError,
            showVideoControls: result.status !==1 ? false : showVideoControls,
            deviceOfflineTime: DateFormat(new Date(result.updateTime),'yyyy-MM-dd hh:mm:ss'),
            deviceIsEncrypt: result.isEncrypt,
            videoLoadingStatus: (result.isEncrypt === 1 || result.status !== 1) ? 100 : videoLoadingStatus,
          });
          // 配置标题
          if(result.deviceName){
            wx.setNavigationBarTitle({
              title: result.deviceName,
            }) 
          }
          if(result.status != 1 ){ // 设备不在线
            list[0].status = -1;
            list[1].status = -1;
            list[2].status = -1;
            list[4].status = -1;
            list[5].status = -1;
            list[6].status = -1;
            _this.setData({
              list:list,
              showVideoControls: false
            })
          }else if(result.isEncrypt == 1 ){ // 设备被加密
            list[0].status = -1;
            list[1].status = -1;
            list[2].status = -1;
            list[4].status = -1;
            list[5].status = -1;
            list[6].status = -1;
            _this.setData({
              list:list,
              dialogTitle: '设备被加密',
              dialogContent: '设备已被加密，无法继续查看，请前往萤石云app解密。',
              dialogShow: true,
              showVideoControls: false,
            })
          } else {
            // 获取设备能力
            // _this.getDeviceCapacity();
            _this.getDeviceCoverInfo();
          }
        } else if (res.data.code == "20001" ||res.data.code == "20002" || res.data.code == '20018'){ // 设备不存在 / 不属于用户
          this.setData({
            dialogTitle: '获取播放地址失败',
            dialogContent: '该用户不拥有该设备',
            dialogShow: true,
          })
        }else if(res.data.code == 10029){
          wx.showToast({
            title: '个人版接口调用超限，请升级企业版',
            icon: 'none',
          })
        }else if(res.data.code == 10002){
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
          })
          setTimeout(()=>{
            this.pageBack();
          },2000)
        }else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
        }
      }
    })
  },
  /*
  * 获取设备能力集
  */
 getDeviceCapacity(){
  const { accessToken,deviceSerial,channelNo,playVideo} = this.data;
  var _this = this;
  wx.request({
    url: `${OPEN_DOMAIN}/api/v3/console/weChat/api/lapp/device/capacity`,
    method: 'POST',
    data: {
      accessToken,
      deviceSerial,
    },
    header: {
      'content-type': 'application/x-www-form-urlencoded' // 默认值
    },
    success:(res) =>{
      console.log(res.data);
      if(res.data.code ==200 && res.data.data){
        var result = res.data.data;
        let list = this.data.list;
        list[0].status = result.support_talk != (1 || 4) ? -1 : 0;
        list[1].status = result.support_ptz == 0 ? -1 : 0;
        list[2].status = result.support_talk != 1 ? -1 : 0;
        list[5].status = result.ptz_top_bottom_mirror == 0 ? -1 : 0;
        list[6].status = result.support_privacy == 0 ? -1 : 0;
        if(!playVideo){ // 非视频播放成功状态下
          list[0].status = -1;
          list[1].status = -1;
          list[4].status = -1;
          list[5].status = -1;
        }
        _this.setData({
          list: list,
        })
      } else if (res.data.code == "20002" || res.data.code == '20018'){ // 设备不存在 / 不属于用户
        this.setData({
          dialogTitle: '设备被删除',
          dialogContent: '设备已从账号下删除，无法继续查看',
          dialogShow: true,
        })
      }
    }
  })
},
  fullScreen(){
    var _this = this;
    livePlayerContext.requestFullScreen({
      direction: 90,
      success: function(){
        _this.setData({
          fullScreen: true,
        })
      }
    });
    console.log("开启全屏");
  },
  unfullScreen() {
    var _this = this;
    livePlayerContext.exitFullScreen({
      success: function(){
        _this.setData({
          fullScreen: false,
        })
      }
    });
    console.log("开启全屏");
  },
  ToggleObjectFit(){
    var objectFit = this.data.objectFit;
    this.setData({
      objectFit: objectFit === 'contain' ? 'fillCrop': 'contain',
    })
  },
  fullscreenChange(event){
    console.log("监听到全屏变化", event)
  },
  getDefaultVoice: function () {
    const { accessToken } = this.data;
    var _this = this;
    console.info("默认语音： 第" + _this.data.defaultVoicePage + "页");
    var _this = this;
    _this.setData({
      defaultVoiceListLoading: true,
    })
    wx.request({
      url: `${OPEN_DOMAIN}/api/v3/console/weChat/api/lapp/voice/query`, //仅为示例，并非真实的接口地址
      method: 'POST',
      data: {
        "accessToken": accessToken,
        "default": "true",
        "pageStart": _this.data.defaultVoicePage,
        "pageSize": 5,
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      success(res) {
        console.log(res.data);
        var defaultVoiceList = _this.data.defaultVoiceList;
        defaultVoiceList = defaultVoiceList.concat(res.data.data);
        if(res.data.data && res.data.data.length>0){
          _this.setData({
            defaultVoiceList: defaultVoiceList,
            defaultVoicePage: _this.data.defaultVoicePage + 1,
          });
        }else {
          _this.setData({
            defaultVoiceNoMore: true,
          });
        }
        _this.setData({
          defaultVoiceListLoading: false,
        })
      },
      error(error){
        console.log(error);
        _this.setData({
          defaultVoiceListLoading: false,
        })
      }
    })
  },
  getCustomVoice: function () {
    const { accessToken } = this.data;
    var _this = this;
    console.info("用户自定义语音： 第" + _this.data.defaultVoicePage + "页");
    var _this = this;
    _this.setData({
      customVoiceListLoading: true,
    })
    wx.request({
      url: `${OPEN_DOMAIN}/api/lapp/voice/query`, //仅为示例，并非真实的接口地址
      method: 'POST',
      data: {
        "accessToken": accessToken,
        default:false,
        "pageStart": _this.data.defaultVoicePage,
        "pageSize": 5,
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      success(res) {
        console.log(res.data);
        var customVoiceList = _this.data.customVoiceList;
        customVoiceList = customVoiceList.concat(res.data.data);
        if(res.data.data && res.data.data.length>0){
          _this.setData({
            customVoiceList: customVoiceList,
            customVoicePage: _this.data.customVoicePage + 1,
          });
        }else {
          _this.setData({
            customVoiceNoMore: true,
          });
        }
        _this.setData({
          customVoiceListLoading: false,
        })
      },
      error(error){
        console.log(error);
        _this.setData({
          customVoiceListLoading: false,
        })
      }
    })
  },
  // 滚动至低端事件
  defaultScrollLower: function () {
    var _this = this;
    console.info("defaultScrollLower 第" + _this.data.defaultVoicePage + "页");
    this.getDefaultVoice();
  },
  // 滚动至低端事件
  customScrollLower: function () {
    var _this = this;
    console.info("customScrollLower 第" + _this.data.defaultVoicePage + "页");
    this.getCustomVoice();
  },
  handlePlay(callback){
    console.log("handelPlay",this.data.playVideo,this.data.isHD);
    console.log('播放地址：',this.data.isHD, this.data.videoHDSrc, this.data.videoSrc)
      let {list} = this.data;
      this.checkNetWork()
      livePlayerContext.play({
        success: ()=>{
          this.setData({
            // playVideo: true,
            showVideoControls: true,
            // videoLoadingStatus: 100,
            videoNetWorkError: false,
          });
          if(callback && typeof callback === "function"){
            callback();
          }
        },
        fail: (error)=>{
          this.checkNetWork();
          wx.showToast({
            title: '网络异常',
            icon:'none',
          })
          console.log("开始播放失败");
          list[4].status = 0;
          this.setData({
            videoNetWorkError: true,
            showVideoControls: false,
            videoLoadingStatus: 100,
            list: [...list]
          })
        }
      })
  },
  handleStop(callback){
    console.log("stop");
    let { list } = this.data;
    livePlayerContext.stop({
      success: ()=>{
        list[1].status = -1;
        this.setData({
          playVideo: false,
          videoLoadingStatus: 0,
          list: list,
          panelStatus: 0,
        })
        if(callback && typeof callback === "function"){
          callback();
        }
      },
      fail: (error)=>{
        console.log("停止播放失败")
      }
    })
  },
  autoHideControl(){
    console.log("showHdSelect",this.data.showHDSelect);
      const _this = this;
      clearTimeout(this.data.autoHideTimer);
      this.data.autoHideTimer = setTimeout(()=>{
        const { showHDSelect } = _this.data;
        if(!showHDSelect){
          this.setData({
            showVideoControls: false,
          })
        }
      },5000);
  },
  handleSound(e){
    var openSound = this.data.openSound;
    this.setData({
      openSound: !openSound,
    })
  },
  handleHD(e){
    var showHDSelect = this.data.showHDSelect;
    console.log("handleHD",showHDSelect)
    this.setData({
      showHDSelect: !showHDSelect,
    });
  },
  changeVideoHD(e){
    var _this = this;
    this.setData({
      showHDSelect: false,
      isHD: true
    });
    this.handleStop(_this.handlePlay);
  },
  changeVideoNormal(e) {
      this.setData({
        showHDSelect: false,
        isHD: false
      })
      this.handleStop(this.handlePlay);
  },
  statechange(e) {
    console.log('live-player code:', e.detail.code,e.detail);
    const { code } = e.detail;
    let { videoLoadingStatus, panelStatus } = this.data;
    const {list} = this.data;
    switch (code){
      case 2007: //启动loading
        videoLoadingStatus = 0;
        this.setData({
          playVideo: true,
          videoLoadingStatus: 0,
        })
        break;
      case 2001: //连接服务器
        videoLoadingStatus = 20 + Math.floor(Math.random()*10+1);
        break;
      case 2002: //已经连接 RTMP 服务器,开始拉流
        videoLoadingStatus = 40 + Math.floor(Math.random()*10+1);
        break;
      case 2008: // 解码器启动
        break;
      case 2009: //视频分辨率改动
        break;
      case 2004: // 视频播放开始
        videoLoadingStatus = 80 + Math.floor(Math.random()*10+1);
        break;
      case 2003: //网络接收到首个视频数据包(IDR)
      videoLoadingStatus = 100;
      // let {list} = this.data;
      list[4].status = 0;
      this.setData({
        playVideo: true,
        list: [...list]
      })
      this.autoHideControl();
      this.getDeviceCapacity();
      break;
      case 2103: //网络断连, 已启动自动重连（本小程序不自动重连）
      // videoLoadingStatus = 100;
      // this.handleStop();
      // 获取设备状态
      // this.getDeviceInfo();
      break;
      case 3001:
      case 3002:
      case 3003:
      case 3005: // 播放失败
      videoLoadingStatus = 100;
      // this.getDeviceInfo();
      this.checkNetWork();
      this.handleStop(this.playError);
      
      list[5].status = -1;
      list[4].status = -1
      this.setData({
        // playVideo: false,
        showVideoControls: false,
        videoNetWorkError: true,
        videoLoadingStatus: 100,
        list: list,
      })
      break;
      case -2301: // 经多次重连抢救无效，更多重试请自行重启播放
        videoLoadingStatus = 100;
 
        list[5].status = -1;
        list[4].status = -1
        this.setData({
          // playVideo: false,
          showVideoControls: false,
          videoNetWorkError: true,
          videoLoadingStatus: 100,
          list: [...list]
        })
        break;
    }
    this.setData({
      videoLoadingStatus: videoLoadingStatus
    })
  },
  playError(){
    this.setData({
      showVideoControls: false,
      videoNetWorkError: true,
      videoLoadingStatus: 100,
    });
    // this.getPlayUrl();
    this.getDeviceInfo();
    this.getDeviceCoverInfo();
  },
  error(e) {
    console.log('live-player',e);
    console.error('live-player error:', e.detail.errMsg)
    if(e.detail.errCode == 10001){
      wx.showToast({
        title: '视频直播对讲需要你手机授权微信录音或麦克风权限',
        icon:'none',
        duration:3000,
      })
    }
  },
  onVideoTap(e){
    console.log("点击视频");
    const { deviceOffline,showVideoControls,panelStatus,videoNetWorkError} = this.data;
    if(deviceOffline || panelStatus === 4 || videoNetWorkError){
      return false;
    }
    if(showVideoControls){
      this.setData({
        showVideoControls: false,
      });
      clearTimeout(this.data.autoHideTimer);
    }else {
      this.setData({
        showVideoControls: true,
      })
      this.autoHideControl();
    }
  },
  tapPanel: function(event) {
    const { accessToken, deviceSerial, channelNo } = this.data;
    var tValue = event.currentTarget.dataset.value;
    var list = this.data.list;
    var panelStatus = this.data.panelStatus;
    switch (tValue) {
      case 'talk':
        if(list[0].status === -1){
          return false;
        }
        panelStatus = 5;
        this.initTalk();
        break;
      case 'ptz':
        if(list[1].status === -1){
          return false;
        }
        panelStatus = 1;
        break;
      case 'voice':
        if(list[2].status === -1) {
          return false;
        }
        panelStatus = 2;
        this.getDefaultVoice();
        this.getCustomVoice();
        break;
      case 'playback':
        this.goToLive();
        break;
      case 'capture':
        if(list[4].status === -1) {
          return false;
        }
        this.screenShoot()
        break;
      case 'mirror':
        if(list[5].status === -1){
          return false;
        }
        if(panelStatus === 3){
          panelStatus = 0;
          list[4].status = 0;
          list[5].status = 0;
          this.sceneMirror(2);
        }else{
          panelStatus = 3;
          this.sceneMirror(2);
        }
        break;
      case 'cover':
        if(list[6].status === -1){
          return false;
        }
        if (panelStatus === 4){ // 镜头遮蔽中
          this.sceneCover(0);
        }else{
          this.sceneCover(1);
        }
        break;
      default:
        panelStatus = 0;
    }
    this.setData({
      panelStatus: panelStatus,
      list: list
    })
  },
  startRecord(e){
    recorderManager.start(options)
  },
  stopRecord(e){
    recorderManager.stop()
  },
  handleBackPanel(event){
    var tValue = event.currentTarget.dataset.value;
    this.setData({
      panelStatus:0,
    })
  },
  handlePtzTouchStart(event){
    // var { offsetLeft, offsetTop } = event.currentTarget;
    // var {clientX,clientY} = event.touches[0];
    var { ptzStatus,ptzLoading } = this.data;
    // var centerLeft = 104 + offsetLeft;
    // var centerTop = 104 + offsetTop;
    // var left = clientX - centerLeft;
    // var top = clientY - centerTop;
    wx.createSelectorQuery().select('#ptz-img-container').boundingClientRect( (rect) => {
      let { clientX,clientY} = event.touches[0];
      let rectLeft = rect.left;
      let rectTop = rect.top;

      var centerLeft = 104 + rectLeft;
      var centerTop = 104 + rectTop;
      var left = clientX - centerLeft;
      var top = clientY - centerTop;

      console.log("点击了页面方位：pageY",clientY);
      console.log("云盘位置：top",rect.top);
      if(ptzLoading){
        wx.showToast({
          title: '操作过于频繁，建议长按转动',
          icon: 'none'
        })
        return false;
      }
      if(Math.abs(left) > Math.abs(top)){
        if(left>0){
          this.handlePtzControl(3);
          ptzStatus = 4;
        }else {
          ptzStatus = 3;
          this.handlePtzControl(2);
        }
      } else {
        if (top > 0) {
          ptzStatus = 2;
          this.handlePtzControl(1);

        } else {
          ptzStatus = 1;
          this.handlePtzControl(0);
        }
      }
      this.setData({
        ptzStatus: ptzStatus,
      })

    }).exec();
  },
  handlePtzTouchEnd(event) {
    let { clientX, clientY } = event.changedTouches[0];
    const _this = this;
    wx.createSelectorQuery().select('#ptz-img-container').boundingClientRect( (rect) => {
      let rectLeft = rect.left;
      let rectTop = rect.top;

      var centerLeft = 104 + rectLeft;
      var centerTop = 104 + rectTop;
      var left = clientX - centerLeft;
      var top = clientY - centerTop;
      if (Math.abs(left) > Math.abs(top)) {
        if (left > 0) {
          _this.handlePtzControl(3,'stop');
        } else {
          _this.handlePtzControl(2, 'stop');
        }
      } else {
        if (top > 0) {
          _this.handlePtzControl(1, 'stop');
        } else {
          _this.handlePtzControl(0,'stop');
        }
      }
    }).exec();
    this.setData({
      ptzStatus: 0,
    })
  },
  handlePtzControl(position,type){
    const { accessToken, deviceSerial, channelNo,ptzLoading } = this.data;
    let ptzLimit = '';
    const ptzTopImgSuccess = './images/yuntai/top.png';
    const ptzTopImgFailed  = './images/yuntai/top_limit.png';
    const ptzDownImgSuccess = './images/yuntai/down.png';
    const ptzDownImgFailed  = './images/yuntai/down_limit.png';
    const ptzLeftImgSuccess = './images/yuntai/left.png';
    const ptzLeftImgFailed  = './images/yuntai/left_limit.png';
    const ptzRightImgSuccess = './images/yuntai/right.png';
    const ptzRightImgFailed  = './images/yuntai/right_limit.png';
    const ptzNormalImg =  './images/yuntai/normal.png';
    let ptzStatus = this.data.ptzStatus;
    let currentPtzImg = this.data.currentPtzImg;
    var url = `${OPEN_DOMAIN}${PTZ_START}`;
    if(type == 'stop'){
      url = `${OPEN_DOMAIN}${PTZ_STOP}`
    }
    if(ptzLoading && type === 'start'){
      wx.showToast({
        title: '操作过于频繁，建议长按转动',
        icon: 'none'
      })
      return false;
    }

    this.setData({
      ptzLoading: true,
    })
    wx.request({
      url: url, //仅为示例，并非真实的接口地址
      method: 'POST',
      data: {
        "accessToken": accessToken,
        "deviceSerial": deviceSerial,
        "channelNo": channelNo,
        "direction": position,
        speed:1,
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      success: (res) => {
        const code = res.data.code;
        console.log('云台控制',res.data);
        if(code == 10029){
          wx.showToast({
            title: '个人版接口调用超限，请升级企业版',
            icon: 'none',
          })
        }else if(code != 200){
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
          })
        }
        if(type == 'stop'){
          ptzStatus = 0;
          currentPtzImg = ptzNormalImg;
        }else{
          switch(position){
            case 0:
              ptzStatus = 1;
              currentPtzImg = code == 200 ? ptzTopImgSuccess : ptzTopImgFailed;
              ptzLimit = code == 200 ? '' : 'top';
              break;
            case 1:
              ptzStatus = 2;
              currentPtzImg = code == 200 ? ptzDownImgSuccess : ptzDownImgFailed;
              ptzLimit = code == 200 ? '' : 'down';
              break;
            case 2:
              ptzStatus = 3;
              currentPtzImg = code == 200 ? ptzLeftImgSuccess : ptzLeftImgFailed;
              ptzLimit = code == 200 ? '' : 'left';
              break;
            case 3:
              ptzStatus = 4;
              currentPtzImg = code == 200 ? ptzRightImgSuccess : ptzRightImgFailed;
              ptzLimit = code == 200 ? '' : 'right';
              break;
            default:
              ptzStatus = 0;
              currentPtzImg = ptzTopImgSuccess;
              ptzLimit = '';
            }
          }
          this.setData({
            ptzStatus: ptzStatus,
            currentPtzImg: currentPtzImg,
            ptzLoading: false,
            ptzLimit: ptzLimit,
          });
      },
      error:(err) =>{
        this.setData({
          ptzLoading: false,
        })
      }
    })
  },
  screenShoot(e){
    const { playVideo,videoLoadingStatus  } = this.data;
    if(!playVideo || videoLoadingStatus != 100){
      console.log("非播放状态下点击截图");
      return false;
    }
    console.log("开始截图")
    // livePlayerContext.snapshot('raw');
    let that = this
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.writePhotosAlbum']) {
          that.saveImg();
        } 
        else if (res.authSetting['scope.writePhotosAlbum'] === undefined) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() {
              that.saveImg();
            },
            fail() {
              that.authConfirm()
            }
          })
        } 
        else {
          that.authConfirm()
        }
      }
    })
   
  },
  saveImg(){
    livePlayerContext.snapshot('raw')
    .then(data =>{
      console.log("data",data);
          if (data) {
            console.log(data)
            wx.saveImageToPhotosAlbum({
              filePath: data.tempImagePath,
              success(res) { 
                console.log("保存成功",res)
                wx.showToast({
                  title: '截图已保存至手机相册',
                  icon: 'none',
                })
              }
            })
          }
    })
    .catch(err => {
      console.log("err",err);
    })
  },
  // 授权拒绝后，再次授权提示弹窗
authConfirm(){
  let that = this
  wx.showModal({
    content: '您没打开保存图片权限，是否去设置打开？',
    confirmText: "确认",
    cancelText: "取消",
    success: function (res) {
      if (res.confirm) {
        wx.openSetting({
          success :(res) => {
            if (res.authSetting['scope.writePhotosAlbum']) {
              that.saveImg();
            }
            else {
              wx.showToast({
                title: '您没有授权，无法保存到相册',
                icon: 'none'
              })
            }
          }
        })
      } else {
        wx.showToast({
          title: '您没有授权，无法保存到相册',
          icon: 'none'
        })
      }
    }
  });
},
  // 镜头遮蔽
  sceneCover(enable) {
    var _this = this;
    let { deviceSerial, channelNo,accessToken,coverInterval,list,panelStatus,videoNetWorkError } = this.data;
    if(coverInterval){
      wx.showToast({
        title: '操作过于频繁',
        icon: 'none'
      })
      return false;
    }
    this.setData({
      coverInterval: true,
    })
    wx.request({
      url: `${OPEN_DOMAIN}/api/v3/console/weChat/api/lapp/device/scene/switch/set`,
      method: 'POST',
      data: {
        accessToken: accessToken,
        deviceSerial: deviceSerial,
        channelNo: channelNo,
        enable: enable,
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      success:(res) =>{
        console.log(res.data);
        if(res.data.code == 200){
          if(enable == 0){
            list[6].status = 0;
            panelStatus = 0;
            videoNetWorkError = false;
            this.getDeviceCapacity();
            this.handlePlay();
          }else {
            list[0].status = -1;
            list[1].status = -1;
            list[2].status = -1;
            list[4].status = -1;
            list[5].status = -1;
            panelStatus = 4;
            list[6].status = 1;
            // this.handleStop();
            this.setData({
              playVideo: false
            })
          }
          setTimeout(()=>{
            this.setData({
              coverInterval: false,
            });
          },5000)
          this.setData({
            videoNetWorkError: videoNetWorkError,
            list:list,
            panelStatus:panelStatus,
          })
        }else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
          })
          this.setData({
            coverInterval: false,
            panelStatus: panelStatus,
          });
        }
      },
      fail: (res)=>{
        wx.showToast({
          title: '网络异常',
          icon: 'none'
        })
        this.setData({
          coverInterval: false,
        });
      }
    });
  },
  // 镜象翻转
  sceneMirror(enable) {
    const { deviceSerial, channelNo,accessToken,mirrorInterval } = this.data;
    var _this = this;
    if(mirrorInterval) {
      wx.showToast({
        title: '操作过于频繁',
        icon: 'none'
      })
      return false;
    }
    this.setData({
      mirrorInterval: true,
    });
    wx.request({
      url: `${OPEN_DOMAIN}/api/v3/console/weChat/api/lapp/device/ptz/mirror`, //仅为示例，并非真实的接口地址
      method: 'POST',
      data: {
        accessToken: accessToken,
        deviceSerial: deviceSerial,
        channelNo: channelNo,
        command: enable,
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      success:(res) => {
        console.log(res.data);
        if(res.data.code == 200){
          setTimeout(()=>{
            this.setData({
              mirrorInterval: false,
            });
          },5000)
        }else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
          this.setData({
            mirrorInterval: false,
          });
        }
      },
      fail: (res)=>{
        wx.showToast({
          title: '网络异常',
          icon: 'none'
        })
        this.setData({
          mirrorInterval: false,
        });
      }
    })
  },
  playVoice(event){
    const { accessToken, deviceSerial, channelNo } = this.data;
    var { duration, voiceName,fileUrl } = event.currentTarget.dataset.value;
    var type = event.currentTarget.dataset.type;
    console.log("type",type)
    wx.request({
      url: `${OPEN_DOMAIN}/api/v3/console/weChat/api/lapp/voice/send`, //仅为示例，并非真实的接口地址
      method: 'POST',
      data: {
        accessToken: accessToken,
        deviceSerial: deviceSerial,
        channelNo: channelNo,
        fileUrl: fileUrl,
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      success:(res)=> {
        console.log(res.data);
        const { list } = this.data;
        if(res.data.code == 200){
          list[2].status = 1;
          this.setData({
            activeCustomVoiceName:  type === 'custom' ? voiceName : '',
            activeDefaultVoiceName: type === 'default' ? voiceName : '',
            list: list,
          });
          setTimeout(()=>{
            list[2].status = 0;
            this.setData({
              activeCustomVoiceName:  '',
              activeDefaultVoiceName: '',
              list: list,
            })
          },duration * 1000)
        }else if(res.data.code =='111012') { // 设备正忙
          wx.showToast({
            title: '语音下发失败',
            icon:'none',
          })
        }else if(res.data.code =='20007') { // 设备正忙
          wx.showToast({
            title: '设备不在线',
            icon:'none',
          })
        }else if(res.data.code =='20008') { // 设备正忙
          wx.showToast({
            title: '设备响应超时',
            icon:'none',
          })
        }else {
          wx.showToast({
            title: res.data.msg,
            icon:'none',
          })
        }
      },
      fail: (res)=>{
        wx.showToast({
          title: '网络异常',
          icon: 'none'
        })
      }
    })
  },
  speakStart(event){
    let recoderTime = this.data.recoderTime;
    this.setData({
      recoderTime: 59,
    })
    recorderManager.start(options);
    wx.showToast({
      icon: 'none',
      duration: 60000,
      image: './images/voice_talk4.png',
      title: '剩余' + recoderTime
    });

    this.data.recoderTimer = setInterval(()=>{
      // _this.setData({
      //   recoderTime: --recoderTime
      // },1000)
      if(recoderTime > 0){
        --recoderTime;
        wx.showToast({
          icon: 'none',
          duration: 60000,
          image: './images/voice_talk4.png',
          title: '剩余' + recoderTime
        });
        this.setData({
          recoderTime: recoderTime
        })
      }else {
        clearInterval(this.data.recoderTimer);
        this.speakEnd();
      }
      // console.log("recoderTime", recoderTime)
    },1000)
  },
  speakEnd(event) {
    wx.hideToast();
    let recoderTime = this.data.recoderTime;
    if(recoderTime >= 59){
      wx.showToast({
        title: '时间太短了',
        icon:'none',
      })
      recorderManager.stop();
      clearInterval(this.data.recoderTimer);
      return false;
    }else {
      wx.hideToast();
      recorderManager.stop();
      clearInterval(this.data.recoderTimer);
    }
  },
  tapDialogButton(e) {
    this.setData({
        dialogShow: false
    });
    this.pageBack();
  },
  pageBack() {
    const { scene } = this.data;
    console.log("scene",scene);
    // wx.showToast({
    //   title: `code ${scene}`,
    // })
    if([1007,1008,1036,1037,1038,1044].indexOf(scene) === -1){
      wx.navigateBack({
        delta: 1
      })
    } else {
      wx.reLaunch({
        url: '/pages/home/home',
      })
    }
  },
    /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(res) {
    const { accessToken, deviceSerial, channelNo } = this.data;
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target);
      this.setData({
        panelStatus: 0,
      })
    }
    return {
      title: '小程序',
      path:  '/pages/live/live?accessToken=' + accessToken + '&deviceSerial='+ deviceSerial + '&channelNo=' + channelNo + '&scene=1007',
    }
  },
  // 通过二位码进入直播，通过uuid获取accessToken、deviceSerial、channelNo
  getWxaInfo: function () {
    const { pathParam } = this.data;
    console.log('getWxaInfo:', pathParam)
    wx.request({
      url: `${OPEN_DOMAIN}/device/getWxaInfo`, //仅为示例，并非真实的接口地址
      method: 'POST',
      data: {
        uuid: pathParam
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      success:(res)=> {
        console.log('通过uuid获取',res.data);
        const res1 = res.data.data;
        if (res1) {
          this.setData({
            accessToken: res1.accessToken, 
            deviceSerial: res1.deviceSerial, 
            channelNo: res1.channelNo
          });
          this.getPlayUrl();
          this.getDeviceInfo();
          this.getDeviceCoverInfo();
        }
      },
      fail: (res)=>{
        console.log('获取accesstoken失败');
        // wx.showToast({
        //   title: '网络异常',
        //   icon: 'none'
        // })
      }
    })
  },
  // 返回回放
  goToLive(){
    const { accessToken,deviceSerial, channelNo } = this.data;
    let url = '/pages/playback/playback?accessToken=' + accessToken + '&deviceSerial='+ deviceSerial + '&channelNo=' + channelNo;
    wx.navigateTo({
      url: url,
    })
  },

  // 对讲-------------------
  // 退出对讲
  exitTalk () {
    this.setData({
      panelStatus:0,
      talkStatus:0,
      pushUrl: ''
    });
    this.websocketClose();
  },

  // 进入对讲pannel
  initTalk() {
    // 初始化当前用户id
    const uuid = wxuuid();
    this.setData({
      customId: uuid,
      talkStatus: 1
    });
    this.startTalk()
  },

  // 重试
  tryTalkAgain() {
    // 初始化当前用户id
    const uuid = wxuuid();
    this.setData({
      customId: uuid,
      talkStatus: 1
    });
    this.websocketClose();
    this.startTalk();
  },

 
// 开始对讲-①获取设备能力集
startTalk(){
  const {accessToken, deviceSerial} = this.data;
  wx.request({
    url: `${OPEN_DOMAIN}/api/v3/console/weChat/api/lapp/device/capacity`,
    method: 'POST',
    data: {
      accessToken: accessToken,
      deviceSerial: deviceSerial,
    },
    header: {
      'content-type': 'application/x-www-form-urlencoded', // 默认值
    },
    success:(res) => {
      console.log('设备能力集:',res.data);
      if (res.data.code == 200) {
        const supportTalk = res.data.data.support_talk;
        console.log('supportTalk', supportTalk);
        if (supportTalk == 1 || 4) {
          // 设备能力集中为1/4表示支持全双工
          this.getToken()
        }
      }
    },
    fail: (err)=>{
      console.log(err);
    }
  })
},

// 对讲-②获取两个取流token
getToken(){
  const {accessToken} = this.data;
  wx.request({
    url: `${OPEN_DOMAIN}/api/v3/console/weChat/api/user/token`,
    method: 'POST',
    data: {
      accessToken: accessToken,
      count: 2,
      clientType: "0",
      featureCode:"123",
      osVersion:"2.3.6",
      sdkVersion:"v.1.0.20140720",
      netType:"UNKNOWN"
    },
    header: {
      'content-type': 'application/x-www-form-urlencoded', // 默认值
    },
    success:(res) => {
      console.log('取流token:',res.data);
      if (res.data.resultCode == 200) {
        const tokens = res.data.tokenArray;
        if (tokens && tokens.length == 2) {
          this.setData({
            token1: tokens[0],
            token2: tokens[1]
          });
          // 创建房间，并查询房间信息
          this.orderRoom()
        }
      }
    },
    fail: (err)=>{
      console.log(err);
    }
  })
},

// 对讲-③创建房间并查询房间信息
orderRoom(){
  // 检查网络状态
  this.checkNetWork();

  const { customId, accessToken } = this.data;
  wx.request({
    url: `${OPEN_DOMAIN}/api/v3/console/weChat/api/v3/conference/gen`,
    method: 'POST',
    data: {
      accessToken: accessToken,
      customId: customId,
    },
    header: {
      'content-type': 'application/x-www-form-urlencoded', 
    },
    success:(res) => {
      console.log('预定创建并查询房间信息:',res.data);
      const code =  res.data.code || res.data.meta.code
      if (code == 200) {
        const clientId = res.data.clientId;
        const conferenceInfos = res.data.conferenceInfos;
        const roomId = conferenceInfos.roomId;
        const vtmHttpsAddress = conferenceInfos.vtmHttpsAddress;
        const vtmAddress = conferenceInfos.vtmAddress;
        let vtmIp = '', vtmPort = '';
        if (vtmAddress && vtmAddress.length > 0) {
          vtmIp = vtmAddress.split(':')[0];
          vtmPort = vtmAddress.split(':')[1];
        }
        this.setData({
          clientId: clientId,
          vtmHttpsAddress: vtmHttpsAddress,
          vtmIp: vtmIp,
          vtmPort: vtmPort,
          roomId: roomId
        }, () => {
          const {clientId, vtmHttpsAddress,vtmIp, vtmPort} = this.data;
          console.log('获取房间信息-','clientId:',clientId ,'vtmHttpsAddress:', vtmHttpsAddress, 'vtmIp:',vtmIp,'vtmPort:',vtmPort);
          this.advanceDevice()
        })
      } else if (code == '10002') {
        wx.showToast({
          title: 'accessToken过期或异常',
          icon: 'none'
        })
      } else if (code == '404') {
        wx.showToast({
          title: '未找到房间信息',
          icon: 'none'
        })
      } else  {
        wx.showToast({
          title: '创建房间-'+res.data.meta.message,
          icon: 'none'
        });
        this.setData({
          talkStatus: 3 // 启动失败
        })
      }
    },
    fail: (err)=>{
      console.log(err);
    }
  })
},

// 对讲-④邀请设备入会
advanceDevice() {
  const {accessToken, roomId, deviceSerial, channelNo, token1} = this.data;
  wx.request({
    url: `${OPEN_DOMAIN}/api/v3/console/weChat/api/v3/conference/device/invite`,
    method: 'POST',
    data: {
      accessToken: accessToken,
      roomId: roomId,
      deviceSerial: deviceSerial,
      channelNo: channelNo,
      mode: 2,
      authType: 5,
      token: token1
    },
    header: {
      'content-type': 'application/x-www-form-urlencoded', // 默认值
    },
    success:(res) => {
      console.log('邀请设备入会:',res.data);
      if (res.data.meta.code == 200) {
        console.log('邀请设备入会成功，加入模式为对讲模式');
        this.getWebsocket()
      } else {
        if (res.data.meta.code == 80502) {
          this.setData({
            talkStatus: 4 // 设备对讲中
          })
        } else {
          wx.showToast({
            title: '邀请设备入会-'+ res.data.meta.message,
            icon: 'none'
          });
          this.setData({
            talkStatus: 3 // 启动失败
          })
        }
        
      }
    },
    fail: (err)=>{
      console.log(err);
      this.setData({
        talkStatus: 3 // 启动失败
      })
    }
  })

},

// 对讲-⑤强制设备退会
exitDevice() {
  const {accessToken, roomId, deviceSerial, channelNo, token2} = this.data;
  wx.request({
    url: `${OPEN_DOMAIN}/api/v3/console/weChat/api/v3/conference/device/kickout`,
    method: 'POST',
    data: {
      accessToken: accessToken,
      roomId: roomId,
      deviceSerial: deviceSerial,
      channelNo: channelNo,
      authType: 5,
      token: token2
    },
    header: {
      'content-type': 'application/x-www-form-urlencoded', // 默认值
    },
    success:(res) => {
      console.log('强制设备退出房间:',res.data);
      if (res.data.meta.code == 200) {
        console.log('强制设备退出房间成功');
        // this.getWebsocket()
      } else {
        wx.showToast({
          title: '强制设备退出房间-'+ res.data.meta.message,
          icon: 'none'
        });
      }
    },
    fail: (err)=>{
      console.log(err);
    }
  })

},

// 获取websocket地址
getWebsocket () {
  const { vtmHttpsAddress, roomId } = this.data;
  
  const url = 'https://' + vtmHttpsAddress + '/vtm/rtmpavc/' + roomId;   // 注意：此处需配置小程序域名 
  // const url = 'https://vtmrcgnginx.ys7.com:8555/vtm/rtmpavc/' + roomId;  
  wx.request({
    url: url,
    method: 'GET',
    header: {
      'content-type': 'application/x-www-form-urlencoded', // 默认值
    },
    success:(res) => {
      console.log('vtm连接返回：',res.data);
      if (res.data.retcode == 0 || res.data.retcode == 200) {
        const wsurl = 'wss://' + res.data.serverAddr + ':' + res.data.serverPort+'/rtmpavc'; // 注意：此处需配置小程序域名
        
        this.setData({
          websocketUrl: wsurl,
          rtmpAddress: res.data.serverAddr
        }, () => {
          // 连接websocket
          this.socketConfig();
        })
      } else if (res.data.retcode == 503) {
        wx.showToast({
          title: '无可用服务',
          icon: 'none'
        });
        this.setData({
          talkStatus: 3 // 启动失败
        });
        this.exitDevice()
      } else {
        console.log('获取websocket地址失败', res.data.retcode);
        wx.showToast({
          title: '获取websocket地址失败',
          icon: 'none'
        });
        this.setData({
          talkStatus: 3 // 启动失败
        });
        this.exitDevice()
      }
    },
    fail: (err)=>{
      console.log('获取websocket地址失败', err);
      wx.showToast({
        title: '获取websocket地址失败',
        icon: 'none'
      });
      this.setData({
        talkStatus: 3 // 启动失败
      })
    }
  })
},

// 配置socket
socketConfig () {
  let that = this;
  const { websocketUrl, clientId } = this.data;
  if (Object.keys(app.globalData.socketTask).length <= 0 || app.globalData.socketTask.readyState === 3) {
    console.log('开始连接socket');
    // socketTask的属性值readyState，取下面4个状态值：CONNECTING: 0 连接中 、OPEN: 1 已连接 、CLOSING: 2 关闭中 、CLOSED: 3 已关闭
    // 直接判断SocketTask对象的属性值readyState，如果是1的话就表示连接可用。
    console.log('websocketURL:', websocketUrl);
    let socketTask = null;
  
    const websocketConnect = new Promise((resolve, reject) => {
      socketTask = wx.connectSocket({
        url: websocketUrl,
        // url: 'wss://test12jsdecoder.ys7.com/?version=0.1&cipherSuites=0&sessionID=',
        success: res => {
          console.log('connectSocket连接中', res);
          wx.showToast({
            title: 'websocket连接中,请稍候',
            icon: 'none'
          });
          resolve(res);
        },
        fail: err => {
          console.log('connectSocket失败', err);
          wx.showToast({
            title: 'webSocket连接失败',
            icon: 'none'
          });
          this.setData({
            talkStatus: 3 // 启动失败
          });
          this.exitDevice()
        }
      });
    });

    websocketConnect.then(data => {
      if (data.errMsg == 'connectSocket:ok') {
        app.globalData.socketTask = socketTask;
        that.initEventHandle();
      }
    });
    
  }
},

// 初始化websocket事件
initEventHandle() {
  const socketTask = app.globalData.socketTask;
  const that = this;
  const { clientId, roomId, joinPassword, vtmIp, vtmPort, rtmpAddress } = this.data;
  
  socketTask.onOpen((res) => {
    console.log('监听WebSocket开启', res);
    // 打开bav会话
    let param ={
      cmdType:1000,
      vtmIp: vtmIp,
      vtmPort: parseInt(vtmPort),
      clientId: clientId,
      roomId: roomId,
      authentication: `roomId=${roomId}&password=${joinPassword}`,
      mode: 2
    };

    if (socketTask.readyState === 1) {
      wx.sendSocketMessage({
        data: JSON.stringify(param)
      });
      console.log('websocket发送给服务端的消息:', param)
    }
  });


  socketTask.onMessage((res) => {
    console.log('接收到WebSocket消息', res);
    
    if (res.data) {
      const result = JSON.parse(res.data);
      
      if (result.cmdType == '1003') {
        // 微信小程序推流
        const rtmpPort = result.rtmpPort;
        const rtmpIp = result.rtmpIp ? result.rtmpIp : rtmpAddress;
        const pushUrl = `rtmp://${rtmpIp}:${rtmpPort}/livestream/wechat?roomId=${roomId}&pushClientId=${clientId}`;
        console.log('推流地址:', pushUrl);

        that.setData({
          pushUrl: pushUrl,
          talkStatus: 2 // 对讲
        }, () => {
          var pushcontext = wx.createLivePusherContext('livePusher', this);
          that.setData({
            pushVideoContext: pushcontext
          });
          // 开始推流
          that.startPush()
        });

      } 
      else if (result.cmdType == '1002') 

      {
        // 微信小程序拉流
      
        const playClientId = result.playClientId;
        const rtmpPort = result.rtmpPort;
        const rtmpIp = result.rtmpIp ? result.rtmpIp : rtmpAddress;
        const playSrc = `rtmp://${rtmpIp}:${rtmpPort}/livestream/wechat?roomId=${roomId}&pushClientId=${clientId}&playClientId=${playClientId}`;
        console.log('拉流地址:', playSrc);
        this.setData({
          talkStatus: 2, // 对讲
          playSrc: playSrc
        }, () => {
            // 初始化play
            const playcontext = wx.createLivePlayerContext('talk-liveplayer', that);
                      
            console.log('当前拉流窗口~~~~~', playcontext);
            // 播放
            that.autoPlay(playcontext);
        });
        
        

      } 
      else if (result.cmdType == '1005') {
        // 某端退出房间
        const curPlayClientId = 'paly' + result.playClientId;
        wx.showToast({
          title: result.playClientId + '将关闭',
          icon: 'none'
        });
        this.setData({
          talkStatus: 3 // 对讲失败
        });
        // 对应播放端停止播放
        console.log('当前退出窗口', curPlayClientId);
        

      }
      else if (result.cmdType == '1001') {
        const code = result.code;
        const msg = result.msg;

        console.log('websocket返回的msg',code + '-->'+ msg);
        let content = '';
        
        switch (code) {
          case 0:
            break;
          case 10001:
            content = 'websocket请求参数错误';
            break;
          case 10002:
            content = 'flv转封装失败';
            break;
          case 10003:
            content = 'rtp转封装失败';
            break;
          case 10004:
            content = 'rtmp读写错误	';
            break;
          case 10005:
            content = 'rtmp接收缓存溢出';
            break;
          case 6:
            content = '连接sts服务失败';
            break;
          case 11:
            content = '无效的房间号';
            break;
          case 14:
            content = 'sts连接vtm失败';
            break;
          case 17:
            content = '房间已满';
            break;
          case 18:
            content = 'auth认证失败';
            break;
          case 35:
            content = '房间号不存在';
            break;
        }
        if (content) {
          wx.showToast({
            title: content,
            icon: 'none',
            duration: 300
          });
          // 关闭websocket
          that.websocketClose();
          this.setData({
            talkStatus: 3 // 对讲失败
          });
        }
        
      }
    }
  })

  socketTask.onClose((res) => {
    console.log('WebSocket已关闭', res);
    wx.showToast({
      title: 'websocket连接已关闭',
      icon: 'none'
    })
    // 监听到websocket关闭,关闭推流
    this.stopPush();
    // 强制
    this.exitDevice();
    this.setData({
      talkStatus: 3 // 对讲失败
    });
  })

  socketTask.onError((err) => {
    console.log('WebSocket连接失败', err)
    wx.showToast({
      title: 'WebSocket连接失败',
      icon: 'none'
    });
    // 强制
    this.exitDevice();
    this.setData({
      talkStatus: 3 // 对讲失败
    });
  })
},

// 关闭websocket
websocketClose () {
  // 关闭websocket连接
  const socketTask = app.globalData.socketTask;
  const that = this;
  this.exitDevice()
  const { clientId, roomId } = this.data;
  if (Object.keys(socketTask).length === 0) {
    return
  }
  
  // 关闭bav会话
  let param ={
    cmdType:1004, // 通知服务端断开websocket
    clientId: clientId,
    roomId: roomId,
  };
  wx.sendSocketMessage({
    data: JSON.stringify(param)
  });
  console.log('websocket发送给服务端的消息:', param)
  
  socketTask.close({
    code: 1000,
    success: (res) => {
      console.log('websocket已断开连接', res)
    }
  })
},


// push
pusherStateChange: function(e){
  console.log('>>> live-pusher onPushStateChange:', e.detail.code);
  const code = e.detail.code;
  let content = '';
  switch (code) {
    case 1001:
      console.log('code', code, '已经连接推流服务器');
      break;
    case 1002:
      console.log('code', code, '已经与服务器握手完毕,开始推流');
      break;
    case 1003:
      console.log('code', code, '打开摄像头成功');
      break;
    case 1004:
      console.log('code', code, '录屏启动成功');
      break;
    case 1005:
      console.log('code', code, '推流动态调整分辨率');
      break;
    case 1006:
      console.log('code', code, '推流动态调整码率');
      break;
    case 1007:
      console.log('code', code, '首帧画面采集完成, 推流成功');
      break;
    case 1008:
      console.log('code', code, '编码器启动');
      break;
    case -1301:
      console.log('code', code, '打开摄像头失败');
      break;
    case -1302:
      console.log('code', code, '打开麦克风失败');
      break;
    case -1303:
      console.log('code', code, '视频编码失败');
      break;
    case -1304:
      console.log('code', code, '音频编码失败');
      break;
    case -1306:
      console.log('code', code, '不支持的音频采样率');
      break;
    case -1307:
      console.log('code', code, '网络断连，且经多次重连抢救无效，更多重试请自行重启推流');
      content = '网络出错，推流失败';
      break;
    case -1308:
      console.log('code', code, '开始录屏失败，可能是被用户拒绝');
      break;
    case -1309:
      console.log('code', code, '录屏失败，不支持的Android系统版本，需要5.0以上的系统');
      break;
    case -1310:
      console.log('code', code, '录屏被其他应用打断了');
      break;
    case -1311:
      console.log('code', code, 'Android Mic打开成功，但是录不到音频数据');
      break;
    case -1312:
      console.log('code', code, '录屏动态切横竖屏失败');
      break;
    case 1101:
      console.log('code', code, '网络状况不佳：上行带宽太小，上传数据受阻');
      break;
    case 1102:
      console.log('code', code, '网络断连, 已启动自动重连');
      break;
    case 1103:
      console.log('code', code, '硬编码启动失败,采用软编码');
      break;
    case 1104:
      console.log('code', code, '视频编码失败');
      break;
    case 1105 || 1106:
      console.log('code', code, '新美颜软编码启动失败，采用老的软编码');
      break;
    case 3001:
      console.log('code', code, 'RTMP -DNS解析失败');
      break;
    case 3002:
      console.log('code', code, 'RTMP服务器连接失败');
      break; 
    case 3003:
      console.log('code', code, 'RTMP服务器握手失败');
      break;  
    case 3004:
      console.log('code', code, 'RTMP服务器主动断开，请检查推流地址的合法性或防盗链有效期');
      break; 
    case 3005:
      console.log('code', code, 'RTMP 读/写失败');
      break;
    default:
      console.log('未知错误')
      break;
  };
  wx.showToast({
    title: content,
    icon: 'none'
  })
},

stopPush(){
  console.log('停止推流');
  this.data.pushVideoContext.stop();
  this.setData({
    pushVideo: false
  })
},

startPush(){
  console.log('开始推流，推流地址为:', this.data.pushUrl);
  wx.showToast({
    title: '开始推流，推流地址为:',
  })
  wx.showToast({
    title: this.data.pushUrl,
  })
  this.data.pushVideoContext.start();
  this.setData({
    pushVideo: true
  })
},


error(e) {
  console.log('live-player',e);
  console.error('live-player error:', e.detail.errMsg)
  if(e.detail.errCode == 10001){
    wx.showToast({
      title: '视频播放或录制需要你手机授权微信录音或麦克风权限',
      icon:'none',
      duration:3000,
    })
  }
},

autoPlay(curPlayerContext) {
  this.checkNetWork();
  curPlayerContext.play({
    success: ()=>{
      console.log('播放对讲音频成功');
      
    },
    fail: (error)=>{
      
      console.log('播放对讲音频失败：',error);
    }
  })
},

})
