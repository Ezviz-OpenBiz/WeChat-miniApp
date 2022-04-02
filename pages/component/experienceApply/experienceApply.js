import {OPEN_DOMAIN} from '../../config/config';

Page({
  properties: {
    
  },
  data: {
    name: '',
    enterprise: '', // 企业名
    email: '',
    contactWay: '',
    appKey: '44444444444444444444444444444444',
    simpleDescription: '小程序-设备托管',
    questionDescription: '', // 问题描述
    questionDescriptionclearIconShow: false,
    contactWayclearIconShow: false,
    emailclearIconShow: false,
    enterpriseclearIconShow: false,
    nameclearIconShow: false

  },
   
    _nameInput(event){
      const { value } = event.detail;
      this.setData({
        nameclearIconShow: true
      })
      if (value.length <= 20)  {
        this.setData({
          name: value
        })
      } else {
        wx.showToast({
          title: '最多可输入20个字符',
        })
      }
    },

    _nameBlur () {
      this.setData({
        nameclearIconShow: false
      })
    },

    _enterpriseInput(event){
      const { value } = event.detail;
      this.setData({
        enterpriseclearIconShow: true
      })
      if (value.length <= 20)  {
        this.setData({
          enterprise: value
        })
      } else {
        wx.showToast({
          title: '最多可输入20个字符',
        })
      }
    },

    _enterpriseBlur () {
      this.setData({
        enterpriseclearIconShow: false
      })
    },

    _emailInput(event){
      const { value } = event.detail;
      this.setData({
        emailclearIconShow: true
      })
      if (value.length <= 30)  {
        this.setData({
          email: value
        })
      } else {
        wx.showToast({
          title: '最多可输入30个字符',
        })
      }
    },

    _emailBlur(event){
      const { value } = event.detail;
      this.setData({
        emailclearIconShow: false
      })
      if (!value) {
        return
      }
      const emailReg =  /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
      if(emailReg.test(value)){
        this.setData({
          deviceValue: value
        })
      }else {
        this.setData({
          deviceValue: ''
        })
        wx.showToast({
          title: '邮箱格式不正确',
          icon: 'none'
        })
      }
    },

    _contactWayInput(event) {
      const { value } = event.detail;
      this.setData({
        contactWayclearIconShow: true
      });
      if (value.length <= 20)  {
        this.setData({
          contactWay: value
        })
      } else {
        wx.showToast({
          title: '最多可输入20个字符',
        })
      }
    },

    _contactWayBlur (event) {
      const { value } = event.detail;
      this.setData({
        contactWayclearIconShow: false
      });
      if (!value) {
        return
      }
      const emailReg =  /^[0123456789-]+$/;
      if(emailReg.test(value)){
        this.setData({
          contactWay: value
        })
      }else {
        this.setData({
          contactWay: ''
        })
        wx.showToast({
          title: '电话号码格式不正确',
          icon: 'none'
        })
      }
    },

    _questionDescriptionInput(event) {
      const { value } = event.detail;
      this.setData({
        questionDescriptionclearIconShow: true
      });
      if (value.length <= 255)  {
        this.setData({
          questionDescription: value
        })
      } else {
        wx.showToast({
          title: '最多可输入255个字符',
        })
      }
    },

    // 输入框失焦
    _questionDescriptionBlur () {
      this.setData({
        questionDescriptionclearIconShow: false
      });
    },

    //清空输入项
    _clearItem (e) {
      console.log(e);
      const { type } = e.target.dataset;
      switch (type) {
        case 'name' :
          this.setData({
            name: ''
          });
          break;
        case 'enterprise' :
          this.setData({
            enterprise: ''
          });
          break;
        case 'email' :
          this.setData({
            email: ''
          });
          break;
        case 'contactWay' :
          this.setData({
            contactWay: ''
          });
          break;
        case 'questionDescription' :
          this.setData({
            questionDescription: ''
          });
          break
      }
    },

    //提交专家咨询
    _sbumitApplyForm () {
      const {name,enterprise,  email, contactWay, appKey, simpleDescription, questionDescription} = this.data;
      if (!enterprise || !contactWay || !questionDescription) {
        wx.showToast({
          title: '请输入必填项',
          icon: 'none'
        });
        return
      } else {

        let params = {};

        params.appKey = appKey;
        params.simpleDescription = simpleDescription;
        params.contactWay = contactWay;
        params.questionDescription = questionDescription;

        let extraOptionsAi = [];

        extraOptionsAi.push({
          key: "email",
          value: email,
          label: "邮箱"
        });
        extraOptionsAi.push({
          key: "enterprise",
          value:  enterprise,
          label: "企业名"
        });
        extraOptionsAi.push({
          key: "name",
          value:  name,
          label: "姓名"
        });
        Object.assign(params, { extraOptionsAi: JSON.stringify(extraOptionsAi) });

        this._fetchApply(params);
       
      }
    },

    _fetchApply (params) {
      wx.request({
        url: `${OPEN_DOMAIN}/work/createByAdvisory`,
        method: 'POST',
        data: JSON.stringify(params),
        header: {
          'content-type': 'application/json' // 默认值
        },
        success:(res) =>{
         
          console.log(res);
          if (res.data.retcode == 0) {
            wx.showToast({
              title: '咨询请求已发送',
            });
            let timer = setTimeout(() => {
              wx.navigateBack({
                delta: 1,
              });
              clearTimeout(timer);
            }, 1000)
          } else {
            wx.showToast({
              title: '请求失败',
            })
          }
        }
      })
    }

  
});
