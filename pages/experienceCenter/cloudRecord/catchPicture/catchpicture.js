import {OPEN_DOMAIN,deviceSerial, channelNo,projectId } from '../../../config/config';


Page({

  /**
   * 页面的初始数据
   */
  data: {
    deviceSerial:deviceSerial,
    fileId: '', //文件编号
    defaultAccessToken: '',
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

  _fileCodeInput (e) {
    const {value} = e.detail;
    if (value.length <= 32) {
      this.setData({
        fileId: value
      })
    } else {
      this.setData({
        fileId: value.slice(0, 31)
      })
    }
  },

  // 保存抓拍图
  _handdleSavePicture () {
    const {fileId,defaultAccessToken,} = this.data;

    wx.request({
      url: `${OPEN_DOMAIN}/api/v3/console/weChat/api/open/cloud/v1/capture/save`,
      method: 'POST',
      data: {
        accessToken: defaultAccessToken,
        deviceSerial: deviceSerial,
        channelNo: channelNo,
        projectId: projectId,
        fileId: fileId,
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      success:(res) => {
        console.log(res.data);

        if (res.data.meta.code == 200) {
          wx.showToast({
            title: '保存成功!',
            icon: 'none'
          });
          let timer = setTimeout(() => {
            wx.navigateBack({
              delta: 1,
            });
            clearTimeout(timer);
          }, 1000)
        } else {
          wx.showToast({
            title: res.data.meta.message,
            icon: 'none'
          })
        }
      },
      fail: (err)=>{
        console.log(err);
      }
    })
  }

})