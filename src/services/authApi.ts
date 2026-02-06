import axios from 'axios';
import CryptoJS from 'crypto-js';
import {serverConfigService} from './serverConfig';
import type {LoginResponse, HomeInfo, User} from '../types/auth.types';

// MD5 hash function (matching Java implementation)
const md5Hash = (text: string): string => {
  return CryptoJS.MD5(text).toString(CryptoJS.enc.Hex);
};

export const authApi = {
  /**
   * Login user - using GET method like uTeamsRN and Android original
   * URL format: ${serverUrl}/${databaseAlias}/general/login
   */
  login: async (username: string, password: string): Promise<LoginResponse> => {
    try {
      // Get server config
      const config = await serverConfigService.getConfig();
      if (!config?.serverUrl || !config?.databaseAlias) {
        throw new Error('Server chưa được cấu hình');
      }

      const url = `${config.serverUrl}/${config.databaseAlias}/general/login`;

      // Hash password using MD5
      const hashedPassword = md5Hash(password);

      const response = await axios.get(url, {
        params: {
          name_usl: username,
          password_usl: hashedPassword,
        },
        timeout: 10000,
      });

      if (response.data?.status === true) {
        return {
          status: 'success',
          user: {
            userNo: username,
            userName: username,
            departmentNo: '',
            departmentName: '',
          },
          message: 'Đăng nhập thành công',
        };
      } else {
        const errorMsg =
          response.data?.err_msg || 'Đăng nhập không thành công';
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.message || 'Không thể kết nối tới server';
      throw new Error(errorMessage);
    }
  },

  /**
   * Get user info and permissions
   */
  getUserInfo: async (
    userNo: string,
  ): Promise<{user: User; permissions: string[]}> => {
    try {
      const config = await serverConfigService.getConfig();
      if (!config?.serverUrl || !config?.databaseAlias) {
        throw new Error('Server chưa được cấu hình');
      }

      const url = `${config.serverUrl}/${config.databaseAlias}/general/getuserrights`;

      const response = await axios.get(url, {
        params: {
          papp_no: 10,
          puser_no: userNo,
        },
        timeout: 10000,
      });

      if (response.data?.status === true) {
        const rightsList = response.data.list || [];
        const permissions = rightsList.map(
          (right: any) => right.NO_MUL?.toString() || '',
        );

        return {
          user: {
            userNo: userNo,
            userName: userNo,
            departmentNo: '',
            departmentName: '',
          },
          permissions,
        };
      } else {
        throw new Error(
          response.data?.message || 'Không thể lấy thông tin người dùng',
        );
      }
    } catch (error: any) {
      console.error('Get user info error:', error);
      throw new Error(error.message || 'Không thể kết nối tới server');
    }
  },

  /**
   * Get home screen info (dashboard statistics)
   * Calls 2 APIs:
   * 1. getwipuserinfo - for NAME_EMP, NAME_DEP, rights
   * 2. getwiphomeinfo - for QTY_REMAIN_01-04, QTY_IN_OUT_01-04
   */
  getHomeInfo: async (userNo: string): Promise<HomeInfo> => {
    try {
      const config = await serverConfigService.getConfig();
      if (!config?.serverUrl || !config?.databaseAlias) {
        throw new Error('Server chưa được cấu hình');
      }

      const today = new Date().toISOString().split('T')[0];

      // Call API 1: getwipuserinfo - get employee info
      const userInfoUrl = `${config.serverUrl}/${config.databaseAlias}/general/swip/getwipuserinfo`;
      const userInfoResponse = await axios.get(userInfoUrl, {
        params: {
          username: userNo,
          fdate: today,
          tdate: today,
        },
        timeout: 10000,
      });

      // Call API 2: getwiphomeinfo - get quantity info
      const homeInfoUrl = `${config.serverUrl}/${config.databaseAlias}/general/swip/getwiphomeinfo`;
      const homeInfoResponse = await axios.get(homeInfoUrl, {
        params: {
          username: userNo,
          fdate: today,
          tdate: today,
        },
        timeout: 10000,
      });

      // Merge data from both APIs
      if (userInfoResponse.data?.status === true && userInfoResponse.data?.list?.length > 0) {
        const userData = userInfoResponse.data.list[0];
        const homeData = homeInfoResponse.data?.status === true && homeInfoResponse.data?.list?.length > 0
          ? homeInfoResponse.data.list[0]
          : {};

        return {
          employeeNo: userData.NO_EMP || userNo,
          employeeName: userData.NAME_EMP || userNo,
          departmentName: userData.NAME_DEP || '',
          right719: userData.RIGHT_719 === true || userData.RIGHT_719 === 1,
          right729: userData.RIGHT_729 === true || userData.RIGHT_729 === 1,
          qty1Remain: homeData.QTY_REMAIN_01 || 0,
          qty2Remain: homeData.QTY_REMAIN_02 || 0,
          qty3Remain: homeData.QTY_REMAIN_03 || 0,
          qty4Remain: homeData.QTY_REMAIN_04 || 0,
          qtyInOut01: homeData.QTY_IN_OUT_01 || 0,
          qtyInOut02: homeData.QTY_IN_OUT_02 || 0,
          qtyInOut03: homeData.QTY_IN_OUT_03 || 0,
          qtyInOut04: homeData.QTY_IN_OUT_04 || 0,
        };
      } else {
        // Return default if no data
        return {
          employeeNo: userNo,
          employeeName: userNo,
          departmentName: '',
          right719: false,
          right729: false,
          qty1Remain: 0,
          qty2Remain: 0,
          qty3Remain: 0,
          qty4Remain: 0,
          qtyInOut01: 0,
          qtyInOut02: 0,
          qtyInOut03: 0,
          qtyInOut04: 0,
        };
      }
    } catch (error: any) {
      console.error('Get home info error:', error);
      throw new Error(error.message || 'Không thể kết nối tới server');
    }
  },
};
