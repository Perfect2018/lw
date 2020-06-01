// pages/personalCenter/personalCenter.js
const util = require('../../utils/util.js');
const api = require('../../utils/api.js');
const BMap = require('../../libs/bmap-wx.min.js');
const app = getApp();
let bmap, locationTimer
Page({
  staticData: {
    historyPageNum: 1,
    historyEnd: false,
  },
  /**
   * 页面的初始数据
   */
  data: {

    custInfo: null,
    navIndex: 0,
    // 历史发布列表
    historyReleaseList: [],
    historyReleaseTotal: 0,
    // 留言列表
    commentList: [],
    // 留言下标
    commentIndex: 0,
    // 留言类型
    commentType: "",
    // 回复消息id
    userMessageId: "",
    // 被留言人的custId
    userCustId: "", //回复时
    userCustIdComment: "", //留言时
    //输入留言信息
    content: "",
    // 显示留言窗口
    commentFlag: false,
    bottom: 0,
    distribution: {
      // bgImage:'5e007fe80147fd493134fee0',
      // rzImage:'5e919414f8ff451f945c510b',
      // dwImage:'5e91940bf8ff451f945c5109',
      codeImage: '',
      avatarImage: ''
    },
    // 访客数
    browseTasksTotal: 0,
    address:'',
    topTitle:'',
    // 二维码
    // codeUrl:'../../'
  },
  // 查看大图
  _previewImage(e) {
    let url = e.currentTarget.dataset.url;
    url = util._getImageUrl(url);
    wx.previewImage({
      urls: [url]
    });
  },
  //登录事件
  _getcustInfo(e) {
    this.popup.hidePopup();
    util._loading("登陆中...");
    app._login(e).then(res => {
      this.setData({
        custInfo: app.globalData.custInfo
      });
    });
  },
  // 设置留言显示
  _setCommentFlag() {
    let custInfo = this.data.custInfo;
    if (!custInfo) {
      this.popup.showPopup();
    } else {
      this.setData({
        commentType: "comment",
        commentFlag: !this.data.commentFlag
      });
    }
  },
  // 回复留言
  _reply(e) {
    console.log(e)
    this._setCommentFlag();
    this.setData({
      commentType: "reply",
      commentIndex: e.detail.index,
      userCustId: e.detail.custId,
      userMessageId: e.detail.id
    });

  },
  // 发送留言
  _sendMsg(e) {
    console.log(e)
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
        this.onShow()
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
      commentFlag: false
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
        // console.log(this.data.commentList)
      } else {
        util._toast("暂无数据");
      }

    });
  },
  // 获取历史发布
  _getHistoryRelease() {
    let historyReleaseList = this.data.historyReleaseList;
    if (!this.staticData.historyEnd || !historyReleaseList.length) {
      api._post("/message/selectMessageListByCustId", {
        pageNum: this.staticData.historyPageNum
      }).then(res => {
        if (res.success) {
          this.setData({
            historyReleaseList: historyReleaseList.concat(res.data.list),
            historyReleaseTotal: res.data.total
          });
          if (res.data.list.length >= 20) {
            this.staticData.historyPageNum += 1;
          } else {
            this.staticData.historyEnd = true;
          }
        } else {
          util._toast("暂无数据");
        }
      });
    } else {
      util._toast("暂无数据");
    }
  },
  // 切换功能
  _setNavIndex(e) {
    let index = Number(e.currentTarget.dataset.index);
    if (index != this.data.navIndex) {
      this.setData({
        navIndex: index
      });
    }
  },
  // 获取用户信息
  _getCustInfo(userId = this.data.custInfo) {
    api._post("/cust/selctCust").then(res => {
      if (res.success) {
        app.globalData.custInfo = res.data;
        // console.log(res.data)
        this.setData({
          custInfo: res.data,
          topTitle:res.data.enterpriseName ? res.data.enterpriseName:'个人'
        });
      }
    });
  },
  // 获取被浏览列表
  // _getBrowseTasks() {
  //   let browseTasksList = this.data.browseTasksList;
  //   if (!staticData.browseEnd || !browseTasksList.length) {
  //     api._post("/visit/selectVisit", {
  //       pageNum: staticData.browsePageNum
  //     }).then(res => {
  //       if (res.success) {
  //         this.setData({
  //           browseTasksList: browseTasksList.concat(res.data.list),
  //           browseTasksTotal: res.data.total
  //         });
  //         if (res.data.list.length >= 20) {
  //           staticData.browsePageNum += 1;
  //         } else {
  //           staticData.browseEnd = true;
  //         }
  //       } else {
  //         util._toast("暂无数据");
  //       }
  //     });
  //   } else {
  //     util._toast("暂无数据");
  //   }
  // },
  // 长按保存图片
  _savePosterImage() {
    util._loading("加载中...");
    api._download(util._getImageUrl(this.data.custInfo.custCardImg) + ".png").then(res => {
      wx.hideLoading();
      wx.saveImageToPhotosAlbum({
        filePath: res.tempFilePath,
        success: () => {
          util._toast('保存成功');
        },
        fail: err => {
          console.log(err)
          util._toast('保存失败');
        }
      });
    });
  },
  // 生成名片准备
  _toShare() {
    // 判断是否已经生成名片
    // if (this.data.custInfo.custCardImg) {
    //   return;
    // }
    //校验
    let that = this
    if (this.data.custInfo.isAuth !== "01" && !this.data.custInfo.custRole) {
      util._toast("请实名认证并选择职位");
      return;
    }
    // util._loading('生成中...');
   
  //   let context = wx.createCanvasContext('QRCanvas');
  //   // context.setFillStyle("transparent");
  //   context.setFillStyle('#666')
  //   context.fillRect(0, 0, 600, 350);


  //   context.setFontSize(26);
  //   context.setFillStyle('#fff');
  //   context.fillText("西安盘活科技有限公司", 130, 60);
  //   context.save(); //保存当前context的状态

  //   context.setFontSize(24);
  //   context.setFillStyle('#fff');
  //   context.fillText(`${this.data.custInfo.username}·${this.data.custInfo.custRole}`, 170, 160);
  //   context.save(); //保存当前context的状态

      
  //   //点击保存
  //   context.rect(485,35,90,30);
  //   context.setFillStyle('#4098FD');
  //   context.fillRect(485,23,90,30);
  //   context.fill();
  //   context.save();
  //   context.setFontSize(20);
  //   context.setFillStyle('#fff');
  //   context.fillText('点击保存', 490, 50);
  //   context.save();

  //   // 绘制被浏览
  //   context.setFontSize(24);
  //   context.setFillStyle('#fff');
  //   context.fillText(`访客：${this.data.browseTasksTotal}`, 460, 160);
  //   context.save();

  //   // 已认证
  //   context.drawImage('https://www.easyicon.net/api/resizeApi.php?id=566282&size=32', 400, 38, 32, 32);
  //   context.save();


  //   // 联系人
  //   context.setFontSize(21);
  //   context.setFillStyle('#fff');
  //   context.fillText(`联系电话：${this.data.custInfo.phone}`, 90, 240);
  //   context.save();

  //   context.setFontSize(21);
  //   context.setFillStyle('#fff');
  //   context.fillText(`地址：${this.data.address}`, 90, 280);
  //   context.save();

  //   context.setFontSize(20);
  //   context.setFillStyle('#fff');
  //   context.fillText("技术支持：西安盘活科技有限公司", 150, 325);
  //   context.save();

  //   context.drawImage('https://lwapi.shuguodj.com/lw-pt.png', 25, 24, 100, 100);
  //   context.save();


  //   context.draw(true,setTimeout(function(){
  //     wx.canvasToTempFilePath({
  //         canvasId: 'QRCanvas',
  //         success: function(res){
  //           // console.log(res)
  //           let img = wx.getFileSystemManager().readFileSync(res.tempFilePath, 'base64');
  //           api._post('/uploadImg', {
  //                 img: img
  //               }).then(res => {
  //                 // console.log(res)
  //                 that.setData({
  //                   ["custInfo.custCardImg"]: res.data
  //                 }, () => {
  //                   api._post('/cust/updateCustCardImg', {
  //                     custCardImg: res.data
  //                   });
  //                 });
  //               });
  //           // console.log(res)
  //             // that.data.tmpPath = res.tempFilePath
  //         },
  //     })
  // },200));


    // console.log("----")
    // let avatarUrl = this.data.custInfo.headImg;
    // let avatarUrl = 'https://lwapi.shuguodj.com/lw-pt.png'
    // util._toast('头像')
    // let bgImage = util._getImageUrl(this.data.distribution.bgImage);
    // let rzImage = util._getImageUrl(this.data.distribution.rzImage);
    // let dwImage = util._getImageUrl(this.data.distribution.dwImage);
    // let codeUrl = util._getCodeUrl(`/qrCode/messageQrCode?param=${this.data.custInfo.id}&page=pages/personalCenter/personalCenter`);
    let codeUrl = 'https://lwapi.shuguodj.com/lw-pt.png'
    // console.log(avatarUrl)
    // console.log(bgImage)
    // console.log(codeUrl)
    // , api._download(rzImage),api._download(dwImage)
    wx.downloadFile({
      url: codeUrl,
      // url1:codeUrl,
      success(res){
        // console.log(res)
        let res1 = res.tempFilePath
        // util._toast(res.tempFilePath)
        that._generatePoster(res.tempFilePath).then(res => {
          // console.log(res)
          // this.setData({
          //   ["custInfo.custCardImg"]:res
          // })
          let img = wx.getFileSystemManager().readFileSync(res, 'base64');
          
          api._post('/uploadImg', {
            img: img
          }).then(res => {
            console.log(res)
            that.setData({
              ["custInfo.custCardImg"]: res.data
            }, () => {
              api._post('/cust/updateCustCardImg', {
                custCardImg: res.data
              });
            });
          });
        });
        util._toast('生成成功')
      }
    })
    
    // Promise.all([api._download(avatarUrl), api._download(codeUrl)]).then(res => {
    //   util._toast('成功')
    //   console.log(res[0].tempFilePath)
    //   console.log(res[1].tempFilePath)
    //   this.setData({
    //     ['distribution.avatarImage']: res[0].tempFilePath,
    //     ['distribution.codeImage']: res[1].tempFilePath,
    //     // ['distribution.rzImage']: res[2].tempFilePath,
    //     // ['distribution.dwImage']: res[3].tempFilePath,
    //   }, () => {
    //     this._generatePoster().then(res => {
    //       // console.log(res)
    //       // this.setData({
    //       //   ["custInfo.custCardImg"]:res
    //       // })
    //       let img = wx.getFileSystemManager().readFileSync(res, 'base64');
          
    //       api._post('/uploadImg', {
    //         img: img
    //       }).then(res => {
    //         // console.log(res)
    //         this.setData({
    //           ["custInfo.custCardImg"]: res.data
    //         }, () => {
    //           api._post('/cust/updateCustCardImg', {
    //             custCardImg: res.data
    //           });
    //         });
    //       });
    //     });
    //   });
    //   // console.log(res)
    // }).catch(() => {
    //   wx.hideLoading();
    //   util._toast('生成失败，请重试...');
    // });
  },
  //生成名片
  _generatePoster(urlPath) {
    return new Promise((resolve, reject) => {
      // let {
      //   // bgImage,
      //   // rzImage,
      //   // dwImage,
      //   // codeImage,
      //   // avatarImage
      // } = this.data.distribution;
      // console.log("----")


      let context = wx.createCanvasContext('QRCanvas');
      // context.setFillStyle("transparent");
      context.setFillStyle('#666')
      context.fillRect(0, 0, 600, 350);

      //绘制背景图片
      // context.drawImage(bgImage, 0, 0, 600, 350);
      // context.save(); //保存当前context的状态

      // 用户头像
      // context.drawImage(urlPath, 25, 24, 80, 80);
      // context.save();

      context.setFontSize(22);
      context.setFillStyle('#fff');
      context.fillText(`${this.data.topTitle}`, 90, 50);
      context.save(); //保存当前context的状态

      // 绘制文字
      context.setFontSize(26);
      context.setFillStyle('#fff');
      context.fillText(`${this.data.custInfo.username}·${this.data.custInfo.custRole}`, 90, 162);
      context.save(); //保存当前context的状态

      //点击保存
      context.rect(0,120,30,105);
      context.setFillStyle('#4098FD');
      context.fillRect(0,120,30,105);
      context.fill();
      context.save();
      context.setFontSize(20);
      context.setFillStyle('#fff');
      context.fillText('点', 5, 143);
      context.fillText('击', 5, 168);
      context.fillText('保', 5, 193);
      context.fillText('存', 5, 218);
      context.save();

      // 绘制被浏览
      context.setFontSize(20);
      context.setFillStyle('#fff');
      context.fillText(`访客：${this.data.browseTasksTotal}`, 475, 240);
      context.save();


      // context.rect(325,62,90,30);
      // context.setFillStyle('#4098FD');
      // context.fillRect(325,62,90,30);
      // context.fill();
      // context.save();
      // context.setFontSize(20);
      // context.setFillStyle('#fff');
      // context.fillText('已认证', 330, 65);
      // context.save(); 
      // 已认证
      // context.drawImage('https://www.easyicon.net/api/resizeApi.php?id=566282&size=32', 325, 62, 32, 32);
      // context.save();

      // 联系人
      context.setFontSize(21);
      context.setFillStyle('#fff');
      context.fillText(`联系电话：${this.data.custInfo.phone}`, 90, 240);
      context.save();

      // 定位
      // context.drawImage('https://www.easyicon.net/api/resizeApi.php?id=1125514&size=32', 52, 220, 26, 26);
      // context.save();

      context.setFontSize(21);
      context.setFillStyle('#fff');
      context.fillText(`地址：${this.data.address}`, 90, 280);
      context.save();

      context.setFontSize(18);
      context.setFillStyle('#fff');
      context.fillText("­­­­­­­-技术支持：西安盘活科技有限公司-", 150, 325);
      context.save();

     // 绘制 长按识别 与我互动
    //  context.setFontSize(16);
    //  context.setFillStyle('#fff');
    //  context.setTextAlign("center");
    //  context.fillText("长按识别 与我互动", 500, 280);
    //  context.save();
 
    context.beginPath();
    context.arc(520,145,52,0,2*Math.PI);
    context.setFillStyle('#fff');
    context.closePath();
    context.fill();
    context.stroke()
    // context.clip();
    context.save();

    context.drawImage(urlPath, 470, 95, 100, 100);
    context.save();

    // //绘制二维码头像
    //  context.drawImage(codeImage, 450, 125, 100, 100);
    //  // context.setFillStyle('#fff');
    //  context.save(); //保存当前context的状态

   
    //  context.beginPath();
    //  context.arc(500, 175, 25, 0, 2 * Math.PI); //画出圆
    // //  context.setFillStyle('#fff');
    //  context.closePath();
    // //  context.fill();
    //  context.stroke()
    //  context.clip(); //裁剪上面的圆形
    //  context.drawImage(avatarImage, 475, 150, 50, 50);
    //  context.save();

       //保存当前context的状态
      
      // context.beginPath();
      // context.arc(70, 70, 42, 0, 2 * Math.PI); //画出圆
      // context.setFillStyle('#fff');
      // context.closePath();
      // context.fill();
      // context.clip(); //裁剪上面的圆形
      // context.drawImage(avatarImage, 38, 38, 70, 70);
      // context.save();
     
      // context.beginPath();
      // context.arc(300, 240, 50, 0, 2 * Math.PI); //画出圆
      // context.setFillStyle('#fff');
      // context.closePath();
      // context.fill();
      // context.clip(); //裁剪上面的圆形
      // context.drawImage(avatarImage, 250, 250, 70, 70);
      // context.save();
      // //绘制二维码
     
      


      context.draw(true, () => {
        wx.canvasToTempFilePath({
          canvasId: 'QRCanvas',
          success: res => {
            wx.hideLoading();
            console.log(res.tempFilePath)
            resolve(res.tempFilePath);
          },
          fail: err => {
            reject();
          }
        });
      });
      //将生成好的图片保存到本地，需要延迟一会，绘制期间耗时
      // setTimeout(() => {

      // }, 200);
  });
  },

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
            // console.log(res)
            // that.globalData.address = res.wxMarkerData[0].address
            this.setData({
              address: res.wxMarkerData[0].address
            })
          }
          
        });
        
      }
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // console.log(options)
    
    this.getLocationRegeo()
     // 实例化百度地图API
     bmap = new BMap.BMapWX({
      ak: app.globalData.ak
    });
    // console.log(app.globalData)
    this.setData({
      browseTasksTotal:options.num,
      userCustId:app.globalData.custInfo.id,
      userCustIdComment:app.globalData.custInfo.id,
    })
    let custInfo = app.globalData.custInfo;
    // console.log(custInfo)
    if (custInfo) {
      this._getCustInfo();
    }
    this._getCommentList();
    this._getHistoryRelease();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    //获得popup组件
    this.popup = this.selectComponent("#popup");
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    // console.log(1)
    wx.onKeyboardHeightChange(res => {
      this.setData({
        bottom: res.height
      });
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    wx.onKeyboardHeightChange(() => {});
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
    this._getHistoryRelease();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})