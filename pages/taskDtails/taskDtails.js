// pages/missionDtails/missionDtails.js
const util = require('../../utils/util.js');
const api = require('../../utils/api.js');
// let staticData = {
//   historyPageNum: 1,
//   historyEnd: false,
//   favoritePageNum: 1,
//   favoriteEnd: false,
//   browsePageNum: 1,
//   browseEnd: false,
// };
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 广告图
    adImage: 'https://lwapi.shuguodj.com/outByteImgById?id=5e007fe80147fd493134fee0',
    // id
    id: "",
    type:'',
    // 收藏
    collection: false,
    task: null,
    // 分享海报
    showPoster: false, //是否显示海报
    distribution: {
      taskImage: '',
      codeImage: '',
      avatarImage: '',
      posterImage: ''
    },
    isPraise:false,
    isComment:false,
    isShow:false,
    comment:'',
    commentList:[],
    // detail:'',
    // 浏览数
    browseNum:'0'
  },
  // 长按保存图片
  _savePosterImage() {
    wx.saveImageToPhotosAlbum({
      filePath: this.data.distribution.posterImage,
      success: res => {
        console.log(res);
        util._toast('保存成功');
      },
      fail: err => {
        console.log(err);
        util._toast('保存失败');
      }
    })
  },
  // 显示隐藏海报
  _setShowPoster(showPoster = this.data.showPoster) {
    this.setData({
      showPoster: !showPoster
    });
  },
  // 去分享
  toShare(){
    // console.log(1)
    this.onShareAppMessage()
  },
  // 去分享
  _toShare() {
    // 判断是否已经生成海报
    if (this.data.distribution.posterImage) {
      this._setShowPoster();
      return;
    }
    // 判断登录
    // if (app.globalData.isLogin && custId) {
    util._loading('生成中...');
    let taskImage = util._getImageUrl(this.data.task.message.img1);
    let avatarUrl = this.data.task.customer.headImg;
    let codeUrl = util._getCodeUrl(`/qrCode/messageQrCode?param=${this.data.task.message.id}&page=pages/snapUpDetail/snapUpDetail`);
    // let codeUrl = util._getCodeUrl(`/qrCode/messageQrCode?param=${this.data.task.message.id}&page=pages/taskDtails/taskDtails`);
    Promise.all([api._download(taskImage), api._download(avatarUrl), api._download(codeUrl)]).then(res => {
      this.setData({
        ['distribution.taskImage']: res[0].tempFilePath,
        ['distribution.avatarImage']: res[1].tempFilePath,
        ['distribution.codeImage']: res[2].tempFilePath,
      }, () => {
        this._generatePoster().then(res => {
          this.setData({
            ['distribution.posterImage']: res,
            showPoster: true
          });
        });
      });
    }).catch(() => {
      wx.hideLoading();
      util._toast('生成失败，请重试...');
    });
    // }
  },
  //生成海报
  _generatePoster() {
    return new Promise((resolve, reject) => {
      let {
        taskImage,
        codeImage,
        avatarImage
      } = this.data.distribution;
      let context = wx.createCanvasContext('QRCanvas');
      context.setFillStyle("#fff");
      context.fillRect(0, 0, 600, 500);
      //绘制商品图片
      context.drawImage(taskImage, 0, 100, 600, 400);
      context.save(); //保存当前context的状态

      // 绘制文字
      context.setFontSize(30);
      context.setFillStyle('#000');
      context.fillText(this.data.task.message.titleName, 20, 55);
      context.fill();
      context.save(); //保存当前context的状态

      //绘制二维码
      context.drawImage(codeImage, 500, 400, 100, 100);
      context.save(); //保存当前context的状态

      //绘制二维码头像
      context.arc(550, 450, 23, 0, 2 * Math.PI); //画出圆
      context.fill();
      context.clip(); //裁剪上面的圆形
      context.drawImage(avatarImage, 527, 427, 50, 50);
      context.save();

      context.draw();
      //将生成好的图片保存到本地，需要延迟一会，绘制期间耗时
      setTimeout(() => {
        wx.canvasToTempFilePath({
          canvasId: 'QRCanvas',
          success: res => {
            wx.hideLoading();
            resolve(res.tempFilePath);
          },
          fail: err => {
            reject();
          }
        });
      }, 300);
    });

  },

  // 设置收藏
  _setFavorite() {
    let collection = this.data.collection;
    if (!collection) {
      // 添加收藏
      api._post("/collection/insertCollection", {
        messageId: this.data.id
      }).then(res => {
        if (res.success) {
          this.setData({
            collection: true
          });
          util._toast("收藏成功");
        } else {
          util._toast("收藏失败");
        }
      });
    } else {
      // 取消收藏
      api._post("/collection/updateCollection", {
        messageId: this.data.id
      }).then(res => {
        if (res.success) {
          this.setData({
            collection: false
          });
          util._toast("取消成功");
        } else {
          util._toast("取消失败");
        }
      });
    }

  },
  // 获取信息详情
  _getTask() {
    let custId = api.getCustID() || 0;
    api._post("/message/selectMessageById", {
      messageId: this.data.id,
      custId: custId,
      typeClass:this.data.type
    }).then(res => {
      // console.log(res.data.message.browseNum)
      // console.log(res)
      res.data.message.createDate = util.dateUtils.format(res.data.message.createDate);
      this.setData({
        collection: res.data.collection === "YES" ? true : false,
        task: res.data,
        isPraise:res.data.support === "YES" ? true : false,
        browseNum:res.data.message.browseNum,
        commentList:res.data.comment
      });
    });
  },
  // 立即联系
  _makePhoneCall() {
    wx.makePhoneCall({
      phoneNumber: this.data.task.message.phone
    });
  },

  // 点赞
  praise(){
    let isPraise = this.data.isPraise
    // 取消点赞
    if(isPraise){
      api._post('/support/deleteSupport',{
        messageId:this.data.id
      }).then(res=>{
        if(res.success){
          this.setData({
            isPraise:!this.data.isPraise
          });
          util._toast('取消成功')
        }else{
          util._toast('取消失败')
        }
      })
    }else{
      api._post('/support/insertSupport',{
        messageId:this.data.id
      }).then(res=>{
        if(res.success){
          this.setData({
            isPraise:!this.data.isPraise
          });
          util._toast('点赞成功')
        }else{
          util._toast('点赞失败')
        }
      })
    }
  },

  // 评论
  comment(){
    this.setData({
      isShow:true
    })
  },

  getParams(e){
    console.log(e)
    let key = e.currentTarget.dataset.key
    let value = e.detail.value
    this.setData({
      [key]:value
    })
  },
  
  // 发表评论
  send(){
    let _this = this
    if(!this.data.comment){
      util._toast('评论内容不能为空')
    }else{
      api._post('/comment/insertComment',{
        messageId:this.data.id,
        comment:this.data.comment
      }).then(res=>{
        if(res.success){
          util._toast('发表成功')
          this.setData({
            isShow:!this.data.isShow
          },()=>{
            _this._getTask()
          })
        }else{
          util._toast('发表失败')
        }
      })
    }
    // console.log(this.data.comment)
  },
  // 获取浏览数
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
 
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // console.log(options)
    this.setData({
      id: options.id,
      type: options.type
    }, () => {
      this._getTask();
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

  }
})