import { extend } from 'umi-request';
import CryptoJS from 'crypto-js'

const getDay = ()=>{
  let myDate = new Date();
  let year = myDate.getFullYear();    //获取完整的年份(4位,1970-????)
  let month = myDate.getMonth() + 1 <10?'0' + myDate.getMonth() + 1:+ myDate.getMonth() + 1       //获取当前月份(0-11,0代表1月)
  let day = myDate.getDate()<10?'0'+myDate.getDate():myDate.getDate() 
  // return year + '-' + month +'-'+ day;
  console.log(navigator.userAgent)
  return '2021-09-01'
}

const request = extend({
//   prefix: '/api/v1',
  timeout: 1000,
  headers: {
    "Authorization":CryptoJS.MD5(CryptoJS.MD5("Silicom-miniGIS").toString()+CryptoJS.MD5(getDay()).toString() + CryptoJS.MD5(navigator.userAgent).toString()).toString()
  },
});

export default request