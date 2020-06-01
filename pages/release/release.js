// pages/release/release.js
const util = require('../../utils/util.js');
const api = require('../../utils/api.js');
const validate = require('../../utils/validate.js');
const BMap = require('../../libs/bmap-wx.min.js');
const app = getApp();
let bmap; //定时获取位置信息
let timer = null; //短信验证码定时任务
// 静态数据
// let staticData = {
//   categoryAll: [],
// }
let staticData = {
  categoryAll: [],
  historyPageNum: 1,
  historyEnd: false,
  favoritePageNum: 1,
  favoriteEnd: false,
  browsePageNum: 1,
  browseEnd: false,
};
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 控制内容显示隐藏
    audit:'no',
    // 控制提示框显示隐藏
    isHint:true,
    dataAll:{},
    quickClassificationName: "",
    historyReleaseList:[
      {
        messageType:'02',
        titleName:'盘活科技',
        id:'255'
      },
      {
        messageType:'01',
        titleName:'好好干',
        id:'255'
      }
    ],
    // 任务列表
    // taskList:[],
    // 验证码按钮是否展示
    showCode:'true',
    // 快捷发布
    quickRelease: false,
    // 实名判断
    isAuth: false,
    
    // 实名认证时的手机号
    authPhone: "",
    // 删除图片
    deleteImg: "/images/lw-del.png",
    // 广告图
    adImage: 'https://lwapi.shuguodj.com/outByteImgById?id=5e007fe80147fd493134fee0',
    // 分类
    classification: "",
    // 分类选择数据
    classificationIndex: [0, 0, 0],
    classificationArrayMap: [],
    // 职位
    custRoleIndex: 0,
    custRoleArray: ["水工", "电工", "木工", "瓦工", "小工", "机主", "司机 ", "法人 ", "总经理 ", "项目经理 ", "质检员 ", "质量员 ", "安全员 ", "施工员 ", "实验员 ", "材料员"],

    // 快捷发布选择分类
    quickClassificationIndex: [0, 0],
    quickClassificationArrayMap: [],

    // 标题
    titleName: "",
    // 任务分类
    categoryId: "",
    // 供应需求
    messageType: "",
    // 描述
    describle: "",
    // 实名认证
    verified: "Y",
    // 身份证正面照
    cardFront: "",
    // 身份证反面照
    cardReverse: "",
    // 职位
    custRole: "",
    // 职位flag
    custRoleFlag: false,
    // 相关图片
    img1: "",
    img2: "",
    img3: "",
    custRoleImg: "",
    // 用户姓名
    userName: "",
    // 手机号
    phone: "",
    // 验证码是否展示
    isCode: false,
    // 验证码
    code: "",
    // 地址
    address: "",
    // 经纬度
    lat: "",
    lng: "",
    // 忘记密码倒计时
    stateTime: 0,
    isShow:false,
    radioText:"信息类别"
  },
  // 查询状态
  selectOpenShop(){
    // let audit = this.data.audit
    if(app.globalData.isLogin){
      api._post('/selectOpenShop').then(res=>{
        if(res.success){
          
          this.setData({
            audit:res.data
          })
          if(res.data == 'yes'){
            wx.setNavigationBarTitle({
              title: '发布'
           })
           wx.setTabBarItem({
            index: 1,
            text: '发布',
          })
          }else if(res.data == 'no'){
            wx.setNavigationBarTitle({
              title: '信息'
           })
           wx.setTabBarItem({
            index: 1,
            text: '信息',
          })
          }
        }
      })
    }
  },
  // 点击弹出选项框
  itemRight(){
    this.setData({
      isShow:!this.data.isShow
    })
  } ,
   // 是否添加职位
  _setCustRoleFlag() {
    this.setData({
      custRoleFlag: !this.data.custRoleFlag
    });
  },
  // 删除图片
  _delImg(e) {
    let baseurl = e.currentTarget.dataset.baseurl;
    this.setData({
      [baseurl]: '',
    });
  },
  // 设置职位
  _custRoleChange(e) {
    let custRole = this.data.custRoleArray[e.detail.value];
    this.setData({
      custRole: custRole
    });
  },
  // 分类数据设置
  _setClassification(categoryAll = staticData.categoryAll) {
    let parentCode = "001";
    // 是否为快捷分类
    let quickRelease = this.data.quickRelease;
    if (quickRelease) {
      let quickClassificationArrayMap = [];
      let quickClassificationIndex = this.data.quickClassificationIndex;
      parentCode = quickRelease;
      quickClassificationArrayMap[0] = categoryAll.filter(elem => elem.parentCode === parentCode);
      parentCode = quickClassificationArrayMap[0][quickClassificationIndex[1]].code;
      quickClassificationArrayMap[1] = categoryAll.filter(elem => elem.parentCode === parentCode);
      let quickClassificationName = categoryAll.filter(elem => elem.code === quickRelease)[0].name;
      this.setData({
        quickClassificationName: quickClassificationName,
        quickClassificationArrayMap: quickClassificationArrayMap
      });
    } else {
      let classificationArrayMap = [];
      let classificationIndex = this.data.classificationIndex;
      classificationArrayMap[0] = categoryAll.filter(elem => elem.parentCode === parentCode);
      parentCode = classificationArrayMap[0][classificationIndex[1]].code;
      classificationArrayMap[1] = categoryAll.filter(elem => elem.parentCode === parentCode);
      parentCode = classificationArrayMap[1][classificationIndex[2]].code;
      classificationArrayMap[2] = categoryAll.filter(elem => elem.parentCode === parentCode);
      this.setData({
        classificationArrayMap: classificationArrayMap
      });
    }
    staticData.categoryAll = categoryAll;

  },
  // 分类选择
  _classificationChange(e) {
    let value = e.detail.value;
    let index = 2;
    // 是否为快捷分类
    let quickRelease = this.data.quickRelease;
    let classificationArrayMap = this.data.classificationArrayMap;
    if (quickRelease) {
      index = 1;
      classificationArrayMap = this.data.quickClassificationArrayMap;
    }
    let classification = classificationArrayMap[index][value[index]];
    if (classification) {
      this.setData({
        classification: classification,
        categoryId: classification.id
      });
    }
  },
  // 单列改变影响下列数据
  _classificationColumnChange(e) {
    let column = e.detail.column;
    // 是否为快捷分类
    let quickRelease = this.data.quickRelease;
    if (quickRelease) {
      if (column == 1) {
        return;
      }
      let value = e.detail.value;
      let quickClassificationIndex = this.data.quickClassificationIndex;
      quickClassificationIndex[column] = value;
      let quickClassificationArrayMap = this.data.quickClassificationArrayMap;
      let parentCode = quickClassificationArrayMap[column][value].code;
      for (let i = (column + 1); i < 2; i++) {
        quickClassificationIndex[i] = 0;
        quickClassificationArrayMap[i] = staticData.categoryAll.filter(elem => elem.parentCode === parentCode);
        if (quickClassificationArrayMap[i][0]) {
          parentCode = quickClassificationArrayMap[i][0].code;
        }
      }
      this.setData({
        quickClassificationIndex: quickClassificationIndex,
        quickClassificationArrayMap: quickClassificationArrayMap
      });
    } else {
      if (column == 2) {
        return;
      }
      let value = e.detail.value;
      let classificationIndex = this.data.classificationIndex;
      classificationIndex[column] = value;
      let classificationArrayMap = this.data.classificationArrayMap;
      let parentCode = classificationArrayMap[column][value].code;
      for (let i = (column + 1); i < 3; i++) {
        classificationIndex[i] = 0;
        classificationArrayMap[i] = staticData.categoryAll.filter(elem => elem.parentCode === parentCode);
        if (classificationArrayMap[i][0]) {
          parentCode = classificationArrayMap[i][0].code;
        }
      }
      this.setData({
        classificationIndex: classificationIndex,
        classificationArrayMap: classificationArrayMap
      });
    }

  },
  // 获取验证码
  _getCode() {
    if (this.data.stateTime > 0) {
      return;
    }
    let msg = false;
    let phone = this.data.phone;

    if (!phone) {
      msg = "请输入手机号";
    } else if (!validate.validPhone(phone)) {
      msg = "手机号格式有误";
    } else if (phone === this.data.authPhone) {
      // 判断是否与实名认证手机号一致
      this.setData({
        isCode: true
      });
      util._toast("该手机号无需验证");
      return;
    }

    if (!msg) {
      this.setData({
        stateTime: 60
      });
      timer = setInterval(() => {
        let stateTime = this.data.stateTime;
        if (stateTime > 0) {
          stateTime -= 1;
          this.setData({
            stateTime: stateTime
          });
        } else {
          clearInterval(timer);
        }
      }, 1000)
      api._post("/sendSms", {
        mobile: phone
      }).then(res => {
        if (!res.success) {
          clearInterval(timer);
          util._toast("发送失败");
        }
      });
    } else {
      util._toast(msg);
    }
  },
  // 获取图片
  _getImage(e) {
    let baseUrl = e.currentTarget.dataset.baseurl;
    let type = e.currentTarget.dataset.type;
    console.log(type)
    wx.navigateTo({
      url: `../imageCropper/imageCropper?baseUrl=${baseUrl}&type=${type}`
    });
  },
  
_setType(e){
  // console.log(e)
  let key = e.currentTarget.dataset.key;
  // console.log(key)
  let value = e.detail.value;
  if(value == '01'){
    this.setData({
      radioText:'供应',
      [key]: value
    })
  }else if(value == '02'){
    this.setData({
      radioText:'需求',
      [key]: value
    })
  }else{
    this.setData({
      radioText:'信息类别',
      [key]: value
    })
  }
},
  // 设置参数
  _setParams(e) {
    // console.log(e)
    let key = e.currentTarget.dataset.key;
    let value = e.detail.value;
    this.setData({
      [key]: value
    });
    // console.log(this.data.img1)
    // console.log(this.data.img2)
    // console.log(this.data.img3)
  },
  // 页面跳转
  _toView(e) {
    let navigatePath = e.currentTarget.dataset.navigate;
    wx.navigateTo({
      url: `../${navigatePath}/${navigatePath}`
    });
  },
  // 数据校验
  _taskValidate() {
    if (!this.data.categoryId) {
      return "请选择分类";
    } else if (!this.data.titleName) {
      return "请输入标题";
    } else if (!this.data.messageType) {
      return "请选择信息类别";
    } else if (!this.data.describle) {
      return "请输入工作描述信息";
    }
    // if (this.data.verified === "Y" && !this.data.isAuth) {
    //   if (!this.data.cardFront) {
    //     return "请选择上传身份证正面照";
    //   } else if (!this.data.cardReverse) {
    //     return "请选择上传身份证反面照";
    //   }
    //   if (this.data.custRole) {
    //     if (!this.data.custRoleImg) {
    //       msg = "请上传相关资质";
    //     }
    //   }
    // }

    // if ((!this.data.img1) || (!this.data.img2) || (!this.data.img3)) {
    //   return "请上传工作/工地/设备等相关图片";
    // } else 
    if (!this.data.userName) {
      return "请输入身份证姓名";
    } else if (!this.data.phone) {
      return "请输入手机号";
    } else if (!this.data.code && !this.data.isCode) {
      return "请输入验证码";
    }

    return false;
  },

  // 发布中
  _release(){
    let data = {
      titleName: this.data.titleName.trim(),
      categoryId: this.data.categoryId,
      messageType: this.data.messageType,
      describle: this.data.describle,
      img1: this.data.img1,
      img2: this.data.img2,
      img3: this.data.img3,
      userName: this.data.userName,
      phone: this.data.phone,
      vcode: this.data.code,
      address: this.data.address,
      lat: this.data.lat,
      lng: this.data.lng,
      typeClass:'01',
    }
    util._loading("发布中...");
        
    api._post("/message/insertMessage", data).then(res => {
      if (res.success) {
        if (this.data.verified === "Y" && !this.data.isAuth) {
          app.globalData.custInfo.idCardZmImg = this.data.cardFront;
          app.globalData.custInfo.idCardFmImg = this.data.cardReverse;
          app.globalData.custInfo.isAuth = "01";
          this.setData({
            isAuth: true
          });
        }
        if (this.data.custRole && this.data.custRoleImg) {
          app.globalData.custInfo.custRole = this.data.custRole;
          app.globalData.custInfo.custRoleImg = this.data.custRoleImg;
        }

        this.setData({
          titleName: "",
          classification: "",
          categoryId: "",
          messageType: "",
          describle: "",
          verified: "Y",
          cardFront: "",
          cardReverse: "",
          img1: "",
          img2: "",
          img3: "",
          userName: "",
          phone: "",
          code: "",
          stateTime: 0,
          quickClassificationName: "",
          quickRelease: false,
          quickClassificationIndex: [0, 0],
          quickClassificationArrayMap: []
        });
        wx.switchTab({
          url: '/pages/home/home',
        });
        util._toast("发布成功");
      } else {
        this.setData({
          code: "",
          stateTime: 0
        });
        util._toast("发布失败");
      }
    });
  },
  // 立即发布
  _postNow() {
    var that = this
    let msg = this._taskValidate();
    if (!msg) {
      
      // 判断是否实名
      if (this.data.isAuth) {
        that._release()
      }else{
        wx.showModal({
          title:'认证信息',
          content: '填写信息可获得更多关注',
          cancelText:'直接发布',
          confirmText:'立即认证',
          // concelColor:'#4098FD',
          confirmColor:'#4098FD',
          success(res){
        
            if(res.confirm){
              wx.navigateTo({
                url: '/pages/certification/Certification',
              })
            }else if(res.cancel){
              that._release()
            }
          }
        })
      }
      // // 判断是否有职位
      // if (this.data.custRole && this.data.custRoleImg) {
      //   data.custRole = this.data.custRole;
      //   data.custRoleImg = this.data.custRoleImg;
      // }
    
    } else {
      util._toast(msg);
    }
  },


   // 获取认证信息
   getCustInfo(){
    api._post("/cust/selctCust").then(res => {
      // console.log(res)
      if (res.success) {
        if (res.data.isAuth === "01") {
          this.setData({
            isAuth:true
          })
        }
      }
      // console.log(this.data.isAuth)
    });
  },
    // 获取历史发布
    // _getHistoryRelease() {
    //   let historyReleaseList = this.data.historyReleaseList;
    //   if (!staticData.historyEnd || !historyReleaseList.length) {
    //     api._post("/message/selectMessageListByCustId", {
    //       pageNum: staticData.historyPageNum
    //     }).then(res => {
    //       if (res.success) {
    //         // console.log(res)
    //         this.setData({
    //           historyReleaseList: historyReleaseList.concat(res.data.list),
    //           historyReleaseTotal: res.data.total
    //         });
    //         if (res.data.list.length >= 20) {
    //           staticData.historyPageNum += 1;
    //         } else {
    //           staticData.historyEnd = true;
    //         }
    //       } else {
    //         util._toast("暂无数据");
    //       }
    //     });
    //   } else {
    //     util._toast("暂无数据");
    //   }
    // },
    // 提示框点击事件
    hint(){
      this.setData({
        isHint:false
      })
    },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // console.log(this.data.historyReleaseList)
    this.selectOpenShop()
    let categoryAll = wx.getStorageSync("categoryAll") || false;
    if (categoryAll) {
      this._setClassification(categoryAll);
    } else {
      app._getCategoryAll().then(res => {
        this._setClassification(categoryAll);
      });
    }
    if (app.globalData.isLogin) {
      this.setData({
        userInfo: app.globalData.userInfo,
        isLogin: app.globalData.isLogin
      });
      // console.log(this.data.userInfo)
    }
    // 实例化百度地图API
    bmap = new BMap.BMapWX({
      ak: app.globalData.ak
    });

    this.getCustInfo()
    // this._getHistoryRelease()
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.selectOpenShop()
    if (!app.globalData.isLogin) {
      util._toast("请登录");
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/mine/mine'
        });
      }, 300);
      return;
    } else {
      // 判断用户实名信息
      let custInfo = app.globalData.custInfo;
      // console.log(custInfo)
      if (app.globalData.custInfo) {
        if (custInfo.isAuth === "01") {
          this.setData({
            isAuth: true,
            authPhone: custInfo.phone
          });
        }
        // console.log(this.data.isAuth)
        //   console.log(this.data.authPhone)
      }
      // 判断是否为快捷发布并获取类型
      let quickRelease = app.globalData.quickRelease;
      if (quickRelease) {
        this.setData({
          quickRelease: quickRelease
        }, () => {
          this._setClassification();
          app.globalData.quickRelease = false;
        });
      } else {
        this.setData({
          quickClassificationName: "",
          quickRelease: false,
          quickClassificationIndex: [0, 0],
          quickClassificationArrayMap: []
        });
      }
    }
    // 获取定位信息
    if (!app.globalData.location) {
      // 获取授权
      app.getLocation().then(() => {
        this.getLocationRegeo();
      }).catch(err => {
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/index/index'
          });
        }, 1000);
      });
    } else {
      this.getLocationRegeo();
    }
    // 获取图片
    let temp = wx.getStorageSync("tempImage") || false;
    // console.log(temp)
    if (temp) {
      this.setData({
        [temp.baseUrl]: temp.id
      });
      wx.setStorageSync("tempImage", false);
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  // 实时获取用户位置 (逆向解析)
  getLocationRegeo(location = app.globalData.location || "") {
    wx.getLocation({
      success: (res) => {
        location = {
          lng: res.longitude,
          lat: res.latitude
        }
        wx.setStorageSync("location", location);
        app.globalData.location = location;
        bmap.regeocoding({
          location: `${location.lat},${location.lng}`,
          success: (res) => {
            this.setData({
              lng: location.lng,
              lat: location.lat,
              address: res.wxMarkerData[0].address
            });
          }
        });
      }
    });
  }
})