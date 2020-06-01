// 验证金钱格式
const validMoney = (money) => {
  var reg = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/;
  return reg.test(money) ? true : false;
}
// 验证手机号格式
const validPhone = (phone) => {
  var reg = /^\d{11}$/;
  return reg.test(phone) ? true : false;
}
// 验证中文格式
const validChinese = (temp) => {
  var reg = /^[\u4e00-\u9fa5]{1,}$/;
  return reg.test(temp) ? true : false;
}
// 验证身份证号
const validCardId = (temp) => {
  var reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
  return reg.test(temp) ? true : false;
}

// 抛出
module.exports = {
  validMoney,
  validPhone,
  validChinese,
  validCardId
}