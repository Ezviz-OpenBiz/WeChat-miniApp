import {OPEN_DOMAIN,projectId, deviceSerial,} from '../../../config/config';

Page({
  data: {
    listShow: false,
    defaultAccessToken: '', 
    list: [], // 录制文件列表
    operateModalShow: false, // 操作
    currentFileId: '', //当前选择的文件
    fileType: '', //下载的文件类型
    deviceSerial:deviceSerial,
  },

  onLoad: function () {
    // this._getAccessToken();
    // 创建临时项目
    
  },

  onShow: function () {
    this.getList()
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
          });
          // 获取文件列表
          this.getList();
        }
      },
      fail: (err)=>{
        console.log(err);
      }
    })
  },

  // 查看录制列表
  _showList () {
    this.setData({
      listShow: true
    });
    this.getList();
  },

  // 隐藏录制列表
  _hiddenList () {
    this.setData({
      listShow: false
    })
  },

  // 获取文件列表
  getList () {
    const { defaultAccessToken} = this.data;
    wx.request({
      url: `${OPEN_DOMAIN}/api/v3/console/weChat/api/open/cloud/v1/files/page`,
      method: 'GET',
      data: {
        accessToken: defaultAccessToken,
        projectId: projectId,
        pageNumber: 0,
        pageSize: 20,
        sortField: 'createTime',
        sortRule: 'desc',
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      success:(res) => {
        console.log(res.data)
        if(res.data.meta.code == 200 && res.data.data){
          const list = res.data.data.filesInfo;
          console.log(list);
          this.setData({
            list: [...list]
          })
        } else {
          this.setData({
            list: []
          })
        }
      },
      fail: (err)=>{
        console.log(err);
      }
    })
  },
  // 操作模态框弹出
  _operateModalShow (e) {
    const fileId = e.currentTarget.dataset.fileid;
    
    const fileType = e.currentTarget.dataset.filetype;
    console.log(e)
    this.setData({
      operateModalShow: true,
      currentFileId: fileId,
      fileType: fileType
    });
  },

  // 操作弹出框隐藏
  _operateModalHidden () {
    this.setData({
      operateModalShow: false
    })
  },

  // 下载
  _fileDownload () {
    const {defaultAccessToken, currentFileId, fileType} = this.data;
    const that = this;
    wx.request({
      url: `${OPEN_DOMAIN}/api/v3/console/weChat/api/open/cloud/v1/file/download`,
      method: 'GET',
      
      data: {
        accessToken: defaultAccessToken,
        projectId: projectId,
        fileId: currentFileId
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      success:(res) => {
        console.log(res.data)
        if(res.data.meta.code == 200 ){
          if(res.data.data.urls.length > 0) {
            
            const url = res.data.data.urls[0].replace("http://","https://");
            console.log('音视频地址', url);
           

            let fileUrl = '';
            let fileName = new Date().valueOf();

            if (fileType == 1) {
              fileUrl = wx.env.USER_DATA_PATH + '/' + fileName + '.mp4'
            } else {
              fileUrl = wx.env.USER_DATA_PATH + '/' + fileName + '.jpg' 
            }
           
            
            wx.downloadFile({
              url: url, 
              // url: 'http://resource.eziot.com/group2/M00/00/60/CtwQFmDakIKAdNFvAHtsrqZQSlU613.mp4',
              filePath: fileUrl, 
              success (res) {
                console.log('res:', res);
                if (res.statusCode === 200) {
                  
               
                  // 将临时文件路径保存到相册
                  if (fileType == 1) {
                   
                    wx.saveVideoToPhotosAlbum({
                      filePath: res.filePath,
                      success (res) {
                        console.log(res.errMsg);
                        wx.showToast({
                          title: '已保存至相册',
                        });
                      },
                      fail(res) {
                        console.log(res.errMsg);
                        wx.showToast({
                          title: res.errMsg,
                          icon: 'none'
                        });
                      }
                    })
                  } else {
                    wx.saveImageToPhotosAlbum({
                      filePath: res.filePath,
                      success(res) {
                        console.log(res.errMsg);
                        wx.showToast({
                          title: '已保存至相册',
                        });
                       },
                       fail(res) {
                        console.log(res.errMsg);
                        that.saveImageToAlbumFail(res)

                      }
                    })
                  }
                } else {
                  wx.showToast({
                    title: '文件下载异常 ',
                    icon: 'none'
                  })
                }
              },
              fail (err) {
                console.log('err', err)
                // wei授权时，则进入手机设置页面，可进行授权设置
                that.saveImageToAlbumFail(err);
              }
            })
            
          }
        } else {
          wx.showToast({
            title: res.data.meta.message,
          })
        }
      },
      fail: (err)=>{
        console.log(err);

      }
    })
  },

  // 保存相册授权
  saveImageToAlbumFail (res) {
    if (res.errMsg === "saveImageToPhotosAlbum:fail:auth denied" || res.errMsg === "saveImageToPhotosAlbum:fail auth deny") {
      // 这边微信做过调整，必须要在按钮中触发，因此需要在弹框回调中进行调用
      wx.showModal({
        title: '提示',
        content: '需要您授权保存相册',
        showCancel: false,
        success: modalSuccess => {
          wx.openSetting({
            success(settingdata) {
              console.log("settingdata", settingdata)
              if (settingdata.authSetting['scope.writePhotosAlbum']) {
                wx.showModal({
                  title: '提示',
                  content: '获取权限成功,再次点击图片即可保存',
                  showCancel: false,
                })
              } else {
                wx.showModal({
                  title: '提示',
                  content: '获取权限失败，将无法保存到相册哦~',
                  showCancel: false,
                })
              }
            },
            fail(failData) {
              console.log("failData", failData)
            },
            complete(finishData) {
              console.log("finishData", finishData)
            }
          })
        }

      })
    }
  },
  // 删除
  _fileDelete () {
    const {defaultAccessToken, currentFileId} = this.data;
    const params="?accessToken="+defaultAccessToken+"&projectId="+projectId+"&fileId="+currentFileId;
    wx.request({
      url: `${OPEN_DOMAIN}/api/v3/console/weChat/api/open/cloud/v1/file`+params,
      method: 'DELETE',
      data: {
        // accessToken: defaultAccessToken,
        // projectId: projectId,
        // fileId: currentFileId
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      success:(res) => {
        console.log(res.data)
        if(res.data.meta.code == 200 ){
          wx.showToast({
            title: '删除成功',
            icon: 'none'
          });
          this.setData({
            operateModalShow: false,
          })
          this.getList()
        } else if (res.data.meta.code == 404) {
          wx.showToast({
            title: '文件正在上传，无法删除',
            icon: 'none'
          });
          this.setData({
            operateModalShow: false,
          })
        }
         else {
          wx.showToast({
            title: '删除失败',
            icon: 'none'
          })
        }
      },
      fail: (err)=>{
        console.log(err);
      }
    })
  }
});
