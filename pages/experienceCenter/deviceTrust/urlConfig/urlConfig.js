// pages/experienceCenter/deviceTrust/urlConfig/urlConfig.js.js

const appKey = '26810f3acd794862b608b6cfbc32a6b8';
import {OPEN_DOMAIN} from '../../../config/config';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    appkey: '',
    state: '',
    accessToken: '',
    urlType: 'custom',
    defaultAccessToken: 'at.07ev40d0388a6hsw8sv5j2ke0ljeb1u2-1e7i85xqln-1n4okj8-ha14dpux5',
    modalVisible: false, // 弹窗
    modalText: '', // 弹窗文案
    vailModalVisible: false, // 账户校验弹窗
    vailModalText: '', // 账户校验文案
    type: 'info',
    infoError: true, // 配置信息错误
    vaildInfo: {
      clientType:0,
      clientVersion:'V1.8.1.20131202',
      netType:'LTE',
      osVersion:'11.2.1',
      sdkVersion:'v4.8.1.20171228',
      featureCode:'5158cd127638880a083811ad81df37b7'
    }
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    // this._getAccessToken();
  },


  // 获取token
  _getAccessToken(){
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
            defaultAccessToken: res.data.data.accessToken
          })
        }
      },
      fail: (err)=>{
        console.log(err);
      }
    })
  },

  _appkeyInput(e) {
    const {value} = e.detail;
    const appkeyReg =  /^[a-zA-Z0-9]+$/;
    if (!appkeyReg.test(value)) {
      wx.showToast({
        title: '请输入正确的client_id',
        icon: 'none'
      })
      return
    }
    if (value.length <= 32) {
      this.setData({
        appkey: value
      })
    } else {
      this.setData({
        appkey: value.slice(0, 31)
      })
    }
  },

  _stateInput(e) {
    const {value} = e.detail;
    if (value.length <= 32) {
      this.setData({
        state: value
      })
    } else {
      this.setData({
        state: value.slice(0, 31)
      })
    }
    
  },

  _accessTokenInput(e) {
    const {value} = e.detail;
    if (value.length <= 64) {
      this.setData({
        accessToken: value
      })
    } else {
      this.setData({
        accessToken: value.slice(0, 63)
      })
    }
  },

  _inputItemBlur() {
    const {appkey, state, accessToken} = this.data;
    if (!appkey || !state || !accessToken) {
      return
    } else {
      this._accessTokenAndAppkey()
    }
  },

  // 更换url类型
  _onchangeType () {
    const {urlType, defaultAccessToken} = this.data;
    if (urlType == 'custom') {
      this.setData({
        infoError: false,
        urlType: 'default',
        appkey: appKey,
        state: 'test',
        accessToken: defaultAccessToken,
      })
    } else {
      this.setData({
        infoError: true,
        urlType: 'custom',
        appkey: '',
        state: '',
        accessToken: '',
      })
    }
  },

  // 开始体验 
  _handdleExperience () {
    const {appkey, state, accessToken, urlType } = this.data;
    if (!appkey || !state || !accessToken) {
      return
    }
    if (urlType ==  'default') {
      this.setData({
        infoError: false,
        modalVisible: true,
        modalText: '您即将以C用户身份开始托管设备流程，在使用过程中，可以随时切换身份'
      });
      return
    } else {
      // 校验账户信息，1、验证appkey与accessToken是否一致/

      const successCallBack = () => {
        this.setData({
          modalVisible: true,
          modalText: '您即将以C用户身份开始托管设备流程，在使用过程中，可以随时切换身份'
        });
      }

      const errorCallback = () => {
        this.setData({
          vailModalVisible: true,
          vailModalText: '您的账号错误，请输入正确的账号信息'
        });
      }
      
      this._accessTokenAndAppkey(successCallBack, errorCallback);
    }
    
  },

  _handdleOk () {
    this._handCancel();
    wx.navigateTo({
      url: '/pages/experienceCenter/deviceTrust/login/login?client_id='+ appKey,
    })
  },

  _handCancel () {
    this.setData({
      modalVisible: false,
      vailModalVisible: false,
    })
  },

  // 校验accessToken是否与appkey一致
  _accessTokenAndAppkey (successCallBack, errorCallback) {
    const {vaildInfo, appkey, accessToken } = this.data;
    const {clientType, clientVersion, netType, osVersion, sdkVersion, featureCode} = vaildInfo;
    const params = {
      clientType,
      clientVersion,
      netType,
      osVersion,
      sdkVersion,
      featureCode,
      accessToken,
      appKey: appkey
    };

    wx.request({
      url: `${OPEN_DOMAIN}/api/server/info`,
      method: 'POST',
      data: {...params},
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      success:(res) => {
        console.log(res);
        const data = res.data;
        if (data.resultCode == 200) {
          // 校验账户appkey是否存在
          this._isAppkey(successCallBack, errorCallback)
        } else {
          this.setData({
            infoError: true,
            vailModalVisible: true,
            vailModalText: '您的账号错误，请输入正确的账号信息'
          });

        }
      },
      fail: (err)=>{
        console.log(err);
      }
    })
  },

  // 校验账户appkey
  _isAppkey (successCallBack, errorCallback) {
    wx.request({
      url: 'https://openauth.ys7.com/trust/device/info?client_id=' + this.data.appkey,
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      success:(res) => {
        console.log(res);
        const data = res.data;
        if (data.code == 200) {
          console.log('存在');
          this.setData({
            infoError: false
          })
          successCallBack && successCallBack()
        } else {
          console.log('不存在');
          thid.setData({
            infoError: true
          });
          errorCallback && errorCallback()
        }
      },
      fail: (err)=>{
        console.log(err);
        thid.setData({
          infoError: true
        });
      }
    })
  },

  // 复制链接到本地
  _textCopy () {
    const {appkey, state, accessToken} = this.data;
    if (!appKey || !state) {
      wx.showToast({
        title: '请补全配置信息',
        icon: 'none'
      });
      return
    }
     
    wx.setClipboardData({
      data: `${OPEN_DOMAIN}/oauth2/trust/device?client_id=${appkey}&response_type=code&state=${state}`,
      success (res) {
        wx.getClipboardData({
          success (res) {
            console.log(res.data) // data
          }
        })
      }
    })
  }
})