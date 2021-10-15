import { extend } from 'umi-request';
import CryptoJS from 'crypto-js'

const request = extend({
//   prefix: '/api/v1',
  timeout: 1000,
  headers: {
    // 'User-Agent': 'Silicom-miniGIS',navigator.userAgent
    'UserAgent': 'Silicom-miniGIS',
    "":""
  },
});

export default request