// API Endpoints - giữ nguyên từ Android app
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/general/login',
    GET_USER_INFO: '/general/swip/getwipuserinfo',
  },
  HOME: {
    GET_INFO: '/general/swip/getwiphomeinfo',
  },
  DOCUMENTS: {
    GET_LIST: '/general/swip/getwipdoclist',
    GET_DETAIL: '/general/swip/getwipdocdetail',
    GET_TODAY: '/general/swip/getwipdoclisttoday',
    INSERT_MASTER: '/general/swip/insertwipdocmaster',
    INSERT_DETAIL: '/general/swip/insertwipdocdetail',
  },
} as const;

// Default timeout
export const API_TIMEOUT = 30000;
