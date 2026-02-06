import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import {useAuthStore} from '../store/authStore';
import {serverConfigService} from '../services/serverConfig';
import {DatabaseIcon, LogoutIcon, RefreshIcon} from '../components/icons';
import {useDrawer} from './RootNavigator';

const COLORS = {
  blue: '#007AFF',
  blueLight: '#D9EBFF',
  white: '#FFFFFF',
  black: '#000000',
  grayText: '#9e9fa9',
};

interface DrawerContentProps {
  onClose: () => void;
}

const DrawerContent: React.FC<DrawerContentProps> = ({onClose}) => {
  const {user} = useAuthStore();
  const {performLogout} = useDrawer();
  const [dbAlias, setDbAlias] = React.useState<string>('');

  React.useEffect(() => {
    loadDbAlias();
  }, []);

  const loadDbAlias = async () => {
    try {
      const config = await serverConfigService.getConfig();
      if (config?.databaseAlias) {
        setDbAlias(config.databaseAlias);
      }
    } catch (error) {
      console.error('Error loading db alias:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert('Đổi người dùng', 'Bạn có chắc muốn đăng xuất?', [
      {text: 'Hủy', style: 'cancel'},
      {
        text: 'Đồng ý',
        style: 'destructive',
        onPress: () => {
          console.log('[DrawerContent] handleLogout - calling performLogout(false)');
          performLogout(false);
        },
      },
    ]);
  };

  const handleChangeCustomer = () => {
    Alert.alert('Đổi khách hàng', 'Bạn có chắc muốn đổi sang khách hàng khác?', [
      {text: 'Hủy', style: 'cancel'},
      {
        text: 'Đồng ý',
        style: 'destructive',
        onPress: () => {
          console.log('[DrawerContent] handleChangeCustomer - calling performLogout(true)');
          performLogout(true);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Username */}
        <Text style={styles.userName}>
          {user?.userNo || 'User'}
        </Text>

        {/* Database Info */}
        <View style={styles.dbContainer}>
          <DatabaseIcon size={24} color={COLORS.white} />
          <Text style={styles.dbText}>{dbAlias || 'Unknown'}</Text>
        </View>

        {/* Menu Items */}
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <LogoutIcon size={20} color={COLORS.black} />
          <Text style={styles.menuText}>Đổi người dùng</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleChangeCustomer}>
          <RefreshIcon size={20} color={COLORS.black} />
          <Text style={styles.menuText}>Đổi khách hàng</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.appName}>SEWMAN</Text>
        <Text style={styles.appName}>u@WIP</Text>
        <Text style={styles.version}>Phiên bản: 2025.01</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.blueLight,
  },
  scrollContent: {
    paddingTop: 40,
    paddingHorizontal: 16,
    flexGrow: 1,
  },
  userName: {
    fontSize: 28,
    color: COLORS.black,
    marginBottom: 16,
  },
  dbContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.blue,
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  dbText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuText: {
    fontSize: 16,
    color: COLORS.black,
    marginLeft: 12,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.blue,
    lineHeight: 28,
  },
  version: {
    fontSize: 14,
    color: COLORS.grayText,
    marginTop: 4,
  },
});

export default DrawerContent;
