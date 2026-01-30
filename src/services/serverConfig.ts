// Server Configuration Service for Multi-Client Support
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const STORAGE_KEY = 'uwip_server_config';
const MASTER_API_URL = 'http://sg.ketoan1a.com:8081/SewmanCommonApi/general/getconnectioninfo';

export interface ServerConfig {
  customerId: string;     // Mã khách hàng (VD: "sewman_thygesen")
  serverUrl: string;      // Server URL với protocol (VD: "http://md1.sewman.vn:8081")
  databaseName: string;   // Tên database (VD: "sewman_thygesen")
  databaseAlias: string;  // Alias dùng trong URL path (VD: "sewman_thygesen")
}

// Memory cache for performance
let cachedConfig: ServerConfig | null = null;

export const serverConfigService = {
  // Get current config from cache or AsyncStorage
  getConfig: async (): Promise<ServerConfig | null> => {
    if (cachedConfig) {
      return cachedConfig;
    }

    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        cachedConfig = JSON.parse(stored);
        return cachedConfig;
      }
      return null;
    } catch (error) {
      console.error('Error reading server config:', error);
      return null;
    }
  },

  // Save config to AsyncStorage and cache
  saveConfig: async (config: ServerConfig): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      cachedConfig = config;
    } catch (error) {
      console.error('Error saving server config:', error);
      throw error;
    }
  },

  // Check if server is configured
  isConfigured: async (): Promise<boolean> => {
    const config = await serverConfigService.getConfig();
    return !!(config?.serverUrl && config?.databaseAlias);
  },

  // Clear config (when switching clients)
  clearConfig: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      cachedConfig = null;
    } catch (error) {
      console.error('Error clearing server config:', error);
    }
  },

  // Clear memory cache only
  clearCache: (): void => {
    cachedConfig = null;
  },

  // Fetch client config from Master API
  fetchClientConfig: async (customerId: string): Promise<ServerConfig> => {
    try {
      const response = await axios.get(MASTER_API_URL, {
        params: {customerID: customerId},
        timeout: 10000,
      });

      const data = response.data;

      if (!data.status || !data.list || data.list.length === 0) {
        throw new Error(data.message || 'Không tìm thấy thông tin khách hàng');
      }

      const clientInfo = data.list[0];

      // Validate required fields
      if (!clientInfo.SERVER_IP || !clientInfo.DB_ALIAS) {
        throw new Error('Thông tin khách hàng không hợp lệ');
      }

      // Build server URL with http:// prefix if not present
      let serverUrl = clientInfo.SERVER_IP;
      if (!serverUrl.startsWith('http://') && !serverUrl.startsWith('https://')) {
        serverUrl = `http://${serverUrl}`;
      }

      const config: ServerConfig = {
        customerId: clientInfo.ID_ADI || customerId,
        serverUrl: serverUrl,
        databaseName: clientInfo.DB_NAME || clientInfo.DB_ALIAS,
        databaseAlias: clientInfo.DB_ALIAS,
      };

      return config;
    } catch (error: any) {
      console.error('Error fetching client config:', error);
      if (error.code === 'ECONNABORTED') {
        throw new Error('Kết nối quá thời gian. Vui lòng thử lại.');
      }
      throw new Error(error.message || 'Không thể kết nối tới server');
    }
  },

  // Get server URL (for API calls)
  getServerUrl: async (): Promise<string> => {
    const config = await serverConfigService.getConfig();
    if (!config?.serverUrl) {
      throw new Error('Server chưa được cấu hình');
    }
    return config.serverUrl;
  },

  // Get database alias (for API URL paths)
  getDatabaseAlias: async (): Promise<string> => {
    const config = await serverConfigService.getConfig();
    if (!config?.databaseAlias) {
      throw new Error('Database chưa được cấu hình');
    }
    return config.databaseAlias;
  },
};

export default serverConfigService;
