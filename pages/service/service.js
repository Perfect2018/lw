// pages/service/service.js
const util = require('../../utils/util.js');
const api = require('../../utils/api.js');
const validate = require('../../utils/validate.js');
const BMap = require('../../libs/bmap-wx.min.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    types:["政策资讯","施工规范","施工经验","其他"],
    index:0,
    title:'',
    detail:'',
    img1:"",
    img2:"",
    img3:'',
    messageType:'03',
     // 删除图片
     deleteImg: "/images/lw-del.png",
     audit:'no'
  },

  bindPickerChange(e){
    // console.log(e)
    let num=Number(e.detail.value)+3
    // console.log(num)
    this.setData({
      index:e.detail.value,
      messageType:'0'+num
    })
    console.log(this.data.messageType)
  },

  getParams(e){
    // console.log(e)
    let key = e.currentTarget.dataset.key
    let value = e.detail.value
    this.setData({
      [key]:value
    })
    // console.log(this.data.title)
    // console.log(this.data.detail)
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

   // 删除图片
   _delImg(e) {
    let baseurl = e.currentTarget.dataset.baseurl;
    this.setData({
      [baseurl]: '',
    });
  },

  submit(){
    // console.log(this.data.img1)
    // console.log(this.data.img2)
    // console.log(this.data.img3)
    let title = this.data.title.trim();
    let detail = this.data.detail;
    if(!title){
      util._toast('标题不能为空')
    }else if(!detail){
      util._toast('内容不能为空')
    }else{
      api._post('/message/insertMessage',{
        titleName:title,
        describle:detail,
        messageType:this.data.messageType,
        typeClass:'02',
        img1:this.data.img1,
        img2:this.data.img2,
        img3:this.data.img3
      }).then(res=>{
        if(res.success){
          wx.switchTab({
            url: '/pages/home/home',
          });
          util._toast("发布成功");
        } else {
          util._toast("发布失败")
        }
      })
      // console.log(111)
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      audit:app.globalData.audit
    })
   console.log(this.data.audit)
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