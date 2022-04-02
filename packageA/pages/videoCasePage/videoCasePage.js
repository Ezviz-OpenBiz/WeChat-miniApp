// pages/videoCasePage/videoCasePage.js
import {
  SELECT_IMAGE,
  INTELLIGENCE_REQUEST,
  INTELLIGENCE_REQUEST_SUCCESS,
  DEMO_RESULT,
  uploadImageForGetBase64,
} from '../../common/common';

// 示例图片加载提示时长
const DEMO_TIMEOUT = 1000;
const defaultPageData = {
  'FISH_SWIMMING_DISTANCE': {
    bannerImgs: ['https://resource.eziot.com/group2/M00/00/6A/CtwQF2GAsD2AKkypAAGaPDWgNS4338.png'],
    tips: [
      '1、在页面内点击使用示例',
      '2、可在上方查看结果视频',
      '3、同时系统会补全摄像头到鱼缸的距离、并输出游动的距离'
    ],
    inputTips: {
      labTitle: ['摄像头到鱼缸的距离'],
      // labDes: ['最多保留两位小数'],
      placeholder: ['最多保留两位小数（单位：米）']
    }
  }
};

Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageData: {
      bannerImgs: [],
      tips: [],
      inputTips: {}
    },
    words: [], // 结果
    videoUrl: '', // 视频地址
    targetDistance: '', // 目标距离
    currentMode: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let mode = options.mode;
    let currentData = defaultPageData[mode];
    this.setData({
      currentMode: mode,
      pageData: currentData
    })
  },

  useDemo: function () {
    const currentMode = this.data.currentMode;
    this.setData({
      words: [],
      targetDistance: null
    });
    const me = this;
    wx.showToast({
      title: '正在分析...',
      icon: 'loading',
      mask: true,
      duration: 60000,
    });
    setTimeout(function () {
      INTELLIGENCE_REQUEST_SUCCESS(DEMO_RESULT[currentMode], currentMode, me.intelligenceSuccess);
    }, DEMO_TIMEOUT)
  },

  // 智能接口成功回调
  intelligenceSuccess: function (data) {
    wx.hideToast();
    if (data.array.length > 0) {
      this.setData({
        isShowResult: true,
        words: data.array,
        targetDistance: data.targetDistance,
        videoUrl: data.videoUrl
      });
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})