// pages/mineBusinessCard/mineBusinessCard.js
const util = require('../../utils/util.js');
const api = require('../../utils/api.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    custInfo: null,
    // 分享海报
    showPoster: false, //是否显示海报
    distribution: {
      bgImage: '../../images/lw-wdmp.png',
      codeImage: '',
      avatarImage: '',
      posterImage: ''
    }
  },
  // 长按保存图片
  _savePosterImage() {
    wx.saveImageToPhotosAlbum({
      filePath: this.data.distribution.posterImage,
      success: res => {
        util._toast('保存成功');
      },
      fail: err => {
        util._toast('保存失败');
      }
    })
  },
  // 去分享
  _toShare() {
    // 判断是否已经生成海报
    if (this.data.distribution.posterImage) {
      this._setShowPoster();
      return;
    }
    util._loading('生成中...');
    let avatarUrl = this.data.custInfo.headImg;
    let codeUrl = util._getCodeUrl(`/qrCode/messageQrCode?hyaline=true&param=43&page=pages/snapUpDetail/snapUpDetail`);
    // let codeUrl = util._getCodeUrl(`/qrCode/messageQrCode?param=${this.data.task.message.id}&page=pages/taskDtails/taskDtails`);
    Promise.all([api._download(avatarUrl), api._download(codeUrl)]).then(res => {
      this.setData({
        ['distribution.avatarImage']: res[0].tempFilePath,
        ['distribution.codeImage']: res[1].tempFilePath
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
  },
  //生成海报
  _generatePoster() {
    return new Promise((resolve, reject) => {
      let {
        bgImage,
        codeImage,
        avatarImage
      } = this.data.distribution;
      let context = wx.createCanvasContext('QRCanvas');
      context.setFillStyle("rgba(255, 255, 255, 0)");
      context.fillRect(0, 0, 600, 350);

      //绘制商品图片
      context.drawImage(bgImage, 0, 0, 600, 350);
      context.save(); //保存当前context的状态

      // 用户头像
      context.drawImage(avatarImage, 70, 30, 60, 60);
      context.save(); //保存当前context的状态

      // 绘制文字
      context.setFontSize(20);
      context.setFillStyle('#000');
      context.fillText("盘活科技", 150, 55);
      context.fill();
      context.save(); //保存当前context的状态

      // 绘制已认证背景
      context.setFillStyle('#6CAC1B');
      context.fillRect(150, 70, 45, 20);
      // 绘制已认证
      context.setFontSize(12);
      context.setFillStyle('#fff');
      context.fillText("已认证", 155, 85);
      context.fill();
      context.save(); //保存当前context的状态

      // 绘制被浏览
      context.setFontSize(12);
      context.setFillStyle('#6CAC1B');
      context.fillText("被浏览：189", 200, 85);
      context.fill();
      context.save(); //保存当前context的状态

      // 绘制职位
      context.setFontSize(20);
      context.setFillStyle('#000');
      context.setTextAlign("center");
      context.fillText("职位", 150, 180);
      context.fill();
      context.save(); //保存当前context的状态

      // 绘制职位名称
      context.setFontSize(20);
      context.setFillStyle('#000');
      context.setTextAlign("center");
      context.fillText("总经理", 150, 230);
      context.fill();
      context.save(); //保存当前context的状态

      // 绘制 长按识别 与我互动
      context.setFontSize(12);
      context.setFillStyle('#6CAC1B');
      context.fillText("长按识别 与我互动", 320, 250);
      context.fill();
      context.save(); //保存当前context的状态


      //绘制二维码
      context.drawImage(codeImage, 320, 130, 100, 100);
      context.save(); //保存当前context的状态

      //绘制二维码头像
      context.arc(370, 180, 23, 0, 2 * Math.PI); //画出圆
      context.fill();
      context.clip(); //裁剪上面的圆形
      context.drawImage(avatarImage, 347, 157, 50, 50);
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
      }, 600);
    });

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      custInfo: app.globalData.custInfo
    }, () => {
      this._toShare();
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