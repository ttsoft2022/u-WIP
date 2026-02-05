import React, {createContext, useContext, useState, useCallback, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
  Animated,
  BackHandler,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAuthStore} from '../features/auth/store/authStore';
import {serverConfigService} from '../services/serverConfig';
import LoginScreen from '../features/auth/screens/LoginScreen';
import HomeScreen from '../features/home/screens/HomeScreen';
import DocListScreen from '../features/documents/screens/DocListScreen';
import DocDetailScreen from '../features/documents/screens/DocDetailScreen';
import DocsTodayScreen from '../features/documents/screens/DocsTodayScreen';
import DrawerContent from './DrawerContent';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.7;

// Screen types
type Screen = 'Login' | 'Home' | 'DocList' | 'DocDetail' | 'DocsToday';

// Screen Actions Context - for screens to communicate with header
interface ScreenActionsContextType {
  setSaveAction: (action: (() => void) | null) => void;
  saveAction: (() => void) | null;
  setIsSaving: (saving: boolean) => void;
  isSaving: boolean;
}

const ScreenActionsContext = createContext<ScreenActionsContextType>({
  setSaveAction: () => {},
  saveAction: null,
  setIsSaving: () => {},
  isSaving: false,
});

export const useScreenActions = () => useContext(ScreenActionsContext);

interface NavigationState {
  currentScreen: Screen;
  params?: any;
  history: Array<{screen: Screen; params?: any}>;
}

// Navigation Context
interface NavigationContextType {
  navigate: (screen: Screen, params?: any) => void;
  goBack: () => void;
  reset: (screen: Screen) => void;
  params: any;
}

const NavigationContext = createContext<NavigationContextType>({
  navigate: () => {},
  goBack: () => {},
  reset: () => {},
  params: undefined,
});

export const useAppNavigation = () => useContext(NavigationContext);

// Drawer Context
interface DrawerContextType {
  openDrawer: () => void;
  closeDrawer: () => void;
  performLogout: (clearConfig: boolean) => void;
}

const DrawerContext = createContext<DrawerContextType>({
  openDrawer: () => {},
  closeDrawer: () => {},
  performLogout: () => {},
});

export const useDrawer = () => useContext(DrawerContext);

// Simple menu burger icon
const MenuBurgerIcon: React.FC = () => (
  <View>
    <View style={styles.menuLine} />
    <View style={styles.menuLine} />
    <View style={styles.menuLine} />
  </View>
);

// Header component
const Header: React.FC<{
  title: string;
  showMenu?: boolean;
  showBack?: boolean;
  onMenuPress?: () => void;
  onBackPress?: () => void;
  rightText?: string;
  onRightPress?: () => void;
  rightDisabled?: boolean;
}> = ({title, showMenu, showBack, onMenuPress, onBackPress, rightText, onRightPress, rightDisabled}) => (
  <View style={styles.header}>
    <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
    <View style={styles.headerLeft}>
      {showMenu && (
        <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
          <MenuBurgerIcon />
        </TouchableOpacity>
      )}
      {showBack && (
        <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
          <View style={styles.backArrow} />
        </TouchableOpacity>
      )}
    </View>
    <View style={styles.headerCenter}>
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
    <View style={styles.headerRight}>
      {rightText && onRightPress && (
        <TouchableOpacity
          onPress={onRightPress}
          disabled={rightDisabled}
          style={styles.headerRightButton}>
          <Text style={[styles.headerRightText, rightDisabled && styles.headerRightTextDisabled]}>
            {rightText}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);

// Root Navigator with State-based Navigation (like u@Teams)
const RootNavigator: React.FC = () => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const canEditDocuments = useAuthStore(state => state.canEditDocuments);

  // Navigation state
  const [navState, setNavState] = useState<NavigationState>({
    currentScreen: isAuthenticated ? 'Home' : 'Login',
    params: undefined,
    history: [],
  });

  // Screen actions state (for header save button)
  const [saveAction, setSaveAction] = useState<(() => void) | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Drawer state
  const [drawerVisible, setDrawerVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  // Keep navState ref for back handler
  const navStateRef = useRef(navState);
  React.useEffect(() => {
    navStateRef.current = navState;
  }, [navState]);

  // Navigation functions
  const navigate = useCallback((screen: Screen, params?: any) => {
    setNavState(prev => ({
      currentScreen: screen,
      params,
      history: [...prev.history, {screen: prev.currentScreen, params: prev.params}],
    }));
  }, []);

  const goBack = useCallback(() => {
    setNavState(prev => {
      if (prev.history.length > 0) {
        const previous = prev.history[prev.history.length - 1];
        return {
          currentScreen: previous.screen,
          params: previous.params,
          history: prev.history.slice(0, -1),
        };
      }
      return prev;
    });
  }, []);

  const reset = useCallback((screen: Screen) => {
    setNavState({
      currentScreen: screen,
      params: undefined,
      history: [],
    });
  }, []);

  // Handle hardware back button
  React.useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      const current = navStateRef.current;

      // Close drawer if open
      if (drawerVisible) {
        closeDrawer();
        return true;
      }

      // Go back if there's history
      if (current.history.length > 0) {
        goBack();
        return true;
      }

      // Let default behavior happen (exit app) only on Login/Home
      return false;
    });

    return () => backHandler.remove();
  }, [drawerVisible, goBack]);

  // Drawer functions
  const openDrawer = useCallback(() => {
    setDrawerVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  const closeDrawer = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: -DRAWER_WIDTH,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setDrawerVisible(false);
    });
  }, [slideAnim]);

  // Logout function - exactly like u@Teams (NO Zustand logout call)
  const performLogout = useCallback(async (clearConfig: boolean) => {
    try {
      // Close drawer first
      Animated.timing(slideAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setDrawerVisible(false);
      });

      // Clear data - like u@Teams, only use AsyncStorage
      if (clearConfig) {
        await serverConfigService.clearConfig();
      }
      await AsyncStorage.removeItem('uwip_auto_login');
      console.log('Cleared credentials on logout');

      // Navigate to Login - simple state change (NO Zustand logout!)
      setNavState({
        currentScreen: 'Login',
        params: undefined,
        history: [],
      });
    } catch (error) {
      console.error('Error during logout:', error);
      // Navigate to Login anyway
      setNavState({
        currentScreen: 'Login',
        params: undefined,
        history: [],
      });
    }
  }, [slideAnim]);

  // Render current screen
  // Helper function to get DocList title based on docType
  const getDocListTitle = (docType: string): string => {
    switch (docType) {
      case '1': return '1.MAY GIAO GIẶT';
      case '2': return '2.GIẶT GIAO LÀ';
      case '3': return '3.GHI NHẬN LÀ';
      case '4': return '4.GIAO HOÀN THIỆN';
      default: return 'DANH SÁCH PHIẾU';
    }
  };

  // Helper function to get DocsToday title based on docType
  const getDocsTodayTitle = (docType: string): string => {
    switch (docType) {
      case '1': return 'Đi giặt hôm nay';
      case '2': return 'Giặt về hôm nay';
      case '3': return 'Nhập Là hôm nay';
      case '4': return 'Nhập HT hôm nay';
      default: return 'Hôm nay';
    }
  };

  const renderScreen = () => {
    switch (navState.currentScreen) {
      case 'Login':
        return (
          <LoginScreen
            onLoginSuccess={() => reset('Home')}
          />
        );

      case 'Home':
        return (
          <View style={styles.screenContainer}>
            <Header
              title="Sewman u@WIP"
              showMenu
              onMenuPress={openDrawer}
            />
            <HomeScreen />
          </View>
        );

      case 'DocList':
        return (
          <View style={styles.screenContainer}>
            <Header
              title={getDocListTitle(navState.params?.docType)}
              showBack
              onBackPress={goBack}
            />
            <DocListScreen />
          </View>
        );

      case 'DocDetail':
        // canEdit = isEdit (screen allows editing) AND canEditDocuments (user has permission)
        const isEditMode = navState.params?.isEdit !== false;
        const canEdit = isEditMode && canEditDocuments();
        return (
          <View style={styles.screenContainer}>
            <Header
              title="PHIẾU GIAO NHẬN"
              showBack
              onBackPress={goBack}
              rightText={canEdit ? 'Lưu' : undefined}
              onRightPress={canEdit && saveAction ? saveAction : undefined}
              rightDisabled={isSaving}
            />
            <DocDetailScreen />
          </View>
        );

      case 'DocsToday':
        return (
          <View style={styles.screenContainer}>
            <Header
              title={getDocsTodayTitle(navState.params?.docType)}
              showBack
              onBackPress={goBack}
            />
            <DocsTodayScreen />
          </View>
        );

      default:
        return <LoginScreen onLoginSuccess={() => reset('Home')} />;
    }
  };

  return (
    <NavigationContext.Provider value={{navigate, goBack, reset, params: navState.params}}>
      <DrawerContext.Provider value={{openDrawer, closeDrawer, performLogout}}>
        <ScreenActionsContext.Provider value={{setSaveAction, saveAction, setIsSaving, isSaving}}>
          <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            {renderScreen()}

          {/* Modal Drawer */}
          <Modal
            visible={drawerVisible}
            transparent
            animationType="none"
            onRequestClose={closeDrawer}>
            <View style={styles.modalContainer}>
              {/* Backdrop */}
              <TouchableWithoutFeedback onPress={closeDrawer}>
                <View style={styles.backdrop} />
              </TouchableWithoutFeedback>

              {/* Drawer Content */}
              <Animated.View
                style={[
                  styles.drawerContainer,
                  {transform: [{translateX: slideAnim}]},
                ]}>
                <DrawerContent onClose={closeDrawer} />
              </Animated.View>
            </View>
            </Modal>
          </SafeAreaView>
        </ScreenActionsContext.Provider>
      </DrawerContext.Provider>
    </NavigationContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  screenContainer: {
    flex: 1,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    // Shadow for iOS
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    // Shadow for Android
    elevation: 4,
  },
  headerLeft: {
    width: 56,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  headerRight: {
    width: 56,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  headerRightButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  headerRightText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  headerRightTextDisabled: {
    color: '#999999',
  },
  menuButton: {
    padding: 8,
  },
  menuLine: {
    width: 20,
    height: 2,
    backgroundColor: '#000000',
    marginVertical: 2,
  },
  backButton: {
    padding: 8,
  },
  backArrow: {
    width: 12,
    height: 12,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#000000',
    transform: [{rotate: '45deg'}],
  },
  modalContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawerContainer: {
    width: DRAWER_WIDTH,
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
  },
});

export default RootNavigator;
