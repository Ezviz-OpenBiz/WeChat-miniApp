var dateTimePicker = require('../../common/dateTimePicker');

Page({
  data: {
    dateTimeArray: null,
    dateTime: null,
    startYear: 2000,
    endYear: 2050
  },
  onLoad(){
    // 获取完整的年月日 时分秒，以及默认显示的数组
    var obj = dateTimePicker.dateTimePicker(this.data.startYear, this.data.endYear);
    this.setData({
      dateTime: obj.dateTime,
      dateTimeArray: obj.dateTimeArray,
    });
  },
  changeDateTime(e){
    this.setData({ dateTime: e.detail.value });
  },
  changeDateTimeColumn(e){
    console.log('colum:', e)
    var arr = this.data.dateTime, dateArr = this.data.dateTimeArray;

    arr[e.detail.column] = e.detail.value;
    
    this.setData({
      dateTimeArray: dateArr,
      dateTime: arr
    });
  },
})