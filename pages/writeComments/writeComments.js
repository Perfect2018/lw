// pages/writeComments/writeComments.js
const util = require('../../utils/util.js');
const api = require('../../utils/api.js');
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    custInfo: null
  },
  //取消事件
  _cancel() {
    this.popup.hidePopup();
  },
  //确认事件
  _getcustInfo(e) {
    this.popup.hidePopup();
    util._loading("登陆中...");
    app._login(e).then(res => {
      this.setData({
        custInfo: app.globalData.custInfo
      });
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    //获得popup组件
    this.popup = this.selectComponent("#popup");
  },
  // 获取光标
  _contentFocus() {
    let custInfo = app.globalData.custInfo;
    if (!custInfo) {
      this.popup.showPopup();
    } else {
      this.setData({
        custInfo: custInfo
      });
    }
  },
  // 确认留言
  _postComments() {

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