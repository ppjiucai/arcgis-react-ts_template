import { extend } from 'umi-request';

const request = extend({
//   prefix: '/api/v1',
  timeout: 1000,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});