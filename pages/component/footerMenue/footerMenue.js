// pages/component/footerMenue/footerMenue.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    activeItem: {
      type: String,
      value: 'home',
      observer: function (news, olds, path) {
        this.setData({
          activeItem: news
        })
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    menue:[
    {
      icon: './images/loginhome.svg', 
      activeIcon: './images/loginhomeactive.svg',
      linkto:'/pages/home/home',
      text: '首页', 
      key: 'home'
    },
    {
      icon: './images/loginme.svg', 
      activeIcon: './images/loginmeactive.svg',
      linkto:'/packageC/pages/login/login',
      text: '我的', 
      key:'me'
    }],
    activeItem: 'home', //active项
  },

  lifetimes: {
    attached() {
      const me = this;
      
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // gotoLink(e) {
    //   const {key} = e.currentTarget.dataset || e.target.dataset;
    //   debugger;
    //   this.setData({
    //     activeItem: key
    //   })
    // },
  }
})
