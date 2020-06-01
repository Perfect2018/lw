// pages/certification/Certification.js

const util = require('../../utils/util.js');
const api = require('../../utils/api.js');
const validate = require('../../utils/validate.js');
const BMap = require('../../libs/bmap-wx.min.js');
const app = getApp();
let timer = null; //短信验证码定时任务
// 静态数据
let staticData = {
  categoryAll: [],
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 是否编辑
    isEdit:'false',
    username:"",
    pusername:"",
    phone:"",
    pPhone:"",
    // 验证码是否展示
    isCode: false,
    isShow:false,
    // 身份证
    cardNum: "",
    code:"",
    // 图片
    img1: "",
    img2: "",
    img3: "",
    img4: "",
    // 身份证正面照
    cardFront: "",
    // 身份证反面照
    cardReverse: "",
    // 删除图片
    deleteImg: "/images/lw-del.png",
    // 职位
    custRole:'',
    pcustRole:'',
    custRoleIndex: 0,
     // 认证信息 
     custInfo: null,
     editInfo: false,
    //  是否认证
     isAuth:false,
    //  认证方式
     messageType:'02',
     isPersonal:true,
    //  公司名称
     companyname:'',
    //  authPhone:'',
    //  authMethodArray:['企业认证','个人认证']
    // custRoleArray: ["水工", "电工", "木工", "瓦工", "小工", "机主", "司机 ", "法人 ", "总经理 ", "项目经理 ", "质检员 ", "质量员 ", "安全员 ", "施工员 ", "实验员 ", "材料员"],
    
  },
  selectRadio(e){
    let key = e.currentTarget.dataset.key;
    let value = e.detail.value;
    if(value == '01'){
      this.setData({
        [key]:value,
        isPersonal:false
      })
    }else{
      this.setData({
        [key]:value,
        isPersonal:true
      })
    }
    // console.log(this.data.messageType)
  },
    // 设置职位
  // _custRoleChange(e) {
  //   let custRole = this.data.custRoleArray[e.detail.value];
  //   let path = "custRole";
  //   this.setData({
  //     [path]: custRole
  //   });
  //   console.log(this.data.custRole)
  // },
// 设置参数
  _setParams(e) {
    let value = e.detail.value;
    let key = e.currentTarget.dataset.key;
    this.setData({
      [key]: value
    });
  },

  _toview(e){
    let navigatePath = e.currentTarget.dataset.navigate
    wx.redirectTo({
      url: `../${navigatePath}/${navigatePath}`,
    })
  },
  // _setParams(e) {
  //   let key = e.currentTarget.dataset.key;
  //   let value = e.detail.value;
  //   key = "custInfo." + key;
  //   this.setData({
  //     [key]: value
  //   });
  // },
  // 获取验证码
  _getCode() {
    if (this.data.stateTime > 0) {
      return;
    }
    let msg = false;
    let phone = this.data.phone;
    let pPhone = this.data.pPhone
    if(this.data.isPersonal){
      if (!pPhone) {
        msg = "请输入手机号";
      } else if (!validate.validPhone(pPhone)) {
        msg = "手机号格式有误";
      } else if (pPhone === this.data.authPhone) {
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
          mobile: pPhone
        }).then(res => {
          if (!res.success) {
            clearInterval(timer);
            util._toast("发送失败");
          }
        });
      } else {
        util._toast(msg);
      }
    }else{
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
    }

    // if (!msg) {
    //   this.setData({
    //     stateTime: 60
    //   });
    //   timer = setInterval(() => {
    //     let stateTime = this.data.stateTime;
    //     if (stateTime > 0) {
    //       stateTime -= 1;
    //       this.setData({
    //         stateTime: stateTime
    //       });
    //     } else {
    //       clearInterval(timer);
    //     }
    //   }, 1000)
    //   api._post("/sendSms", {
    //     mobile: phone
    //   }).then(res => {
    //     if (!res.success) {
    //       clearInterval(timer);
    //       util._toast("发送失败");
    //     }
    //   });
    // } else {
    //   util._toast(msg);
    // }
  },
    // 获取认证信息
    _getCustInfo() {
      if (app.globalData.isLogin && !this.data.editInfo) {
        api._post("/cust/selctCust").then(res => {
          if (res.success) {
            // console.log(res)
            app.globalData.custInfo = res.data;
            let editInfo = false;
            // 00未认证
            if (res.data.isAuth === "00") {
              editInfo = true;
              this.setData({
                isAuth:true
              })
            }else if(res.data.isAuth === '01'){
              this.setData({
                isAuth:false
              })
            }
            res.data.custRole = res.data.custRole ? res.data.custRole : "";
           
            if(res.data.authMethod == '01'){
              this.setData({
                isPersonal:false,
                editInfo: editInfo,
                messageType:res.data.authMethod,
                custRole:res.data.custRole,
                username: res.data.username,
                companyname:res.data.enterpriseName,
                phone: res.data.phone,
                img1: res.data.businessImg,
                img2: res.data.enterpriseImg,
              });
            }else if(res.data.authMethod == '02'){
              this.setData({
                isPersonal:true,
                editInfo: editInfo,
                messageType:res.data.authMethod,
                pcustRole:res.data.custRole,
                pusername: res.data.username,
                cardNum:res.data.idCardNo,
                pPhone: res.data.phone,
                img3: res.data.idCardZmImg,
                img4: res.data.idCardFmImg,
              });
            }else{
              // let messageType=res.data.authMethod?res.data.authMethod:'02'
              this.setData({
                messageType:'02'
              })
            }
          }
        });
      }
    },

  // _setClassification(categoryAll = staticData.categoryAll) {
  //   let parentCode = "001";
  //   // 是否为快捷分类
  //   let quickRelease = this.data.quickRelease;
  //   if (quickRelease) {
  //     let quickClassificationArrayMap = [];
  //     let quickClassificationIndex = this.data.quickClassificationIndex;
  //     parentCode = quickRelease;
  //     quickClassificationArrayMap[0] = categoryAll.filter(elem => elem.parentCode === parentCode);
  //     parentCode = quickClassificationArrayMap[0][quickClassificationIndex[1]].code;
  //     quickClassificationArrayMap[1] = categoryAll.filter(elem => elem.parentCode === parentCode);
  //     let quickClassificationName = categoryAll.filter(elem => elem.code === quickRelease)[0].name;
  //     this.setData({
  //       quickClassificationName: quickClassificationName,
  //       quickClassificationArrayMap: quickClassificationArrayMap
  //     });
  //   } else {
  //     let classificationArrayMap = [];
  //     let classificationIndex = this.data.classificationIndex;
  //     classificationArrayMap[0] = categoryAll.filter(elem => elem.parentCode === parentCode);
  //     parentCode = classificationArrayMap[0][classificationIndex[1]].code;
  //     classificationArrayMap[1] = categoryAll.filter(elem => elem.parentCode === parentCode);
  //     parentCode = classificationArrayMap[1][classificationIndex[2]].code;
  //     classificationArrayMap[2] = categoryAll.filter(elem => elem.parentCode === parentCode);
  //     this.setData({
  //       classificationArrayMap: classificationArrayMap
  //     });
  //   }
  //   staticData.categoryAll = categoryAll;

  // },

// 删除图片
_delImg(e) {
  let baseurl = e.currentTarget.dataset.baseurl;
  this.setData({
    [baseurl]: '',
  });
},

// 获取图片
_getImage(e) {
  let baseUrl = e.currentTarget.dataset.baseurl;
  let type = e.currentTarget.dataset.type;
  // console.log(type)
  wx.navigateTo({
    url: `../imageCropper/imageCropper?baseUrl=${baseUrl}&type=${type}`
  });
},

// 认证校验
_certificationValidate() {
  if(this.data.isPersonal){
    if (!this.data.pusername) {
      return "请输入身份证姓名";
    } else if(!this.data.pcustRole){
      return "请输入职位";
    }else if(!this.data.cardNum){
      return "请输入身份证号"
    }else if(!validate.validCardId(this.data.cardNum)){
      return "输入身份证号格式错误"
    }else if(!this.data.pPhone) {
      return "请输入手机号";
    } else if(!validate.validPhone(this.data.pPhone)){
      return "手机号格式有误"
    }else if(!this.data.code && !this.data.isCode){
      return "请输入验证码";
    } 
    if (!this.data.img3) {
      return "请选择上传营业执照";
    } else if (!this.data.img4) {
      return "请选择上传名片";
    }
    return false;
  }else{
    if(!this.data.companyname){
      return "请输入公司名称"
    }else if(!this.data.username){
      return "请输入身份证姓名";
    }else if(!this.data.custRole){
      return "请输入职位";
    }else if(!this.data.phone) {
      return "请输入手机号";
    } else if(!this.data.code && !this.data.isCode){
      return "请输入验证码";
    } 
    if (!this.data.img1) {
      return "请选择上传身份证正面照";
    } else if (!this.data.img2) {
      return "请选择上传身份证反面照";
    }
    return false
  }
},
// 立即认证
_certification(e) {
  let that = this
  // let e = e
  // let custInfo = this.data.custInfo;
  // console.log(this.data.img1)
  let msg = this._certificationValidate();
  if (!msg) {
    if(this.data.isPersonal){
      var data = {
        authMethod:this.data.messageType,
        custRole:this.data.pcustRole,
        username: this.data.pusername,
        idCardNo: this.data.cardNum,
        phone: this.data.pPhone,
        idCardZmImg: this.data.img3,
        idCardFmImg: this.data.img4,
        vcode: this.data.code
      }
    }else{
      var data = {
        authMethod:this.data.messageType,
        enterpriseName:this.data.companyname,
        custRole:this.data.custRole,
        username: this.data.username,
        phone: this.data.phone,
        businessImg: this.data.img1,
        enterpriseImg: this.data.img2,
        vcode: this.data.code
      }
    }
    // if (custInfo.custRoleImg && custInfo.custRole) {
    //   data.custRoleImg = custInfo.custRoleImg;
    //   data.custRole = custInfo.custRole;
    // }
    util._loading("认证中...");
    api._post("/cust/updateCustInfo", data).then(res => {
      if (res.success) {
        // util._toast("认证成功");
        app.globalData.custInfo = Object.assign({}, this.data.custInfo);
        this.setData({
          vcode: "",
          stateTime: 0,
          editInfo: false
        });
        // console.log(res)
      //  setTimeout(function(){
      //   wx.navigateBack()
      //  },1000)
      wx.showModal({
        title:'认证成功',
        cancelText:'确定',
        confirmText:'查看名片',
        // concelColor:'#4098FD',
        confirmColor:'#4098FD',
        success(res){
          if(res.confirm){
            that._toview(e)
          }else if(res.cancel){
            wx.navigateBack()
          }
        }
      })
      } else {
        // this.setData({
        //   code: "",
        //   stateTime: 0
        // });
        util._toast("认证失败");
      }
    });
  } else {
    util._toast(msg);
  }
},
  // 编辑信息
  _edit() {
    this.setData({
      // isAuth:!this.data.isAuth,
      isEdit:!this.data.isEdit,
      isShow:!this.data.isShow
      // custRole:"",
      // username: "",
      // phone: "",
      // idCardZmImg: "",
      // idCardFmImg: "",
      // vcode: ""
    });
  },
  cancel(){
    this.setData({
      // isAuth:!this.data.isAuth,
      isEdit:!this.data.isEdit,
      isShow:!this.data.isShow
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // let categoryAll = wx.getStorageSync("categoryAll") || false;
    // if (categoryAll) {
    //   this._setClassification(categoryAll);
    // } else {
    //   app._getCategoryAll().then(res => {
    //     this._setClassification(categoryAll);
    //   });
    // }
    // if (app.globalData.isLogin) {
    //   this.setData({
    //     userInfo: app.globalData.userInfo,
    //     isLogin: app.globalData.isLogin
    //   });
    // }
    this._getCustInfo()
    
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
     // 获取图片
     let temp = wx.getStorageSync("tempImage") || false;
    //  console.log(temp)
     if (temp) {
      //  let baseUrl = "custInfo." + temp.baseUrl;
       this.setData({
        [temp.baseUrl]: temp.id
       });
       wx.setStorageSync("tempImage", false);
     } 
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})