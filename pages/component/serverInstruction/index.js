// pages/component/serverInstruction/serverInstruction.wxml.js
let manager = wx.getBackgroundAudioManager();

Component({

  /**
   * 页面的初始数据
   */
  data: {
    playStatus: false,
  },

  properties: {
    server_instruction: {
      type: String
    },
    server_name: {
      type: String
    },
    audio_src: {
      type: String
    },
    audioName: {
      type: String
    }
  },

  lifetimes: {
    attached: function() {
      console.log('attached');
      // 自动播放
      this._playMusic();
      
    },
    detached: function() {
      console.log('detached');
      this._stopVoice()
    },
  },

  methods: {
    _playMusic: function() {
     
      
      
      let that = this;
      manager.pause(function() {
        that.setData({
          playStatus: false
        })
        console.log("======onPause======");
      });
      manager.onPlay(function() {
        console.log("======onPlay======");
        that.setData({
          playStatus: true
        })
        
      });
      manager.onPause(function() {
        that.setData({
          playStatus: false
        })
        console.log("======onPause======");
      });
      manager.onEnded(function() {
        console.log("======onEnded======");
        that.setData({
          playStatus: false
        })
      });
      manager.onStop(function() {
        console.log("======onStop======");
        that.setData({
          playStatus: false
        })
      });
    },
    
    //播放按钮
    _playOrpause: function() {
      console.log('_playOrpause');

      
      if (this.data.playStatus) {
        manager.pause();
        this.setData({
          playStatus: false
        })
      } else {
        const {audio_src, audioName} = this.properties;
        manager.title = audioName;
        const audioSrc = audio_src;
        console.log('播放地址', audioSrc);
        manager.src = audioSrc;
        manager.play();
        this.setData({
          playStatus: true
        })
      }
    },

    // 停止播放
    _stopVoice () {
      manager.stop(function() {
        console.log("======onStop======");
        that.setData({
          playStatus: false
        })
      });
    }
    
  }
  

})