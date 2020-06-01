//app.js
const api = require('./utils/api.js');
const util = require('./utils/util.js');
App({
  onLaunch: function() {
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        // console.log(res.code)
        api._post("/wxpay/getOpenId", {
          code: res.code
        }).then(res => {
          // console.log(res)
          this.globalData.openId = res.data.json.openid;
          this.globalData.sessionKey = res.data.json.session_key;
          let sessionKey = res.data.json.session_key;
          // 获取用户信息
          wx.getSetting({
            success: res => {
              if (res.authSetting['scope.userInfo']) {
                // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                wx.getUserInfo({
                  success: res => {
                    // 可以将 res 发送给后台解码出 unionId
                    this.globalData.userInfo = res.userInfo;
                    this.globalData.encryptedData = res.encryptedData;
                    this.globalData.iv = res.iv;
                    let encryptedData = res.encryptedData;
                    let iv = res.iv;
                    if (sessionKey && encryptedData && iv) {
                      api._post('/wxcust/wxuserinfo', {
                        sessionKey,
                        encryptedData,
                        iv
                      }).then(res => {
                        if (res.success && res.data) {
                          this.globalData.isLogin = true;
                          api.setCustID(res.data['CUST-ID']);
                          this.globalData.custInfo = res.data.CUST;
                        }
                      });
                    }
                    // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                    // 所以此处加入 callback 以防止这种情况
                    if (this.userInfoReadyCallback) {
                      this.userInfoReadyCallback(res)
                    }
                  }
                })
              }
            }
          });
        });
      }
    });
    // 获取分类
    setTimeout(() => {
      this._getCategoryAll();
    }, 3000);
  },
  globalData: {
    ak: 'nCAaycjpg1vuMjFmnXO8GpnhAj4xnoWz',
    userInfo: null,
    custInfo: null,
    location: null,
    openId: '',
    sessionKey: '',
    isLogin: false,
    quickRelease: false,
    address:"",
  },
  
  // 获取分类并存储
  _getCategoryAll() {
    return api._post("/category/selectAllCategory").then(res => {
      wx.setStorageSync("categoryAll", res.data);
    });
  },
  // 登录
  _login(e) {
    return new Promise((resolve, reject) => {
      let sessionKey = this.globalData.sessionKey;
      let encryptedData = e.detail.encryptedData;
      let iv = e.detail.iv;
      
      this.globalData.userInfo = e.detail.userInfo;
      // console.log(e)
      if (sessionKey && encryptedData && iv) {
        util._loading('正在登陆...');
        // console.log(sessionKey, encryptedData, iv)
        api._post('/wxcust/wxuserinfo', {
          sessionKey,
          encryptedData,
          iv
        }).then(res => {
          wx.hideLoading();
          // console.log(res)
          if (res.success && res.data) {
            this.globalData.custInfo = res.data.CUST;
            this.globalData.isLogin = true;
            api.setCustID(res.data['CUST-ID']);
            resolve();
            util._toast("登录成功");
          } else {
            reject();
            util._toast("登录失败");
          }
        });
      }
    })
  },
  //获取经纬度
  getLocation() {
    return new Promise((resolve, reject) => {
      wx.getLocation({
        success: (res) => {
          let location = {
            lng: res.longitude,
            lat: res.latitude
          }
          wx.setStorageSync("location", location);
          this.globalData.location = location;
          resolve();
        },
        fail: (res) => {
          wx.showModal({
            title: '提示',
            content: '您已拒绝位置授权,部分功能将无法使用',
            showCancel: true,
            cancelText: "取消",
            cancelColor: '#666',
            confirmText: "立即开启",
            confirmColor: '#89C0F6',
            success: (res) => {
              if (res.confirm) {
                wx.openSetting({
                  success: (res) => {
                    resolve();
                  }
                })
              } else {
                reject();
              }
            }
          });
        },
      });
    })
  },
})