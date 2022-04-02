// pages/experienceCenter/messageSend/messageList/messageList.js
import {DateFormat} from '../../../common/utils';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    navData: [
      {id: '0', name: '非法停车侦测', width: 96, activeWidth: 120, picUrl: './images/pic.png', gifUrl: 'https://resource.eziot.com/group2/M00/00/60/CtwQFmDR4OCAF8QPAAFV-bRYLJE343.png', playTime: 0, message: '', show: false},
      {id: '1', name: '应急遥控按钮事件', width: 128,  activeWidth: 160, picUrl: './images/pic.png', gifUrl: 'https://resource.eziot.com/group2/M00/00/60/CtwQF2DR4POALIIsAABT-1U5-RY495.png', playTime: 3, message: '', show: false},
      {id: '2', name: '移动侦测告警', width: 96,  activeWidth: 120, picUrl: './images/pic.png', gifUrl: 'https://resource.eziot.com/group2/M00/00/60/CtwQFmDR4QWAeTivAAELcrkRk5M911.png', playTime: 3, message: '', show: false},
      {id: '3', name: '入侵告警', width: 64, activeWidth: 80, picUrl: './images/pic.png', gifUrl: 'https://resource.eziot.com/group2/M00/00/60/CtwQF2DR4RqAbSPRAAFebO394II975.png', playTime: 5, message: '', show: false},
      {id: '4', name: '人脸检测事件', width: 96,  activeWidth: 120, picUrl: './images/pic.png', gifUrl: 'https://resource.eziot.com/group2/M00/00/60/CtwQFmDR4SeAfkm2AACXt_cmY6w214.png', playTime: 7, message: '', show: false},
      {id: '5', name: '徘徊检测侦测', width: 96,  activeWidth: 120, picUrl: './images/pic.png', gifUrl: 'https://resource.eziot.com/group2/M00/00/60/CtwQF2DR4TeAEhW0AACSfrVxXig631.png', playTime: 10, message: '', show: false},
      {id: '6', name: '婴儿啼哭', width: 64,  activeWidth: 80, picUrl: './images/pic.png', gifUrl: 'https://resource.eziot.com/group2/M00/00/60/CtwQFmDR4UuAIGxxAAIR6xaC8To633.png', playTime: 5, message: '', show: false},
      {id: '7', name: '烟雾告警', width: 64,  activeWidth: 80, picUrl: './images/pic.png', gifUrl: 'https://resource.eziot.com/group2/M00/00/60/CtwQF2DR4VaAewT5AAFncK-FqfI950.png', playTime: 5, message: '', show: false},
      {id: '8', name: '门磁告警', width: 64,  activeWidth: 80, picUrl: './images/pic.png', gifUrl: 'https://resource.eziot.com/group2/M00/00/60/CtwQFmDR4WKAcvqkAABT-1U5-RY016.png', playTime: 5, message: '', show: false}
      
    ],
    //messageType: '3',
    btnActive: true,
    currentTab: 0,
    navScrollLeft: 0,
    windowWidth: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.getSystemInfo({
      success: (res) => {
        const windowWidth = res.windowWidth;
        console.log('页面宽度:',windowWidth);
        this.setData({
          windowWidth: windowWidth
        });

        // 计算初始滚动距离
        this._handdelScrollLeft();
      },
    });
    
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

  // 计算当前滚动距离
  _handdelScrollLeft () {
    const { navData , currentTab, windowWidth} = this.data;
    
    const defaultLeft = (windowWidth - navData[currentTab].activeWidth) / 2;
    console.log('左侧距离', defaultLeft);
    let scrollLeft = 0;

    if (currentTab == 0) {
      scrollLeft = -(defaultLeft - 30);
      // 初始滚动
      this.setData({
        navScrollLeft: scrollLeft
      });
      return
    }

    let leftW = 30; // item margin-left: 30px
    for (let i = 0; i < currentTab; i ++) {
      leftW += navData[i].width + 30
    }

    
    if (leftW >= defaultLeft) {
      scrollLeft = leftW - defaultLeft;
    } else {
      scrollLeft = defaultLeft
    }
    
    // 初始滚动
    this.setData({
      navScrollLeft: scrollLeft
    }) 
  },

  // 点击滚动当前距离
  _changeCurrentTab (event) {
    var cur = event.currentTarget.dataset.current;
    console.log(cur);
    const { navData } = this.data;
    let list = [...navData];
    list[cur].show = false;
    this.setData({
      currentTab: cur,
      navData: [...list]
    }, () => {
      this._handdelScrollLeft()
    })

  },
  switchTab (e) {
    console.log(e.detail.current);
    const cur = e.detail.current;
    const { navData } = this.data;
    let list = [...navData];
    list[cur].show = false;
    this.setData({
      currentTab: cur,
      navData: [...list]
    }, () => {
      this._handdelScrollLeft()
    })
  },

  // 触发事件
  _sendMessage () {
    const {navData , currentTab} = this.data;
    let list = [...navData];
    const sendTime = DateFormat(new Date(),'hh:mm:ss');
    list[currentTab].playTime = sendTime;
    const isShow = list[currentTab].show;
    if (isShow) {
      list[currentTab].show = false;
      this.setData({
        navData: [...list]
      });
      let timer = setTimeout(() => {
        list[currentTab].show = true;
        this.setData({
          navData: [...list]
        });
        clearTimeout(timer);
      }, 300)
    } else {
      list[currentTab].show = true;
      this.setData({
        navData: [...list]
      })
    }
  }

})