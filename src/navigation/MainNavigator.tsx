import React, {createContext, useContext, useState, useCallback} from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
  Animated,
} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import type {MainStackParamList} from '../shared/types/navigation.types';
import HomeScreen from '../features/home/screens/HomeScreen';
import DocListScreen from '../features/documents/screens/DocListScreen';
import DocDetailScreen from '../features/documents/screens/DocDetailScreen';
import DocsTodayScreen from '../features/documents/screens/DocsTodayScreen';
import DrawerContent from './DrawerContent';

const Stack = createNativeStackNavigator<MainStackParamList>();
const {width: SCREEN_WIDTH} = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.7;

// Drawer Context
interface DrawerContextType {
  openDrawer: () => void;
  closeDrawer: () => void;
}

const DrawerContext = createContext<DrawerContextType>({
  openDrawer: () => {},
  closeDrawer: () => {},
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

// Menu button component
const MenuButton: React.FC<{onPress: () => void}> = ({onPress}) => (
  <TouchableOpacity onPress={onPress} style={styles.menuButton}>
    <MenuBurgerIcon />
  </TouchableOpacity>
);

// Home Screen with drawer button
const HomeScreenWithDrawer: React.FC = () => {
  return <HomeScreen />;
};

// Main Stack Navigator
const MainStackNavigator: React.FC = () => {
  const {openDrawer} = useDrawer();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTintColor: '#000000',
        headerTitleAlign: 'center',
        headerShadowVisible: true,
        contentStyle: {
          backgroundColor: '#FFFFFF',
        },
      }}>
      <Stack.Screen
        name="Home"
        component={HomeScreenWithDrawer}
        options={{
          headerTitle: 'Sewman u@WIP',
          headerLeft: () => <MenuButton onPress={openDrawer} />,
        }}
      />
      <Stack.Screen
        name="DocList"
        component={DocListScreen}
        options={{
          headerTitle: 'Danh sách phiếu',
        }}
      />
      <Stack.Screen
        name="DocDetail"
        component={DocDetailScreen}
        options={{
          headerTitle: 'Chi tiết phiếu',
        }}
      />
      <Stack.Screen
        name="DocsToday"
        component={DocsTodayScreen}
        options={{
          headerTitle: 'Hôm nay',
        }}
      />
    </Stack.Navigator>
  );
};

// Main Navigator with Modal Drawer
const MainNavigator: React.FC = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(-DRAWER_WIDTH)).current;

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

  return (
    <DrawerContext.Provider value={{openDrawer, closeDrawer}}>
      <View style={styles.container}>
        <MainStackNavigator />

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
      </View>
    </DrawerContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  menuButton: {
    padding: 8,
    marginLeft: 8,
  },
  menuLine: {
    width: 20,
    height: 2,
    backgroundColor: '#000000',
    marginVertical: 2,
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

export default MainNavigator;
