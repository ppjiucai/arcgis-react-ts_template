import { extend } from 'umi-request';
import CryptoJS from 'crypto-js'

const getDay = ()=>{
  let myDate = new Date();
  let year = myDate.getFullYear();    //获取完整的年份(4位,1970-????)
  let month = myDate.getMonth() + 1 <10?'0' + (myDate.getMonth() + 1):+ myDate.getMonth() + 1       //获取当前月份(0-11,0代表1月)
  let day = myDate.getDate()<10?'0'+myDate.getDate():myDate.getDate() 
  // console.log(year + '-' + month +'-'+ day,CryptoJS.MD5("Silicom-miniGIS").toString()) 
  return year + '-' + month +'-'+ day;
  // return '2021-09-01'
}

const request = extend({
//   prefix: '/api/v1',    7c6116f3c2bb5c788cb3a425d9625af8 0995c78ab69d730c6c188ba001b9ad36 164ef18bd347e2080439bfc8a27818e8
// 7c6116f3c2bb5c788cb3a425d9625af80995c78ab69d730c6c188ba001b9ad36164ef18bd347e2080439bfc8a27818e8
  timeout: 15000,
  headers: {
    "Authorization":CryptoJS.MD5(CryptoJS.MD5("Silicom-miniGIS").toString()+CryptoJS.MD5(getDay()).toString() + CryptoJS.MD5(navigator.userAgent).toString()).toString()
  },
});

export default request