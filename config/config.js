import devices from './devices';
import serverStreams from './streams';

// 这些是和设备无关的配置
const config = {
  appParams: {
    appid: 1300837838,
    appOauthId: '60f646ba062556e21befdcb6', // 600a4206062556e21befdc98, 60f646ba062556e21befdcb6
    appKey: 'LBfgxw6aDYWzthE3', // pMqRNpU3M4wOA2BY, LBfgxw6aDYWzthE3
    appSecretKey: '2qetkhKyeJPqZKv8axMYrr3jfHUUaMT2', // b62XcOoDcvJOgnibM8iKFVgVsXcdxNda,2qetkhKyeJPqZKv8axMYrr3jfHUUaMT2
    appPackage: 'miniprogram', // 
  },
  commandMap: {
    getLiveStatus: {
      cmd: 'get_device_st',
      params: {
        type: 'live',
        quality: 'super',
      },
    },
    getVoiceStatus: {
      cmd: 'get_device_st',
      params: {
        type: 'voice',
      },
    },
    getRecordDates: {
      cmd: 'get_month_record',
      params: (date) => {
        const year = date.getFullYear();
        let month = String(date.getMonth() + 1);
        if (month.length < 2) {
          month = `0${month}`;
        }
        return { time: `${year}${month}` }; // yyyymm
      },
      dataHandler: (oriData) => {
        const dates = [];
        const tmpList = parseInt(oriData.video_list, 10).toString(2).split('').reverse();
        const tmpLen = tmpList.length;
        for (let i = 0; i < tmpLen; i++) {
          if (tmpList[i] === '1') {
            dates.push(i + 1);
          }
        }
        return dates;
      },
    },
    getRecordVideos: {
      cmd: 'get_record_index',
      params: (date) => {
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        const start_time = startDate.getTime() / 1000;
        const end_time = start_time + 3600 * 24 - 1;
        return { start_time, end_time };
      },
    },
    getPlaybackStatus: {
      cmd: 'get_device_st',
      params: {
        type: 'playback',
      },
    },
    pausePlayback: {
      cmd: 'playback_pause',
    },
    resumePlayback: {
      cmd: 'playback_resume',
    },
  },
};

// 方便测试用的预置数据
const totalData = {};

// ipc设备都加进去
for (const key in devices) {
  totalData[key] = {
    mode: 'ipc',
    targetId: key,
    ...devices[key],
  };
}

// server流都加进去
for (const key in serverStreams) {
  totalData[key] = {
    mode: 'server',
    targetId: key,
    ...serverStreams[key],
  };
}

console.log('totalData', totalData);
config.totalData = totalData;

export default config;
