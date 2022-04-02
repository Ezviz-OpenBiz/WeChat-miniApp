App({
  globalData: {
    socketTask: {}, // SocketTask对象，用来表示websocket连接，判断是否断线，作为重连的依据。
    socketMsgQueue: [], // 将要发给服务端的socket消息队列
    socketParams: {}, // 暂存socket消息参数
  },
  onLaunch: function () {
    // const me = this;
    // wx.getSystemInfo({success:function(res){
    //   me.platform = res.platform
    // }});
    const me = this;
    wx.getSystemInfo({
      success: function(res){
        me.windowWidth = res.windowWidth;
        console.log(`系统宽度 => ${me.windowWidth}`)
      }
    });
  },
  platform: '',
  windowWidth: '',
  
})