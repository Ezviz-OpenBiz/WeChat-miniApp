/**
 * device属性说明：
 * showInHomePageBtn: boolean 是否显示在首页大按钮，产品用
 * showInHomePageNav: boolean 是否显示在首页导航，有onlyp2p入口，开发用
 *
 * 下面这些会自动填到player组件的输入框里，也可以手动修改
 * productId: string 摄像头的 productId
 * deviceName: string 摄像头的 deviceName
 * xp2pInfo: string 摄像头的 xp2pInfo
 * liveParams: string 摄像头的直播参数，默认 action=live&channel=0&quality=super
 * playbackParams: string 摄像头的回放参数，默认 action=playback&channel=0
 */

// 这些是预置的ipc设备
const devices = {
  ipc0: {
    showInHomePageBtn: true,
    productId: '9L1S66FZ3Q',
    deviceName: 'test_34683636_6',
    xp2pInfo: 'XP2Pm/vMj3MOMr58iOs7o1jdjl4R%2.3.5',
    liveParams: 'action=live&channel=0&quality=super',
    playbackParams: 'action=playback&channel=0',
  },
  judy3: {
    // showInHomePageBtn: true,
    showInHomePageNav: true,
    productId: '9L1S66FZ3Q',
    deviceName: 'test_34683636_3',
    xp2pInfo: 'XP2PcDd3JlQPiXxDzaKo4YvCqnUq%2.3.5',
    liveParams: 'action=live&channel=0&quality=super',
    playbackParams: 'action=playback&channel=0',
  },
  jlfeng: {
    showInHomePageBtn: true,
    productId: 'LYEOZCNW0U',
    deviceName: '1_49822230_1',
    xp2pInfo: '',
  },
};

export default devices;
