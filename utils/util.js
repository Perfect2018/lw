const config = require('../config.js');
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
// 获取图片链接
const _getImageUrl = id => {
  return `${config.Host}/outByteImgById?id=${id}`;
}
// 获取二维码链接
const _getCodeUrl = path => {
  return `${config.Host}${path}`;
}
// 提示框
const _toast = msg => {
  wx.showToast({
    title: msg,
    icon: 'none',
    duration: 1500
  })
}
// 提示框
const _modal = msg => {
  wx.showModal({
    title: '提示',
    content: msg,
    showCancel: false,
    confirmColor: '#1e90ff'
  });
}
// 提示框
const _loading = (msg = '加载中...') => {
  wx.showLoading({
    title: msg,
    mask: true
  });
}
// 删除数组中某个元素
const arrRemoveObj = (array, obj) => {
  let length = array.length;
  for (let i = 0; i < length; i++) {
      if (array[i] === obj) {
          if (i === 0) {
              array.shift();
              return array;
          } else if (i === length - 1) {
              array.pop();
              return array;
          } else {
              array.splice(i, 1);
              return array;
          }
      }
  }
}
// date工具
const dateUtils = {
  UNITS: {
    '年': 31557600000,
    '月': 2629800000,
    '天': 86400000,
    '小时': 3600000,
    '分钟': 60000,
    '秒': 1000
  },
  humanize: function(milliseconds) {
    let humanize = '';
    for (let key in this.UNITS) {
      if (milliseconds >= this.UNITS[key]) {
        humanize = Math.floor(milliseconds / this.UNITS[key]) + key + '前';
        break;
      }
    }
    return humanize || '刚刚';
  },
  parse: function(str) { //将"yyyy-mm-dd HH:MM:ss"格式的字符串，转化为一个Date对象
    let a = str.split(/[^0-9]/);
    return new Date(a[0], a[1] - 1, a[2], a[3], a[4], a[5]);
  },
  format: function(date) {
    date = new Date(date);
    let diff = Date.now() - date.getTime();
    if (diff < this.UNITS['天']) {
      return this.humanize(diff);
    }
    let _format = function(number) {
      return (number < 10 ? ('0' + number) : number);
    };
    return date.getFullYear() + '-' + _format(date.getMonth() + 1) + '-' + _format(date.getDate()) + ' ' +
      _format(date.getHours()) + ':' + _format(date.getMinutes());
  },



}

module.exports = {
  _toast,
  _modal,
  _loading,
  _getImageUrl,
  _getCodeUrl,
  formatTime: formatTime,
  dateUtils: dateUtils,
  arrRemoveObj: arrRemoveObj
}