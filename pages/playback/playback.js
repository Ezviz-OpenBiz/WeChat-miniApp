// pages/playback/playback.js
import {OPEN_DOMAIN} from '../config/config';

let livePlayerContext;
var init;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    accessToken: '',
    deviceSerial: '',
    channelNo: '',
    videoSrc: 'rtmp://xyrtmp.ys7.com:1935/v3/openpb/C78957921_1_1?begin=20211110061910&end=20211110061931&expire=1636615248&id=378564661994004480&rec=cloud&t=7920d6711740bfe795e9f06ceff646a6345d059b8fc14152acde1478468ccdbf&ev=100&ownerId=openteam&streamer=cloud.ys7.com:32723&VideoType=2&StorageVersion=2',
    coverDisabled: true,
    coverInterval: false,
    showVideoControls: true,
    autoHideTimer: undefined,
    videoLoadingStatus: 0,
    playVideo: false,
    videoNetWorkError: false,
    objectFit:'contain',
    openSound: true,
    isHD: false,
    showHDSelect: false,
    fullScreen: false,
    
    deviceOffline: false,
    deviceOfflineTime: new Date(),
    deviceName: '',
    dialogTitle: '',
    dialogContent: '',
    buttons: [{text: '知道了'}],
    dialogShow: false,
    dialogNodataTitle: '',
    dialogNodataContent: '',
    dialogNodataShow: false,
    cloudPalayParam: null,
    playCode: 0, // 当前播放错误码，
    switch1Checked: true,
    recType: 2, // 1-云存储，2-本地录像
    type: 2, // 2-本地录像回放，3-云存储录像回放
    switchText: '本地', 
    param: {},  // 获取播放片段参数
    date: '', // 当前选择日期
    dateLine: [], // 时间片段
    contentItemShow: false, // 暂无数据
    toDay: '', // 今日日期
    page: 1, // 当前页面层级
  },
  onLoad: function (options) {
    livePlayerContext = wx.createLivePlayerContext('livePlayer');
    console.log('获取参数',options);
    // 获取当前页面栈
    const currentPage = getCurrentPages();

    console.log(currentPage.nv_length);
    
    // 获取url携带的参数
    const { accessToken, deviceSerial, channelNo, date, switch1Checked } = options
    this.setData({
      playVideo: true,
      accessToken: accessToken, 
      deviceSerial: deviceSerial, 
      channelNo: channelNo,
      page: currentPage.nv_length,
    });
    console.log(date);
    // 通过分享今日指定日期
    if (date) {
      this.setData({
        date: date,
        toDay: date
      })
    } else {
      // 获取当前日期
      this.getTodayDate();
    }
    if (switch1Checked == "false") {
      this.setData({
        switchText: '云存储',
        switch1Checked: false,
        recType: 1,
        type: 3
      });
    }
    // 获取包含播放片段的时间片段
    this.getTimeLine();
    
   
  },
  // 模态框按钮
  tapDialogButton(e) {
    this.setData({
        dialogShow: false
    });
    wx.navigateBack({
      delta: 1
    })
  },
  // 无时间片段数据时
  tapDialogNodataButton() {
    this.setData({
      dialogNodataShow: false
    })
  },
  // 获取存储类型
  switch1Change: function (e) {
    console.log('当前存储类型', e.detail);
    if (e.detail.value == false) {
      this.setData({
        switchText: '云存储',
        switch1Checked: false,
        recType: 1,
        type: 3
      });
      this.getTimeLine();
    } else{
      this.setData({
        switchText: '本地',
        switch1Checked:true,
        recType: 2,
        type: 2
      });
      this.getTimeLine();
    }
  },
  // 获取当天日期
  getTodayDate: function () {
    const that = this;
    let type = null;
    var time = new Date();
    var h = time.getFullYear();
    var m = time.getMonth() + 1;
    var d = time.getDate();
    let date = (h > 9 ? h : '0' + h) + '-' + ( m > 9 ? m : '0'+ m) + '-' + ( d > 9 ? d : '0' + d);
    this.setData({
      date: date,
    });
    // 获取当前操作系统类型
    wx.getSystemInfo({
      success (res) {
        console.log('当前操作系统：',res.system);
        const sys = res.system;
        type = sys.split(' ');
        console.log(type);
        if (type[0] == 'iOS') {
          that.setData({
            toDay: date.replace(/\-/g,'/')
          });
        } else {
          that.setData({
            toDay: date
          })
        }
      }
    });
  },

  
  format: function(now) { 
    var time = new Date(now);
    var h = time.getHours();     //返回日期中的小时数（0到23）
    var m = time.getMinutes(); //返回日期中的分钟数（0到59）
    var s = time.getSeconds(); //返回日期中的秒数（0到59）
    return (h > 9 ? h : '0' + h) + ':' + ( m > 9 ? m : '0'+ m) + ':' + ( s > 9 ? s : '0' + s);
  },
  
   // 获取时间轴
   getTimeLine: function () {
    const { recType, date, accessToken, deviceSerial, channelNo, timelineTimer, currentTimer } = this.data;
    
    console.log('获取到的accessToken, accessToken', accessToken);
    var _this = this;
    let currentDate = null;
    let timestampCurrent = null;
    let timestampToday = null;
    // 时间戳转换：Date.parse(new Date("2020-09-23 12:13:56"))
    if (date) {
      currentDate = date;
      const time = currentDate + ' ' + '00:00:00';
      const endTime = currentDate + ' '+ '23:59:59'
      timestampToday = Date.parse(new Date(time.replace(/\-/g, '/'))); // 选择日期凌晨时间戳
      timestampCurrent = Date.parse(new Date(endTime.replace(/\-/g, '/'))); // 选择日期时间戳
    } 
  
    wx.request({
      url: `${OPEN_DOMAIN}/api/lapp/video/by/time`, 
      method: 'POST',
      data: {
        accessToken: accessToken,
        deviceSerial: deviceSerial,
        channelNo: channelNo,
        recType: recType,
        startTime: timestampToday,
        endTime: timestampCurrent
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      success: (res) => {
        console.log('获取播放时间片段',res.data);
        if( res.data.code ==200 ){
          if ( res.data.data != null ) {
            var result = res.data.data;
            const len = result.length;
            let availArr = [];
            for (let i = len-1; i >= 0; i--) {
              let res = result[i];
              let et = null;
              let st = null;
              // 最近片段可能存在endTime超过当前时间
              if ( i == (len-1) && (res.endTime > timestampCurrent)) {
                et = this.format(timestampCurrent)
              } else {
                et = this.format(res.endTime)
              }
              // 存在startTime可能为前一天的时间
              if (i == 0 && (res.startTime < timestampToday)) {
                st = this.format(timestampToday)
              } else {
                st = this.format(res.startTime);
              }
              availArr.push({
                st: st,
                et: et,
              })
            }
            console.log('availArr:', availArr);
            this.setData({
              dateLine : availArr,
            })
          } else {
            this.setData({
              dialogNodataTitle: '暂无数据',
              dialogNodataContent: ' 暂无录像片段',
              dialogNodataShow: true,
              dateLine: [],
            });
            this.handleStop();
          }
        } else if ( res.data.code == '10002' ) {
          this.setData({
            dialogTitle: '',
            dialogContent: 'accessToken过期或异常',
            dialogShow: true,
            dateLine: [],
          })

        } else if (res.data.code == "20002") {
          this.setData({
            dialogTitle: '获取播放时间片段失败',
            dialogContent: '设备不存在',
            dialogShow: true,
            dateLine: [],
          })
        } else if (res.data.code == "20007") {
          this.setData({
            dialogTitle: '获取播放时间片段失败',
            dialogContent: '设备不在线',
            dialogShow: true,
            dateLine: [],
          })
        } 
        else {
          this.setData({
            dialogTitle: '获取播放时间片段失败',
            dialogContent: res.data.msg,
            dialogShow: true,
            dateLine: [],
          })
        }
      }
    })
  },
  // 获取播放时间片段
  getPalyParam: function (e) {
    let stTime = e.detail.stTime;
    let etTime = e.detail.etTime;
    const { type, date, accessToken, deviceSerial, channelNo, videoSrc, } = this.data;
    console.log('当前播放时间', stTime, etTime);
   
    let startTime = null;
    let stopTime = null;
   
    startTime = date + ' ' + stTime;
    stopTime = date + ' ' + etTime;
    
    const param = {
      'accessToken': accessToken,
      'channelNo': channelNo,
      'deviceSerial': deviceSerial,
      'protocol': 3, // 流播放协议，1-ezopen、2-hls、3-rtmp
      'startTime': startTime,
      'stopTime': stopTime,
      'type': type, // 由页面按钮传入值
      'expireTime': 86400
    }
    // 获取播放地址
    this.getPlayUrl(param);

    this.setData({
      param: param
    })
  },
  
  // 获取播放地址
  getPlayUrl(param){
    var _this = this;
    wx.request({
      url: `${OPEN_DOMAIN}/api/lapp/v2/live/address/get`, 
      method: 'POST',
      data: param,
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      success: (res) => {
        console.log('获取到的播放地址：',res.data);
        if(res.data.code == "200" && res.data.data && res.data.data.url){
          const playUrl = res.data.data.url;        
          this.setData({
            videoSrc: playUrl
          });
          // 先停止
          this.handleStop();
          // 开始播放
          this.handlePlay();        
          console.log('当前播放地址：', this.data.videoSrc);
        } else if (res.data.code == "20007") {
          debugger;
          this.setData({
            dialogTitle: '获取播放地址失败',
            dialogContent: '设备不在线',
            dialogShow: true,
          })
        } else if (res.data.code == "20002") {
          this.setData({
            dialogTitle: '获取播放地址失败',
            dialogContent: '设备不存在',
            dialogShow: true,
          })
        } else if (res.data.code == "20001") {
          this.setData({
            dialogTitle: '获取播放地址失败',
            dialogContent: '摄像头不存在',
            dialogShow: true,
          })
        } else if (res.data.code == "20018") {
          this.setData({
            dialogTitle: '获取播放地址失败',
            dialogContent: '用户不拥有该设备',
            dialogShow: true,
          })
        } else if (res.data.code == "10001") {
          this.setData({
            dialogTitle: '获取播放地址失败',
            dialogContent: '参数错误',
            dialogShow: true,
          })
        } else if (res.data.code == "60019") {
          this.setData({
            dialogTitle: '获取播放地址失败',
            dialogContent: '设备已被加密，无法继续查看，请前往萤石云app解密。',
            dialogShow: true,
          })
        } else {
          this.setData({
            dialogTitle: '获取播放地址失败',
            dialogContent: res.data.msg,
            dialogShow: true,
          })
          console.log("获取rtmp播放地址失败")
        }
      }
    })
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
 
  handlePlay(callback){
    console.log("handelPlay",this.data.playVideo,this.data.isHD);
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
          this.setData({
            videoNetWorkError: true,
            showVideoControls: false,
            videoLoadingStatus: 100,
          })
        }
      })
  },
  handleStop(callback){
    console.log("stop");
    const { list } = this.data;
    livePlayerContext.stop({
      success: ()=>{
        
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
    let { videoLoadingStatus,list,panelStatus } = this.data;
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
      this.setData({
        playVideo: true,
      })
      this.autoHideControl();
      break;
      case 2103: //网络断连, 已启动自动重连（本小程序不自动重连）
      break;
      case 3001:
      case 3002:
      case 3003:
      case 3005: // 播放失败
      videoLoadingStatus = 100;
      this.checkNetWork();
      this.handleStop(this.playError);
      this.setData({
        showVideoControls: false,
        videoNetWorkError: true,
        videoLoadingStatus: 100,
      })
      break;
      case -2301: // 经多次重连抢救无效，更多重试请自行重启播放
        videoLoadingStatus = 100;
        this.setData({
          showVideoControls: false,
          videoNetWorkError: true,
          videoLoadingStatus: 100,
        })
        break;
    }
    this.setData({
      videoLoadingStatus: videoLoadingStatus,
      playCode: code
    })
  },
  playError(){
    this.setData({
      showVideoControls: false,
      videoNetWorkError: true,
      videoLoadingStatus: 100,
    });
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

  tapDialogButton(e) {
    this.setData({
        dialogShow: false
    });
    this.pageBack();
  },
  pageBack() {
    wx.navigateBack({
      delta: 1
    })
  },
    /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(res) {
    const { accessToken, deviceSerial, channelNo, date,switch1Checked} = this.data;
    console.log(switch1Checked);
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target);
      this.setData({
        panelStatus: 0,
      })
    }
    return {
      title: '小程序',
      path:  '/pages/playback/playback?accessToken=' + accessToken + '&deviceSerial='+ deviceSerial + '&channelNo=' + channelNo + '&date=' + date + '&switch1Checked=' + switch1Checked ,
    }
  },

  // 时间选择器
  bindDateChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      date: e.detail.value
    });

    this.getTimeLine();
  },

  // 返回直播
  goToLive(){
    const { accessToken,deviceSerial, channelNo } = this.data;
    let url = '/pages/live/live?accessToken=' + accessToken + '&deviceSerial='+ deviceSerial + '&channelNo=' + channelNo;
    wx.navigateTo({
      url: url,
    })
  },
});
