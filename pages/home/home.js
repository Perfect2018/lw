// pages/home/home.js
const api = require('../../utils/api.js');
const util = require('../../utils/util.js');
const BMap = require('../../libs/bmap-wx.min.js');
const app = getApp();
let bmap, locationTimer; //定时获取位置信息
let staticData = {
  pageNum: 1,
  end: false
};
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 广告图
    adImage: '',
    // 位置信息
    searchHolder: '暂未获取到位置信息',
    // 轮播图
    swiperImageList: [],
    // 分类图
    classifyList: [{
        id: 0,
        iconImg: "/images/lgyg.png",
        title: "零工用工",
        params: "001001"
      },
      {
        id: 1,
        iconImg: "/images/jxsb.png",
        title: "机械设备",
        params: "001002"
      },
      {
        id: 2,
        iconImg: "/images/zyfb.png",
        title: "工程分包",
        params: "001003"
      },
      {
        id: 3,
        iconImg: "/images/j.png",
        title: "求租求购",
        params: "001004"
      }
    ],

    // 列表
    taskList: [],
    active:true,
    isInfo:true,
    pageNum:1,
    serviceList:[]
  },
  // 获取广告和轮播图片列表
  _getAdImage() {
    api._post("/advert/getAdvertList").then(res => {
      if (res.success) {
        let adImage = "";
        let swiperImageList = [];
        res.data.forEach(elem => {
          elem.advertType === "01" ? adImage = elem : swiperImageList.push(elem)
        });
        this.setData({
          adImage,
          swiperImageList
        });
      }
    });
  },
  // 获取任务列表
  _getTask(pageNum = staticData.pageNum) {
    // console.log(pageNum)
    let location = app.globalData.location || "";
    if (location != "" && !staticData.end) {
      api._post("/message/selectAllMessageList", {
        lat: location.lat,
        lng: location.lng,
        pageNum: pageNum,
        typeClass:'01',
      }).then(res => {
        if (res.success) {
          // console.log(res.data.list)
          let taskList = this.data.taskList;
          this.setData({
            taskList: taskList.concat(res.data.list)
          });
          // console.log(this.data.taskList)
          if (res.data.list.length >= 20) {
            staticData.pageNum += 1;
          } else {
            staticData.end = true;
          }
        } else {
          util._toast("暂无数据");
        }
      })
    } else {
      util._toast("暂无数据");
    }
  },
  // 页面跳转
  _toView(e) {
    let navigatePath = e.currentTarget.dataset.navigate;
    let id = e.currentTarget.dataset.id;
    let quickRelease = e.currentTarget.dataset.params;
    // 获取地理位置后方可跳转
    if (app.globalData.location) {
      if (quickRelease) {
        app.globalData.quickRelease = quickRelease;
      }
      if (id !== "") {
        wx.navigateTo({
          url: `../${navigatePath}/${navigatePath}?id=${id}`
        });
      } else {
        util._toast("请刷新重试")
      }
    } else {
      app.getLocation();
    }
  },

  // 信息/资讯
  getInfo(){
    let active = this.data.active
    let isInfo = this.data.isInfo
    if(!active && !isInfo){
      this.setData({
        active:true,
        isInfo:true
      })
    }
    // console.log(this.data.isInfo)
  },

  getService(){
    let active = this.data.active
    let isInfo = this.data.isInfo
    if(active && isInfo){
      this.setData({
        active:false,
        isInfo:false
      })
    }
    this._getService()
    // console.log(this.data.isInfo)
  },

  service(){
    wx.navigateTo({
      url: '/pages/service/service',
    })
  },
  
  _getService(){
    // console.log(pageNum)
    api._post('/message/selectAllMessageList',{
      typeClass:'02',
      pageNum:this.data.pageNum
    }).then(res=>{
      // console.log(res)
      if(res.success){
        let serviceList=this.data.serviceList
        this.setData({
          serviceList:serviceList.concat(res.data.list)
        })
        if(res.data.list.length){
          this.data.pageNum += 1;
        }else{
          util._toast("没有更多数据了")
        }
      }else{
          util._toast("获取失败")
      }
      
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this._getAdImage();
    // 实例化百度地图API
    bmap = new BMap.BMapWX({
      ak: app.globalData.ak
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
    // console.log(111)
    // this._getService()
    // 定时获取定位
    if (!app.globalData.location) {
      app.getLocation().then(() => {
        this.setData({
          pageNum:1 
        })
        staticData = {
          pageNum: 1,
          // pageNumb:1,
          end: false
        };
        this._getTask();
        this._getService()
        this.getLocationRegeo();
        locationTimer = setInterval(this.getLocationRegeo, 60000);
      });
    } else {
      this.setData({
        taskList: [],
        serviceList:[],
        pageNum:1
      }, () => {
        staticData = {
          pageNum: 1,
          // pageNumb:1,
          end: false
        };
        this._getTask();
        this._getService()
        this.getLocationRegeo();
        locationTimer = setInterval(this.getLocationRegeo, 60000);
      });

    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    clearInterval(locationTimer); //清除定时器
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
    this.setData({
      taskList: []
    }, () => {
      staticData = {
        pageNum: 1,
        end: false
      };
      this._getTask();
      setTimeout(() => {
        wx.stopPullDownRefresh();
      }, 800);
    });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if(this.data.active){
      this._getTask();
    }else{
      this._getService()
    }
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  // 实时获取用户位置 (逆向解析)
  getLocationRegeo(location = app.globalData.location || "") {
    var that = this
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
              searchHolder: res.wxMarkerData[0].address
            })
          }
          
        });
        
      }
    });
  }
})