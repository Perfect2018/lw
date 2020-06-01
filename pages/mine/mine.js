// pages/mine/mine.js
const util = require('../../utils/util.js');
const api = require('../../utils/api.js');
const validate = require('../../utils/validate.js');
const app = getApp();
let timer = null; //短信验证码定时任务
let staticData = {
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
    userId:'',
    audit:'no',
    navList: [{
      iconImg: "/images/lsfb.png",
      title: "历史发布"
    }, {
      iconImg: "/images/wdsc.png",
      title: "我的收藏"
    }, {
      iconImg: "/images/bll.png",
      title: "被浏览"
    }, {
      iconImg: "/images/rzxx.png",
      title: "认证信息"
    },{
      iconImg: "/images/mp.png",
      title: "我的名片"
    }
  ],
    // 删除图片
    deleteImg: "/images/lw-del.png",
    // 个人中心
    personalCenterImg: "/images/lw-grzx.png",
    // 认证信息 
    custInfo: null,
    editInfo: false,
    code: "",
    // 当前选中
    navIndex: 0,
    // 登录状态
    isLogin: false,
    // 被收藏数
    favoriteCount: 0,
    // 职位
    custRoleIndex: 0,
    custRoleArray: ["水工", "电工", "木工", "瓦工", "小工", "机主", "司机 ", "法人 ", "总经理 ", "项目经理 ", "质检员 ", "质量员 ", "安全员 ", "施工员 ", "实验员 ", "材料员"],
    // 职位flag
    custRoleFlag: false,
    // 用户信息
    userInfo: null,
    // 历史发布列表
    historyReleaseList: [],
    historyReleaseTotal: 0,
    // 我的收藏列表
    favoriteTasksList: [],
    favoriteTasksTotal: 0,
    // 被浏览列表
    browseTasksList: [],
    browseTasksTotal: 0
  },
  // 审核开关
  audit(){
    // console.log(this.data.audit)
    if(this.data.audit == 'yes'){
      this.setData({
        audit:'no'
      })
    }else if(this.data.audit == 'no'){
      this.setData({
        audit:'yes'
      })
    }
    let _audit = this.data.audit
    // console.log(_audit)
    if(app.globalData.isLogin){
      api._post('/setOpenShop',{openState:_audit}).then(res=>{
        
       if(res.success){
        return
       }
      })
    }
  }, 
  selectOpenShop(){
    // let audit = this.data.audit
    if(app.globalData.isLogin){
      api._post('/selectOpenShop').then(res=>{
        if(res.success){
          // console.log(res)
          this.setData({
            audit:res.data
          })
        }
      })
    }
  },
   // 设置职位
  _custRoleChange(e) {
    let custRole = this.data.custRoleArray[e.detail.value];
    let path = "custInfo.custRole";
    this.setData({
      [path]: custRole
    });
  },
  // 是否添加职位
  _setCustRoleFlag() {
    this.setData({
      custRoleFlag: !this.data.custRoleFlag
    });
  },
  // 设置选中
  _navIndex(e) {
    if (this.data.isLogin) {
      let navIndex = e.currentTarget.dataset.index;
      if(navIndex === 3){
        this.setData({
          navIndex: navIndex
        });
        wx.navigateTo({
          url: '/pages/certification/Certification',
        })
      }else if(navIndex === 4){
        this.setData({
          navIndex: navIndex
        });
        wx.navigateTo({
          url: '/pages/personalCenter/personalCenter?num='+this.data.browseTasksTotal,
        })
      }else{
        this.setData({
          navIndex: navIndex
        });
      }
    
    } else {
      util._toast("请登录");
    }

  },
  // 设置参数
  _setParams(e) {
    let key = e.currentTarget.dataset.key;
    let value = e.detail.value;
    key = "custInfo." + key;
    this.setData({
      [key]: value
    });
  },
  // 获取基础信息
  _getInitData() {
    if (this.data.isLogin) {
      // 初始化页码
      staticData = {
        historyPageNum: 1,
        historyEnd: false,
        favoritePageNum: 1,
        favoriteEnd: false,
        browsePageNum: 1,
        browseEnd: false
      };
      this.setData({
        historyReleaseList: [],
        favoriteTasksList: [],
        browseTasksList: []
      });
      this._getHistoryRelease();
      this._getFavoriteTasks();
      this._getBrowseTasks();
      this._getFavoriteCount();
      this._getCustInfo();
    } else {
      util._toast("请登录");
    }
  },

  // 回复留言
  _reply(e) {
    this.setData({
      commentType: "reply",
      commentIndex: e.detail.index,
      userCustId: e.detail.custId,
      userMessageId: e.detail.id
    });

  },
  // 发送留言
  _sendMsg(e) {
    let content = this.data.content;
    if (!content) {
      util._toast("留言内容不能为空");
      return;
    }
    util._loading();
    if (this.data.commentType === "reply") {
      api._post("/userMessage/replyUserMessage", {
        userCustId: this.data.userCustId,
        userMessageId: this.data.userMessageId,
        content: content
      }).then(res => {
        let commentIndex = this.data.commentIndex;
        let commentList = this.data.commentList.concat([]);
        let comment = commentList[commentIndex];
        comment.userMessageContents.push({
          content: res.data.content,
          createDate: res.data.date,
          nickName: this.data.custInfo.nickName,
          custId: this.data.custInfo.id
        });
        commentList.splice(commentIndex, 1, comment);
        this.setData({
          commentList: commentList,
          commentType: "comment",
          content: ""
        });
      });
    } else {
      api._post("/userMessage/insertUserMessage", {
        userCustId: this.data.userCustIdComment,
        content: content
      }).then(res => {
        let commentList = this.data.commentList.concat([]);
        commentList.push({
          userMessageContents: [],
          userMessgae: {
            content: res.data.content,
            createDate: res.data.date,
            nickName: this.data.custInfo.nickName,
            headImg: this.data.custInfo.headImg,
            custId: this.data.custInfo.id
          }
        });
        this.setData({
          commentList: commentList,
          content: ""
        });
      });
    }
  },
  // 获取焦点
  _contentFoucus(e) {
    if (e.detail.height) {
      this.setData({
        bottom: e.detail.height
      });
    }
  },
  // 失去焦点
  _contentBlur() {
    this.setData({
      bottom: 0,
    });
  },
  // 设置参数
  _setParams(e) {
    let value = e.detail.value;
    let key = e.currentTarget.dataset.key;
    this.setData({
      [key]: value
    });
  },
  // 获取所有留言
  _getCommentList() {
    api._post("/userMessage/selectUserMessage").then(res => {
      if (res.data.length) {
        this.setData({
          commentList: res.data
        });
      } else {
        util._toast("暂无数据");
      }

    });
  },
  // 获取用户信息
  _getUserInfo(e) {
    util._loading("登陆中...");
    app._login(e).then(res => {
      this.setData({
        isLogin: true,
        userInfo: e.detail.userInfo
      }, () => {
        this._getInitData();
      });
      // console.log(this.data.userInfo)
    }).catch(err=>{
      
    });
    
  },
  // 获取认证信息
  _getCustInfo() {
    if (app.globalData.isLogin && !this.data.editInfo) {
      api._post("/cust/selctCust").then(res => {
        if (res.success) {
          app.globalData.custInfo = res.data;
          let editInfo = false;
          if (res.data.isAuth === "00") {
            editInfo = true;
          }
          res.data.custRole = res.data.custRole ? res.data.custRole : "";
          this.setData({
            editInfo: editInfo,
            custInfo: res.data
          });
        }
      });
    }
  },
  // 获取收藏列表
  _getFavoriteTasks() {
    let favoriteTasksList = this.data.favoriteTasksList;
    if (!staticData.favoriteEnd || !favoriteTasksList.length) {
      api._post("/collection/selectCollection", {
        pageNum: staticData.favoritePageNum
      }).then(res => {
        if (res.success) {
          res.data.list.map(elem => {
            elem.id = elem.messageId;
            return elem;
          });
          this.setData({
            favoriteTasksList: favoriteTasksList.concat(res.data.list),
            favoriteTasksTotal: res.data.total
          });
          if (res.data.list.length >= 20) {
            staticData.favoritePageNum += 1;
          } else {
            staticData.favoriteEnd = true;
          }
        } else {
          util._toast("暂无数据");
        }
      });
    } else {
      util._toast("暂无数据");
    }
  },
  // 获取被浏览列表
  _getBrowseTasks() {
    let browseTasksList = this.data.browseTasksList;
    if (!staticData.browseEnd || !browseTasksList.length) {
      api._post("/visit/selectVisit", {
        pageNum: staticData.browsePageNum
      }).then(res => {
        if (res.success) {
          this.setData({
            browseTasksList: browseTasksList.concat(res.data.list),
            browseTasksTotal: res.data.total
          });
          if (res.data.list.length >= 20) {
            staticData.browsePageNum += 1;
          } else {
            staticData.browseEnd = true;
          }
        } else {
          util._toast("暂无数据");
        }
      });
    } else {
      util._toast("暂无数据");
    }
  },
  // 获取收藏数
  _getFavoriteCount() {
    api._post("/collection/selectCollectionNum").then(res => {
      if (res.success) {
        this.setData({
          favoriteCount: res.data ? res.data : 0
        });
      } else {
        util._toast("暂无数据");
      }
    });
  },
  // 获取历史发布
  _getHistoryRelease() {
    let historyReleaseList = this.data.historyReleaseList;
    if (!staticData.historyEnd || !historyReleaseList.length) {
      api._post("/message/selectMessageListByCustId", {
        pageNum: staticData.historyPageNum
      }).then(res => {
        if (res.success) {
          // console.log(res.data.list)
          this.setData({
            historyReleaseList: historyReleaseList.concat(res.data.list),
            historyReleaseTotal: res.data.total
          });
          if (res.data.list.length >= 20) {
            staticData.historyPageNum += 1;
          } else {
            staticData.historyEnd = true;
          }
        } else {
          util._toast("暂无数据");
        }
      });
    } else {
      util._toast("暂无数据");
    }
  },
  // 编辑信息
  _edit() {
    this.setData({
      editInfo: !this.data.editInfo
    });
  },
  // 获取图片
  _getImage(e) {
    let baseUrl = e.currentTarget.dataset.baseurl;
    let type = e.currentTarget.dataset.type;
    wx.navigateTo({
      url: `../imageCropper/imageCropper?baseUrl=${baseUrl}&type=${type}`
    });
  },
  // 删除图片
  _delImg(e) {
    let baseurl = "custInfo." + e.currentTarget.dataset.baseurl;
    this.setData({
      [baseurl]: ""
    });
  },
  // 获取验证码
  _getCode() {
    if (this.data.stateTime > 0) {
      return;
    }
    let msg = false;
    let phone = this.data.custInfo.phone;

    if (!phone) {
      msg = "请输入手机号";
    } else if (!validate.validPhone(phone)) {
      msg = "手机号格式有误";
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
      })
    } else {
      util._toast(msg);
    }
  },
  // 认证校验
  _certificationValidate(custInfo) {
    if (!custInfo.idCardZmImg) {
      return "请选择上传身份证正面照";
    } else if (!custInfo.idCardFmImg) {
      return "请选择上传身份证反面照";
    }
    if (custInfo.custRole) {
      if (!custInfo.custRoleImg) {
        return "请上传相关资质";
      }
    }
    if (!custInfo.username) {
      return "请输入身份证姓名";
    } else if (!custInfo.phone) {
      return "请输入手机号";
    } else if (!custInfo.code) {
      return "请输入验证码";
    }
    return false;
  },
  // 立即认证
  _certification() {
    let custInfo = this.data.custInfo;
    let msg = this._certificationValidate(custInfo);
    if (!msg) {
      let data = {
        idCardZmImg: custInfo.idCardZmImg,
        idCardFmImg: custInfo.idCardFmImg,
        username: custInfo.username,
        phone: custInfo.phone,
        vcode: custInfo.code,
      }
      if (custInfo.custRoleImg && custInfo.custRole) {
        data.custRoleImg = custInfo.custRoleImg;
        data.custRole = custInfo.custRole;
      }
      util._loading("认证中...");
      api._post("/cust/updateCustInfo", data).then(res => {
        if (res.success) {
          app.globalData.custInfo = Object.assign({}, this.data.custInfo);
          this.setData({
            code: "",
            stateTime: 0,
            editInfo: false
          });
          util._toast("认证成功");
        } else {
          this.setData({
            code: "",
            stateTime: 0
          });
          util._toast("认证失败");
        }
      });
    } else {
      util._toast(msg);
    }
  },
  // 页面跳转
  _toView(e) {
    let navigate = e.currentTarget.dataset.navigate;
    let browseTasksTotal =this.data.browseTasksTotal
    wx.navigateTo({
      url: `/pages/${navigate}/${navigate}?num=${browseTasksTotal}`
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {
    // console.log(app.globalData.custInfo)
    this.selectOpenShop()
    this.setData({
      userInfo: app.globalData.userInfo,
      isLogin: app.globalData.isLogin,
      userId:app.globalData.custInfo.id
    });
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
    
    // 获取图片
    let temp = wx.getStorageSync("tempImage") || false;
    if (temp) {
      let baseUrl = "custInfo." + temp.baseUrl;
      this.setData({
        [baseUrl]: temp.id,
        
      });
      wx.setStorageSync("tempImage", false);
    } else {
      this._getInitData();
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
    let navIndex = this.data.navIndex;
    switch (navIndex) {
      case 0:
        return this._getHistoryRelease();
      case 1:
        return this._getFavoriteTasks();
      case 2:
        return this._getFavoriteCount();
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})