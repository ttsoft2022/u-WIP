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
   * Params: noDed, noDep, noLot, noOrd (=NO_ORD_712), fdate, tdate, type
   * Note: noDed is empty string from DocList, actual value from DocsToday
   */
  getDocDetail: async (
    noLot: string,
    noOrd712: string,
    noDep: string,
    docType: string,
    noDed: string = '', // noDed: empty from DocList, actual from DocsToday
  ): Promise<{master: DocMaster; details: DocDetail[]}> => {
    try {
      const config = await serverConfigService.getConfig();
      if (!config?.serverUrl || !config?.databaseAlias) {
        throw new Error('Server chưa được cấu hình');
      }

      const url = `${config.serverUrl}/${config.databaseAlias}/general/swip/getwipdocdetail`;

      // Get today's date
      const today = new Date().toISOString().split('T')[0];

      const response = await axios.get(url, {
        params: {
          noDed: noDed, // Required param - empty for new, filled for existing
          noDep: noDep,
          noLot: noLot,
          noOrd: noOrd712,
          fdate: today,
          tdate: today,
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
   * Params: username, fdate, tdate, type (same as Android)
   */
  getDocsToday: async (docType: number): Promise<DocMaster[]> => {
    try {
      const config = await serverConfigService.getConfig();
      if (!config?.serverUrl || !config?.databaseAlias) {
        throw new Error('Server chưa được cấu hình');
      }

      const user = useAuthStore.getState().user;
      const username = user?.userNo || '';

      // Get today's date in yyyy-MM-dd format (same as Android)
      const today = new Date().toISOString().split('T')[0];

      const url = `${config.serverUrl}/${config.databaseAlias}/general/swip/getwipdoclisttoday`;

      const response = await axios.get(url, {
        params: {
          username: username,
          fdate: today,
          tdate: today,
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
   * Insert document master (step 1 of save)
   * API: insertwipdocmaster (POST method)
   * Returns noDed (document number) for use in insertDocDetail
   */
  insertDocMaster: async (params: {
    noOrd: string;
    noOrd712: string;
    noLot: string;
    noDep: string;
    noDepTo: string;
    noPrd: string;
    docType: string;
  }): Promise<string> => {
    try {
      const config = await serverConfigService.getConfig();
      if (!config?.serverUrl || !config?.databaseAlias) {
        throw new Error('Server chưa được cấu hình');
      }

      const user = useAuthStore.getState().user;
      const username = user?.userNo || '';

      const url = `${config.serverUrl}/${config.databaseAlias}/general/swip/insertwipdocmaster`;

      const response = await axios.post(url, null, {
        params: {
          username: username,
          noOrd: params.noOrd,
          noOrd712: params.noOrd712,
          noLot: params.noLot,
          noDep: params.noDep,
          noDepTo: params.noDepTo,
          noPrd: params.noPrd,
          type: params.docType,
        },
        timeout: 15000,
      });

      if (response.data?.status === true) {
        // noDed is returned in err_msg field
        return response.data.err_msg || '';
      }

      throw new Error(response.data?.message || 'Không thể tạo phiếu');
    } catch (error: any) {
      console.error('Insert doc master error:', error);
      throw new Error(error.message || 'Không thể tạo phiếu');
    }
  },

  /**
   * Insert document detail (step 2 of save)
   * API: insertwipdocdetail (POST method)
   */
  insertDocDetail: async (
    noDed: string,
    noOrd712: string,
    updates: Array<{noCol: string; quantity: number}>,
  ): Promise<{status: string; message?: string}> => {
    try {
      const config = await serverConfigService.getConfig();
      if (!config?.serverUrl || !config?.databaseAlias) {
        throw new Error('Server chưa được cấu hình');
      }

      const url = `${config.serverUrl}/${config.databaseAlias}/general/swip/insertwipdocdetail`;

      const response = await axios.post(url, null, {
        params: {
          noDed: noDed,
          noOrd: noOrd712,
          updates: JSON.stringify(updates),
        },
        timeout: 15000,
      });

      if (response.data?.status === true) {
        return {
          status: 'success',
          message: response.data.message || 'Lưu thành công',
        };
      }

      throw new Error(response.data?.message || 'Lưu thất bại');
    } catch (error: any) {
      console.error('Insert doc detail error:', error);
      throw new Error(error.message || 'Không thể lưu chi tiết phiếu');
    }
  },

  /**
   * Save document (combines insertDocMaster + insertDocDetail)
   * This is a convenience method that handles the 2-step save process
   */
  saveDocument: async (params: {
    noOrd: string;
    noOrd712: string;
    noLot: string;
    noDep: string;
    noDepTo: string;
    noPrd: string;
    docType: string;
    details: Array<{noCol: string; quantity: number}>;
  }): Promise<{status: string; message?: string}> => {
    // Step 1: Insert master to get noDed
    const noDed = await documentsApi.insertDocMaster({
      noOrd: params.noOrd,
      noOrd712: params.noOrd712,
      noLot: params.noLot,
      noDep: params.noDep,
      noDepTo: params.noDepTo,
      noPrd: params.noPrd,
      docType: params.docType,
    });

    // Step 2: Insert details with noDed
    return documentsApi.insertDocDetail(noDed, params.noOrd712, params.details);
  },
};
