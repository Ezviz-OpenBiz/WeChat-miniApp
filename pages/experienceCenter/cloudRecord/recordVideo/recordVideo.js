import { DateFormat } from '../../../common/utils';
var dateTimePicker = require('../../../common/dateTimePicker');

import {OPEN_DOMAIN, deviceSerial, channelNo,projectId} from '../../../config/config';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    
    fileId: '', //文件编号
    deviceSerial: deviceSerial,
    defaultAccessToken: '',
    recType: 'local', // cloud local
    startTime: null,
    endTime: null,
    voiceSwitch: 1, // 1-打开，2-关闭
    availStartTime: '', // 可选开始
    availEndTime: '', //
    // validateCode: '', // 解密密钥
    errorTime: false,
    dateTimeArray: null,
    dateTime: null,
    startYear: 2000,
    endYear: 2050
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    // this._getAccessToken();
    // 获取完整的年月日 时分秒，以及默认显示的数组
    var obj = dateTimePicker.dateTimePicker(this.data.startYear, this.data.endYear);
    this.setData({
      dateTime: obj.dateTime,
      dateTimeArray: obj.dateTimeArray,
    });
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

  // 判断时间选择
  _vailTime () {
    const { startTime, endTime, dateTime, dateTimeArray } = this.data;
    // 昨日日期
    var day1 = new Date();
    day1.setTime(day1.getTime()-24*60*60*1000);
    const lastDate = day1.getFullYear()+"/" + (day1.getMonth()+1) + "/" + day1.getDate();

    // 今日日期
    var day2 = new Date();
    day2.setTime(day2.getTime());
    const today = day2.getFullYear()+"/" + (day2.getMonth()+1) + "/" + day2.getDate();

    // 当前时间
    var myHour = day1.getHours(); //获取当前小时数(0-23)
    var myMinute = day1.getMinutes(); //获取当前分钟数(0-59)
    var mySecond = day1.getSeconds();
    const currentTime = myHour + ':' + myMinute + ':' + mySecond;
 
    const ct = today + ' ' + currentTime;
    const st = dateTimeArray[0][startTime[0]] + ':' + dateTimeArray[1][startTime[1]] + ':' + dateTimeArray[2][startTime[2]];
    const et = dateTimeArray[0][endTime[0]] + ':' + dateTimeArray[1][endTime[1]] + ':' + dateTimeArray[2][endTime[2]];

    const ctStemp = (Date.parse(ct));
    const stStemp = (Date.parse(today + ' ' + st));
    const lastStStemp = (Date.parse(lastDate + ' ' + st));
    const etStemp = (Date.parse(today + ' ' + et));
    const lastEtStemp = (Date.parse(lastDate + ' ' + et));
    const odayStemp = (Date.parse(today + ' ' + "00:00:00"));

    console.log('currentTime, startDate, endDate:',ctStemp, stStemp,lastStStemp, etStemp, lastEtStemp, odayStemp);

    wx.showToast({
      title: lastEtStemp - lastStStemp,
    })

    if (stStemp >= ctStemp && etStemp > ctStemp) {
      if ((lastEtStemp - lastStStemp) <= 30*1000 && lastEtStemp != lastStStemp) {
        
        return [DateFormat(lastDate, 'yyyy-MM-dd') + st, DateFormat(lastDate, 'yyyy-MM-dd') + et]
      } else {
        return false
      }
    } else if (stStemp < ctStemp && etStemp <= ctStemp) {
      if ((etStemp - stStemp) <= 30*1000 && etStemp != stStemp) {
        return [DateFormat(today, 'yyyy-MM-dd') + st, DateFormat(today, 'yyyy-MM-dd') + et]
      } else {
        return false
      }
    } else if (stStemp > ctStemp && etStemp <= ctStemp) {
      if ((etStemp - lastStStemp) <= 30*1000 && etStemp != lastStStemp) {
        return [DateFormat(lastDate, 'yyyy-MM-dd') + st, DateFormat(today, 'yyyy-MM-dd') + et]
      } else {
        return false
      }
    } else {
      return false
    }
    
  },

  // 保存音视频
  _handdleSavePicture () {
    const {fileId,defaultAccessToken, recType, startTime,
      endTime, voiceSwitch
    } = this.data;

    console.log(startTime, endTime);
   
    const rangeTime = this._vailTime();


    if (!rangeTime) {
      this.setData({
        errorTime: true
      });
      wx.showToast({
        title: '只能选择30s内',
        icon: 'none'
      })
      return
    } else {
      this.setData({
        errorTime: false
      })
    }

    const startDate = rangeTime[0].replace(/\:|\-/g, '');
    const endDate = rangeTime[1].replace(/\:|\-/g, '');

    console.log(deviceSerial, channelNo,fileId,projectId,defaultAccessToken, recType, startDate,
      endDate, voiceSwitch);
    wx.request({
      url: `${OPEN_DOMAIN}/api/v3/console/weChat/api/open/cloud/v1/video/save`,
      method: 'POST',
      data: {
        accessToken: defaultAccessToken,
        deviceSerial: deviceSerial,
        channelNo: channelNo,
        projectId: projectId,
        fileId: fileId,
        // validateCode: validateCode,
        recType: recType,
        startTime: startDate,
        endTime: endDate,
        voiceSwitch: voiceSwitch
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
  },

  // 录像来源
  _originRadioChange (e) {
    console.log(e.detail.value)
    this.setData({
      recType: e.detail.value
    })
  },

  // 录像来源
  _originRadioChange (e) {
    console.log(e.detail.value)
    this.setData({
      recType: e.detail.value
    })
  },

  // 声音
  _voicerRadioChange (e) {
    this.setData({
      voiceSwitch: e.detail.value
    })
  },

  // 开始时间
  _bindStartTimeChange(e){
    this.setData({ startTime: e.detail.value });
  },
  _bindStartTimeColumn(e){
    // console.log('colum:', e)
    var arr = this.data.dateTime, dateArr = this.data.dateTimeArray;

    arr[e.detail.column] = e.detail.value;
    
    this.setData({
      dateTimeArray: dateArr,
      startTime: arr
    });
  },

  // 结束时间
  _bindEndTimeChange(e){
    this.setData({ endTime: e.detail.value });
  },
  _bindEndTimeColumn(e){
    // console.log('colum:', e)
    var arr = this.data.dateTime, dateArr = this.data.dateTimeArray;

    arr[e.detail.column] = e.detail.value;
    
    this.setData({
      dateTimeArray: dateArr,
      endTime: arr
    });
  },

})