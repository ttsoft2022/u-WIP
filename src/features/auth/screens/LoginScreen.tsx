import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useLogin} from '../hooks/useAuth';
import {useAuthStore} from '../store/authStore';
import {
  UserIcon,
  PasswordIcon,
  DatabaseIcon,
  CheckIcon,
} from '../../../components/icons';
import {serverConfigService} from '../../../services/serverConfig';

// Colors from Android app
const COLORS = {
  blue: '#007AFF',
  blueLight: '#D9EBFF',
  white: '#FFFFFF',
  black: '#000000',
  grayLight: '#808080',
  grayText: '#9e9fa9',
};

const AUTO_LOGIN_KEY = 'uwip_auto_login';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({onLoginSuccess}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasConfig, setHasConfig] = useState(false);
  const [isAutoLogging, setIsAutoLogging] = useState(true);

  const {setDatabaseList} = useAuthStore();
  const loginMutation = useLogin();

  // Check for saved config and auto-login on mount
  useEffect(() => {
    checkSavedConfigAndAutoLogin();
  }, []);

  const checkSavedConfigAndAutoLogin = async () => {
    try {
      const config = await serverConfigService.getConfig();
      if (config?.databaseAlias) {
        setCustomerId(config.databaseAlias);
        setHasConfig(true);

        // Update database list with saved config
        setDatabaseList([
          {
            id: 1,
            serverIP: config.serverUrl.replace(/^https?:\/\//, ''),
            apiName: 'api',
            dbIP: config.serverUrl.replace(/^https?:\/\//, ''),
            dbName: config.databaseName,
            dbAlias: config.databaseAlias,
            dbUsername: 'sa',
            dbPassword: '',
            isVisible: true,
          },
        ]);

        // Check for saved credentials and auto-login
        const savedCredentials = await AsyncStorage.getItem(AUTO_LOGIN_KEY);
        if (savedCredentials) {
          const {username: savedUsername, password: savedPassword} =
            JSON.parse(savedCredentials);
          if (savedUsername && savedPassword) {
            try {
              await loginMutation.mutateAsync({
                username: savedUsername,
                password: savedPassword,
              });
              // Auto-login successful, navigate to Home
              onLoginSuccess();
              return;
            } catch (error) {
              // Auto-login failed, clear saved credentials
              await AsyncStorage.removeItem(AUTO_LOGIN_KEY);
              console.log('Auto-login failed, showing login screen');
            }
          }
        }
      }
      setIsAutoLogging(false);
    } catch (error) {
      console.error('Error checking saved config:', error);
      setIsAutoLogging(false);
    }
  };

  const handleVerifyCustomer = async () => {
    if (!customerId.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập mã khách hàng');
      return;
    }

    try {
      setIsVerifying(true);
      const newConfig = await serverConfigService.fetchClientConfig(
        customerId.trim(),
      );
      await serverConfigService.saveConfig(newConfig);
      setCustomerId(newConfig.databaseAlias);
      setHasConfig(true);

      // Update database list with new config
      setDatabaseList([
        {
          id: 1,
          serverIP: newConfig.serverUrl.replace(/^https?:\/\//, ''),
          apiName: 'api',
          dbIP: newConfig.serverUrl.replace(/^https?:\/\//, ''),
          dbName: newConfig.databaseName,
          dbAlias: newConfig.databaseAlias,
          dbUsername: 'sa',
          dbPassword: '',
          isVisible: true,
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        'Lỗi',
        error.message || 'Không tìm thấy thông tin khách hàng',
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleChangeCustomer = async () => {
    Alert.alert('Đổi khách hàng', 'Bạn có chắc muốn đổi sang khách hàng khác?', [
      {text: 'Hủy', style: 'cancel'},
      {
        text: 'Đồng ý',
        style: 'destructive',
        onPress: async () => {
          await serverConfigService.clearConfig();
          await AsyncStorage.removeItem('uwip_auto_login');
          setCustomerId('');
          setUsername('');
          setPassword('');
          setHasConfig(false);
        },
      },
    ]);
  };

  const handleLogin = async () => {
    if (!hasConfig) {
      Alert.alert('Thông báo', 'Vui lòng kiểm tra mã khách hàng trước');
      return;
    }
    if (!username.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập tên người dùng');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập mật khẩu');
      return;
    }

    const config = await serverConfigService.getConfig();
    if (!config) {
      Alert.alert('Lỗi', 'Không tìm thấy cấu hình server');
      return;
    }

    try {
      await loginMutation.mutateAsync({
        username: username.trim(),
        password: password.trim(),
        database: {
          id: 1,
          serverIP: config.serverUrl.replace(/^https?:\/\//, ''),
          apiName: 'api',
          dbIP: config.serverUrl.replace(/^https?:\/\//, ''),
          dbName: config.databaseName,
          dbAlias: config.databaseAlias,
          dbUsername: 'sa',
          dbPassword: '',
          isVisible: true,
        },
      });

      // Save credentials for auto-login
      await AsyncStorage.setItem(
        AUTO_LOGIN_KEY,
        JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      );

      // Navigate to Home
      onLoginSuccess();
    } catch (error) {
      Alert.alert(
        'Đăng nhập thất bại',
        error instanceof Error
          ? error.message
          : 'Tên đăng nhập hoặc mật khẩu không đúng!',
      );
    }
  };

  // Show loading screen while checking config
  if (isAutoLogging) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingTitle}>SEWMAN</Text>
        <Text style={styles.loadingTitle}>u@WIP</Text>
        <ActivityIndicator
          size="large"
          color={COLORS.blue}
          style={styles.loadingSpinner}
        />
        <Text style={styles.loadingText}>Đang kiểm tra...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.formContainer}>
          {/* Logo / Title - Canh trái */}
          <View style={styles.titleContainer}>
            <Text style={styles.logoText}>SEWMAN</Text>
            <Text style={styles.logoText}>u@WIP</Text>
          </View>

          {/* Customer ID Input */}
          <View style={styles.customerInputRow}>
            <View
              style={[
                styles.inputContainer,
                styles.customerInput,
                hasConfig && styles.inputDisabled,
              ]}>
              <View style={styles.iconWrapper}>
                <DatabaseIcon size={20} color={COLORS.blue} />
              </View>
              <TextInput
                style={styles.input}
                value={customerId}
                onChangeText={setCustomerId}
                placeholder="Mã khách hàng"
                placeholderTextColor={COLORS.grayLight}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!hasConfig && !isVerifying}
              />
            </View>
            {hasConfig ? (
              <TouchableOpacity
                style={styles.changeButton}
                onPress={handleChangeCustomer}
                disabled={loginMutation.isPending}>
                <Text style={styles.changeButtonText}>Đổi</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.verifyButton,
                  customerId.trim()
                    ? styles.verifyButtonActive
                    : styles.verifyButtonInactive,
                ]}
                onPress={handleVerifyCustomer}
                disabled={isVerifying || !customerId.trim()}>
                {isVerifying ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <CheckIcon
                    size={20}
                    color={customerId.trim() ? COLORS.white : COLORS.grayLight}
                  />
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Username Input */}
          <View
            style={[styles.inputContainer, !hasConfig && styles.inputDisabled]}>
            <View style={styles.iconWrapper}>
              <UserIcon size={20} color={COLORS.blue} />
            </View>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Tên người dùng"
              placeholderTextColor={COLORS.grayLight}
              autoCapitalize="none"
              autoCorrect={false}
              editable={hasConfig && !loginMutation.isPending}
            />
          </View>

          {/* Password Input */}
          <View
            style={[styles.inputContainer, !hasConfig && styles.inputDisabled]}>
            <View style={styles.iconWrapper}>
              <PasswordIcon size={20} color={COLORS.blue} />
            </View>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Mật khẩu"
              placeholderTextColor={COLORS.grayLight}
              secureTextEntry
              editable={hasConfig && !loginMutation.isPending}
            />
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              (loginMutation.isPending || !hasConfig) &&
                styles.loginButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={loginMutation.isPending || !hasConfig}>
            {loginMutation.isPending ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.loginButtonText}>Đăng nhập</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  loadingTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.blue,
    lineHeight: 56,
  },
  loadingSpinner: {
    marginTop: 24,
  },
  loadingText: {
    marginTop: 16,
    color: COLORS.grayLight,
    fontSize: 16,
  },
  formContainer: {
    width: '100%',
  },
  titleContainer: {
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.blue,
    lineHeight: 56,
  },
  customerInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  customerInput: {
    flex: 1,
    marginTop: 0,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.blueLight,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
  },
  inputDisabled: {
    opacity: 0.5,
  },
  iconWrapper: {
    marginRight: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.black,
    padding: 0,
  },
  verifyButton: {
    marginLeft: 8,
    padding: 14,
    borderRadius: 8,
  },
  verifyButtonActive: {
    backgroundColor: COLORS.blue,
  },
  verifyButtonInactive: {
    backgroundColor: COLORS.blueLight,
  },
  changeButton: {
    marginLeft: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: COLORS.blueLight,
  },
  changeButtonText: {
    color: COLORS.blue,
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: COLORS.blue,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 32,
  },
  loginButtonDisabled: {
    opacity: 0.5,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 16,
  },
});

export default LoginScreen;
