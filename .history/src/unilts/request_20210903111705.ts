import { extend } from 'umi-request';
import CryptoJS from 'crypto-js'

const getDay = ()=>{
  let myDate = new Date();
  let year = myDate.getFullYear();    //获取完整的年份(4位,1970-????)
  let month = myDate.getMonth() + 1       //获取当前月份(0-11,0代表1月)
  return year + '-' + month
}

const request = extend({
//   prefix: '/api/v1',
  timeout: 1000,
  headers: {
    // 'User-Agent': 'Silicom-miniGIS'
    'UserAgent': 'Silicom-miniGIS',
    "Authorization":CryptoJS.MD5(CryptoJS.MD5("Silicom-miniGIS").toString()+CryptoJS.MD5(getDay()).toString() + CryptoJS.MD5(navigator.userAgent).toString())
    )
  },
});

export default request