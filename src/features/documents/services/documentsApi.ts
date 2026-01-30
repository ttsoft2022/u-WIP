import axios from 'axios';
import {serverConfigService} from '../../../services/serverConfig';
import {useAuthStore} from '../../auth/store/authStore';
import type {DocMaster, DocDetail, DocListParams} from '../types/document.types';

export const documentsApi = {
  /**
   * Get document list
   * API: getwipdoclist (GET method)
   * Params: username, fdate, tdate, type
   */
  getDocList: async (params: DocListParams): Promise<DocMaster[]> => {
    try {
      const config = await serverConfigService.getConfig();
      if (!config?.serverUrl || !config?.databaseAlias) {
        throw new Error('Server chưa được cấu hình');
      }

      // Get username from auth store
      const user = useAuthStore.getState().user;
      const username = user?.userNo || '';

      const url = `${config.serverUrl}/${config.databaseAlias}/general/swip/getwipdoclist`;

      // Get today's date if not provided
      const today = new Date().toISOString().split('T')[0];
      const fromDate = params.fromDate || today;
      const toDate = params.toDate || today;

      const response = await axios.get(url, {
        params: {
          username: username,
          fdate: fromDate,
          tdate: toDate,
          type: params.docType,
        },
        timeout: 15000,
      });

      if (response.data?.status === true && response.data?.list) {
        // Return raw data from API - already in UPPER_CASE format
        return response.data.list;
      }

      return [];
    } catch (error: any) {
      console.error('Get doc list error:', error);
      throw new Error(error.message || 'Không thể tải danh sách chứng từ');
    }
  },

  /**
   * Get document detail
   * API: getwipdocdetail (GET method)
   */
  getDocDetail: async (
    noLot: string,
    noOrd: string,
    docType: string,
  ): Promise<{master: DocMaster; details: DocDetail[]}> => {
    try {
      const config = await serverConfigService.getConfig();
      if (!config?.serverUrl || !config?.databaseAlias) {
        throw new Error('Server chưa được cấu hình');
      }

      const url = `${config.serverUrl}/${config.databaseAlias}/general/swip/getwipdocdetail`;

      const response = await axios.get(url, {
        params: {
          nolot: noLot,
          noord: noOrd,
          type: docType,
        },
        timeout: 15000,
      });

      if (response.data?.status === true) {
        return {
          master: response.data.master || {},
          details: response.data.list || [],
        };
      }

      throw new Error('Không thể tải chi tiết chứng từ');
    } catch (error: any) {
      console.error('Get doc detail error:', error);
      throw new Error(error.message || 'Không thể tải chi tiết chứng từ');
    }
  },

  /**
   * Get today's documents
   * API: getwipdoclisttoday (GET method)
   */
  getDocsToday: async (docType: number): Promise<DocMaster[]> => {
    try {
      const config = await serverConfigService.getConfig();
      if (!config?.serverUrl || !config?.databaseAlias) {
        throw new Error('Server chưa được cấu hình');
      }

      const user = useAuthStore.getState().user;
      const username = user?.userNo || '';

      const url = `${config.serverUrl}/${config.databaseAlias}/general/swip/getwipdoclisttoday`;

      const response = await axios.get(url, {
        params: {
          username: username,
          type: docType,
        },
        timeout: 15000,
      });

      if (response.data?.status === true && response.data?.list) {
        return response.data.list;
      }

      return [];
    } catch (error: any) {
      console.error('Get docs today error:', error);
      throw new Error(error.message || 'Không thể tải danh sách chứng từ hôm nay');
    }
  },

  /**
   * Update document detail (insert/update quantity)
   * API: insertwipdocdetail (POST method)
   */
  updateDocDetail: async (
    noLot: string,
    noOrd: string,
    docType: string,
    details: Array<{noSize: string; noColor: string; qty: number}>,
  ): Promise<{status: string; message?: string}> => {
    try {
      const config = await serverConfigService.getConfig();
      if (!config?.serverUrl || !config?.databaseAlias) {
        throw new Error('Server chưa được cấu hình');
      }

      const user = useAuthStore.getState().user;
      const username = user?.userNo || '';

      const url = `${config.serverUrl}/${config.databaseAlias}/general/swip/insertwipdocdetail`;

      const response = await axios.post(url, null, {
        params: {
          username: username,
          nolot: noLot,
          noord: noOrd,
          type: docType,
          details: JSON.stringify(details),
        },
        timeout: 15000,
      });

      if (response.data?.status === true) {
        return {
          status: 'success',
          message: response.data.message || 'Cập nhật thành công',
        };
      }

      throw new Error(response.data?.message || 'Cập nhật thất bại');
    } catch (error: any) {
      console.error('Update doc detail error:', error);
      throw new Error(error.message || 'Không thể cập nhật chứng từ');
    }
  },
};
