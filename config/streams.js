/**
 * stream属性说明：
 * showInHomePageBtn: boolean 是否显示在首页大按钮，产品用
 * showInHomePageNav: boolean 是否显示在首页导航，有onlyp2p入口，开发用
 *
 * serverName: string 会根据serverName从serverMap里查询预置的server信息
 * flvFile: string 视频流的 flvFile，可以带参数
 * flvUrl: string 根据 serverName 和 flvFile 自动生成
 */

const serverMap = {
  // key是serverName，与具体视频流无关
  httpsSvr: {
    flvUrlBase: 'https://dev.ad.qvb.qcloud.com/openlive/',
  },
  // tcpSvr: {
  //   flvUrlBase: 'http://dev.ad.qvb.qcloud.com:12680/openlive/',
  //   codeUrl: 'https://dev.ad.qvb.qcloud.com/code',
  // },
  // xntpSvr: {
  //   flvUrlBase: 'http://25QWpIISwMaH6wru24.xnet/iot.p2p.com/openlive/',
  // },
};

// 这些是预置的server流
const serverStreams = {
  httpsStream0: {
    showInHomePageBtn: true,
    serverName: 'httpsSvr',
    flvFile: '6e0b2be040a943489ef0b9bb344b96b8.hd.flv',
  },
  // tcpStream0: {
  //   showInHomePageBtn: true,
  //   serverName: 'tcpSvr',
  //   flvFile: '6e0b2be040a943489ef0b9bb344b96b8.hd.flv',
  // },
  // xntpStream0: {
  //   showInHomePageNav: true,
  //   serverName: 'xntpSvr',
  //   flvFile: '6e0b2be040a943489ef0b9bb344b96b8.hd.flv',
  // },
};

// 组合起来
for (const key in serverStreams) {
  const streamCfg = serverStreams[key];
  const serverInfo = serverMap[streamCfg.serverName];
  serverStreams[key] = {
    ...serverInfo,
    ...streamCfg,
    flvUrl: `${serverInfo.flvUrlBase}${streamCfg.flvFile}`,
  };
}

export default serverStreams;
