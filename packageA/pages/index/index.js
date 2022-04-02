//index.js
//获取应用实例
const app = getApp();

Page({
  data: {
    list: [
      {
        id: 'face',
        name: '人脸识别',
        open: true,
        pages: [
          {
            name: '人脸检测',
            path: 'faceAnalysisDetect',
          },
          {
            name: '人脸比对',
            path: 'faceAnalysisCompare',
          },
          {
            name: '人脸分析',
            path: 'faceAnalysisDetect2',
          },
        ],
      },
      {
        id: 'man',
        name: '人形检测',
        open: false,
        pages: [
          {
            name: '人形检测',
            path: 'humanAnalysisDetect',
          },
        ],
      },
    ],
    listData: [
      {
        name: '宠物类',
        pages: [
          {
            name: '金龙鱼游动距离',
            icon: '../../images/ic_fish.png',
            id: 'FISH_SWIMMING_DISTANCE',
            link: '../videoCasePage/videoCasePage?mode=FISH_SWIMMING_DISTANCE'
          },
          {
            name: '猫砂刻度线',
            icon: '../../images/ic_cat.png',
            id: 'CAT_LITTER_SCALE',
            link: '../intelligence/intelligence?mode=CAT_LITTER_SCALE'
          },
          {
            name: '宠物检测',
            icon: 'https://resource.eziot.com/group2/M00/00/6D/CtwQFmG66wyAUPigAAAC9i4RoL0837.png',
            id: 'PET_DETECTION',
            link: '../intelligence/intelligence?mode=PET_DETECTION'
          },
          {
            name: '宠物分类',
            icon: 'https://resource.eziot.com/group2/M00/00/6D/CtwQFmG64J6APMuEAAACIzyAtfo735.png',
            id: 'PET_CLASSIFY',
            link: '../intelligence/intelligence?mode=PET_CLASSIFY'
          },
        ]
      },
      {
        name: '训练算法',
        des: '特定场景与角度下训练的算法',
        pages: [
          {
            name: '抽烟检测',
            icon: 'https://resource.eziot.com/group2/M00/00/6E/CtwQFmHAGJCAeAjQAAAB11gm0Rk953.png',
            id: 'SMOKING_DETECT',
            link: '../intelligence/intelligence?mode=SMOKING_DETECT'
          }
        ]
      },
      {
        name: '居家安全',
        pages: [
          {
            name: '烟火感知',
            icon: 'https://resource.eziot.com/group2/M00/00/70/CtwQFmHNU3uARJTSAAAEXjBgXt4496.png',
            id: 'PYROTECHNIC',
            link: '../intelligence/intelligence?mode=PYROTECHNIC'
          }
        ]
      }
    ]
  },
  onLoad: function() {
    // wx.navigateTo({url: '../faceAnalysisCompare/faceAnalysisCompare'})
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {},
  kindToggle: function(e) {
    var id = e.currentTarget.id,
      list = this.data.list;
    for (var i = 0, len = list.length; i < len; ++i) {
      if (list[i].id == id) {
        list[i].open = !list[i].open;
      } else {
        list[i].open = false;
      }
    }
    this.setData({
      list: list,
    });
  },
});
