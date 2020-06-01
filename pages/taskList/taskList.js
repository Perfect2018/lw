// pages/taskList/taskList.js
const api = require('../../utils/api.js');
const util = require('../../utils/util.js');
const app = getApp();
let staticData = {
  classificationImgList: ['/images/lw-ad.png', '/images/lw-ad.png', '/images/lw-ad.png', '/images/lw-ad.png'],
  pageNum: 1,
  end: false
};
Page({


  /**
   * 页面的初始数据
   */
  data: {
    // 广告图
    adImage: 'https://lwapi.shuguodj.com/outByteImgById?id=5e007fe80147fd493134fee0',
    // 分类id
    quickRelease: "",
    // 列表
    taskList: []
  },
  // 页面跳转
  _toView(e) {
    let navigatePath = e.currentTarget.dataset.navigate;
    wx.switchTab({
      url: `../${navigatePath}/${navigatePath}`,
    });
  },
  // 获取数据
  _getTaskList(code = this.data.quickRelease) {
    if (!staticData.end) {
      let pageNum = staticData.pageNum;
      api._post("/category/selectMessageByCategory", {
        code: code,
        pageNum: pageNum
      }).then(res => {
        if (res.success) {
          let taskList = this.data.taskList;
          // console.log(res.data)
          this.setData({
            taskList: taskList.concat(res.data.list)
          });
          if (res.data.list.length >= 20) {
            staticData.pageNum += 1;
          } else {
            staticData.end = true;
          }
        } else {
          util._toast("暂无数据");
        }
      });
    } else {
      util._toast("暂无数据");
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    staticData = {
      classificationImgList: ['/images/lw-ad.png', '/images/lw-ad.png', '/images/lw-ad.png', '/images/lw-ad.png'],
      pageNum: 1,
      end: false
    };
    this.setData({
      classificationImg: staticData.classificationImgList[options.id],
      quickRelease: app.globalData.quickRelease
    }, () => {
      this._getTaskList();
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
    this._getTaskList();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})