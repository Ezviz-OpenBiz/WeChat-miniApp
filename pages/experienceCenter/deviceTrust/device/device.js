var livePlayerContext;
import {OPEN_DOMAIN} from '../../../config/config';

import { DateFormat } from '../../../common/utils';

Page({

  data: {
    modalVisible: false, // 弹窗
    modalText: '', // 弹窗文案
    currentUserType: 'C', // 当前用户类型
    authorizeType: 'unauthorize', //
    authorizeDeviceList: [], // 已授权设备列表
    deviceList: [{
      id: 'index-1',
      name: 'C3W(C78957921)',  
      deviceSerial: 'C78957921',
      category: 'IPC',
      picUrl: './images/pic.png', // 背景图
      trustType: 0 // trustType == 1 表示已授权

    }], // 设备列表 
    searchItem: '', //设备搜索
    checkAll: false, // 是否全选
    videoPlayModalShow: false, // 播放弹窗
    // 以下为播放数据
    accessToken: '',
    scene: 1001,
    accessToken: '',
    deviceName: 'C3W(C78957921)',
    deviceSerial: 'C78957921',
    channelNo: '1',
    videoSrc: "",
    panelStatus: 0, //0: 展示面板 1：进入云台 2-进入语音播报 3-进入镜像翻转 4-进入镜头遮蔽,
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
    isHD: false,
    deviceOffline: false,
    deviceOfflineTime: new Date(),
  },


  /**
   * 生命周期函数--监听页面卸载
   */
  onLoad: function (options) {
    livePlayerContext = wx.createLivePlayerContext('livePlayer');
    console.log('播放窗口',livePlayerContext);
    const { userType } = options;
    // console.log('获取参数',userType);
    this.setData({
      currentUserType: userType
    })
  },

  onShow () {
    console.log("show");
    
  },

  onHide () {

  },


  // 用户类型切换
  _changeUserTypeToB () {
    this.setData({
      currentUserType: 'B',
    })
  },

  _changeUserTypeToC () {
    this.setData({
      currentUserType: 'C'
    })
  },

  // 托管设备列表类型
  _changeToUnauthorize () {
    this.setData({
      authorizeType: 'unauthorize',
      checkAll: false
    })
  },

  _changeToAuthorize () {
    this.setData({
      authorizeType: 'authorize',
      checkAll: false
    })
  },

  // 搜索项输入
  _searchItemInput (e) {
    const {value} = e.detail;
    if (value.length <= 32) {
      this.setData({
        searchItem: value
      })
    } else {
      this.setData({
        searchItem: value.slice(0, 31)
      })
    }
  },

  // 清空搜索框
  _clearSearchItem () {
    this.setData({
      searchItem: ''
    })
  },

  // 搜索设备列表  // 当前只有一台测试设备，搜索到的设备不进行重新渲染设备列表
  _searchDevice () {
    const { searchItem, authorizeType, authorizeDeviceList, deviceList } = this.data;
    
    if (authorizeType === 'authorize') {
      const index = authorizeDeviceList.findIndex((item, index, arr) => {
        return item.deviceSerial == searchItem;
      });

      if (index == -1) {
        wx.showToast({
          title: '设备不存在',
          icon: 'none'
        })
      } else {
        wx.showToast({
          title: '搜索成功',
          icon: 'none'
        })
      }
    } else if (authorizeType === 'unauthorize') {
      const index = deviceList.findIndex((item, index, arr) => {
        return item.deviceSerial == searchItem;
      });

      if (index == -1) {
        wx.showToast({
          title: '设备不存在',
          icon: 'none',
        })
      } else {
        wx.showToast({
          title: '搜索成功',
          icon: 'none',
        })
      }
    }
  },

  // ***********当前只有一台设备，以下方法未兼容多台设备*************

  // 全选
  _allItemChecked (e) {
    
    const {checkAll} = this.data;
    this.setData({
      checkAll: !checkAll
    })
  },

  // 授权
  _trustDevice () {
    const {deviceList} = this.data;
    let list = [...deviceList];
    list.map((item) => {
      item.trustType = 1
    });
    this.setData({
      deviceList: [...list],
      authorizeDeviceList: [...list],
      checkAll: false,
    });
    wx.showToast({
      title: '操作成功!',
      icon: 'none'
    });
  },

  // 解除授权
  _cancelTrust () {
    const {deviceList} = this.data;
    let list = [...deviceList];
    list.map((item) => {
      item.trustType = 0
    });
    this.setData({
      deviceList: [...list],
      authorizeDeviceList: [],
      checkAll: false,
    });
    wx.showToast({
      title: '操作成功!',
      icon: 'none'
    });
  },

  // ***********以下为视频播放功能************
  // 设备播放窗口
  _playVideoModalShow () {
    this.setData({
      videoPlayModalShow: true
    });

    // 检查网络
    this.checkNetWork();
    // 先获取accessToken,再获取播放地址
    // this._getAccessToken();
    this.getPlayUrl();
              this.getDeviceInfo();
              this.getDeviceCoverInfo();
  },

  // 关闭播放窗口
  _playVideoModalHidden () {
    this.handleStop();
    this.setData({
      videoPlayModalShow: false,
    });
  },

  // 检查网络状态
  checkNetWork () {
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

  // 获取accessToken
    _getAccessToken () {
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
            const accessToken = res.data.data.accessToken;
            this.setData({
              accessToken: accessToken
            });
            if (accessToken) {
              this.getPlayUrl();
              this.getDeviceInfo();
              this.getDeviceCoverInfo();
            }
          }
        },
        fail: (err)=>{
          console.log(err);
        }
      })
    },

    getPlayUrl () {
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
          // const { list } = this.data;
          if(res.data.code ==200 && res.data.data && res.data.data.url){
            var result = res.data;
            if(result.code == 200){
              _this.setData({
                videoSrc: result.data.url,
              })
            } else {
              // _this.setData({
              //   dialogContent: result.msg,
              //   showVideoControls: false,
              // })
              wx.showToast({
                title: '获取播放地址失败',
                icon: 'none'
              })
            }
          } else {
            // console.log("获取播放地址失败")
            wx.showToast({
              title: '获取播放地址失败',
              icon: 'none'
            })
          }
        }
      });
    },

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
                list[3].status = 1;
                this.setData({
                  videoNetWorkError: false,
                  showVideoControls: false,
                  panelStatus: 4,
                  videoLoadingStatus: 100,
                  // list: list,
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
            
            if(result.status != 1 ){ // 设备不在线
              list[0].status = -1;
              list[1].status = -1;
              list[2].status = -1;
              list[3].status = -1;
              _this.setData({
                // list:list,
                showVideoControls: false
              })
            }else if(result.isEncrypt == 1 ){ // 设备被加密
              list[0].status = -1;
              list[1].status = -1;
              list[2].status = -1;
              list[3].status = -1;
              _this.setData({
                // list:list,
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

      handlePlay(callback){
        console.log("handelPlay",this.data.playVideo,this.data.isHD);
          this.checkNetWork()
          livePlayerContext.play({
            success: ()=>{
              this.setData({
                // playVideo: true,
                showVideoControls: true,
                videoLoadingStatus: 20,
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
        livePlayerContext.stop({
          success: ()=>{
            this.setData({
              playVideo: false,
              videoLoadingStatus: 0,
              panelStatus: 0,
            });
            if(callback && typeof callback === "function"){
              callback();
            }
            console.log("停止播放成功", this.data.videoLoadingStatus)
          },
          fail: (error)=>{
            console.log("停止播放失败")
          }
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
            title: '视频播放需要你手机授权微信录音或麦克风权限',
            icon:'none',
            duration:3000,
          })
        }
      },

      handleSound(e){
        var openSound = this.data.openSound;
        this.setData({
          openSound: !openSound,
        })
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
          // this.autoHideControl();
          // this.getDeviceCapacity();
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
          //list[2].status = -1;
          this.setData({
            // playVideo: false,
            showVideoControls: false,
            videoNetWorkError: true,
            videoLoadingStatus: 100,
            //list: list,
          })
          break;
          case -2301: // 经多次重连抢救无效，更多重试请自行重启播放
            videoLoadingStatus = 100;
            this.setData({
              // playVideo: false,
              showVideoControls: false,
              videoNetWorkError: true,
              videoLoadingStatus: 100,
            })
            break;
        }
        this.setData({
          videoLoadingStatus: videoLoadingStatus
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