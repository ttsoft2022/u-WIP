import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ImageBackground,
  ImageSourcePropType,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useAuthStore} from '../../auth/store/authStore';
import {useHomeInfo} from '../../auth/hooks/useAuth';
import {ChevronRightIcon} from '../../../components/icons';
import type {DocumentsStackParamList} from '../../../shared/types/navigation.types';

// Button background images
const btnClothes = require('../../../assets/images/btn_clothes.png');
const btnWasher = require('../../../assets/images/btn_washer.png');
const btnIron = require('../../../assets/images/btn_iron.png');

type NavigationProp = NativeStackNavigationProp<DocumentsStackParamList>;

// Colors from Android app
const COLORS = {
  blue: '#007AFF',
  blueLight: '#D9EBFF',
  white: '#FFFFFF',
  black: '#000000',
  grayText: '#9e9fa9',
  grayBackground: '#EEEEEE',
  // Button background - light gray like Android
  btnBackground: '#F5F5F5',
};

// Button configurations matching Android layout
const BUTTON_CONFIG: {
  id: string;
  number: string;
  title: string;
  remainLabel: string;
  bgImage: ImageSourcePropType;
}[] = [
  {
    id: '1',
    number: '1',
    title: 'May giao Giặt',
    remainLabel: 'Tồn May',
    bgImage: btnClothes,
  },
  {
    id: '2',
    number: '2',
    title: 'Giặt giao Là',
    remainLabel: 'Tồn Giặt',
    bgImage: btnWasher,
  },
  {
    id: '3',
    number: '3',
    title: 'Ghi nhận Là',
    remainLabel: 'Tồn May',
    bgImage: btnClothes,
  },
  {
    id: '4',
    number: '4',
    title: 'Là giao HT',
    remainLabel: 'Tồn Là',
    bgImage: btnIron,
  },
];

// Today's items configurations
const TODAY_CONFIG = [
  {id: '1', title: 'Đi giặt hôm nay', docType: '1'},
  {id: '2', title: 'Giặt về hôm nay', docType: '2'},
  {id: '3', title: 'Nhập Là hôm nay', docType: '3'},
  {id: '4', title: 'Nhập HT hôm nay', docType: '4'},
];

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const {user, homeInfo} = useAuthStore();
  const {refetch, isLoading} = useHomeInfo();

  const handleButtonPress = (docType: string) => {
    navigation.navigate('DocList', {docType});
  };

  const handleTodayItemPress = (docType: string) => {
    navigation.navigate('DocsToday', {docType});
  };

  const getRemainQty = (buttonId: string): number => {
    switch (buttonId) {
      case '1':
        return homeInfo?.qty1Remain || 0;
      case '2':
        return homeInfo?.qty2Remain || 0;
      case '3':
        return homeInfo?.qty3Remain || 0;
      case '4':
        return homeInfo?.qty4Remain || 0;
      default:
        return 0;
    }
  };

  const getTodayQty = (docType: string): number => {
    switch (docType) {
      case '1':
        return homeInfo?.qtyInOut01 || 0;
      case '2':
        return homeInfo?.qtyInOut02 || 0;
      case '3':
        return homeInfo?.qtyInOut03 || 0;
      case '4':
        return homeInfo?.qtyInOut04 || 0;
      default:
        return 0;
    }
  };

  // Format number with dots for thousands
  const formatNumber = (num: number): string => {
    return num.toLocaleString('vi-VN');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={refetch}
          colors={[COLORS.blue]}
        />
      }>
      {/* Header - Employee Info */}
      <View style={styles.headerContainer}>
        <Text style={styles.employeeName} numberOfLines={2}>
          {homeInfo?.employeeName || user?.userName || 'User'}
        </Text>
        <Text style={styles.departmentName}>
          {homeInfo?.departmentName || ''}
        </Text>
      </View>

      {/* Main Buttons Grid - Row 1 */}
      <View style={styles.buttonsRow}>
        {BUTTON_CONFIG.slice(0, 2).map(button => (
          <TouchableOpacity
            key={button.id}
            style={styles.mainButtonWrapper}
            onPress={() => handleButtonPress(button.id)}
            activeOpacity={0.7}>
            <ImageBackground
              source={button.bgImage}
              style={styles.mainButton}
              imageStyle={styles.mainButtonImage}>
              <Text style={styles.buttonNumber}>{button.number}</Text>
              <Text style={styles.buttonTitle}>{button.title}</Text>
              <View style={styles.remainRow}>
                <Text style={styles.remainLabel}>{button.remainLabel}</Text>
                <Text style={styles.remainQty}>
                  {formatNumber(getRemainQty(button.id))}
                </Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        ))}
      </View>

      {/* Main Buttons Grid - Row 2 */}
      <View style={styles.buttonsRow}>
        {BUTTON_CONFIG.slice(2, 4).map(button => (
          <TouchableOpacity
            key={button.id}
            style={styles.mainButtonWrapper}
            onPress={() => handleButtonPress(button.id)}
            activeOpacity={0.7}>
            <ImageBackground
              source={button.bgImage}
              style={styles.mainButton}
              imageStyle={styles.mainButtonImage}>
              <Text style={styles.buttonNumber}>{button.number}</Text>
              <Text style={styles.buttonTitle}>{button.title}</Text>
              <View style={styles.remainRow}>
                <Text style={styles.remainLabel}>{button.remainLabel}</Text>
                <Text style={styles.remainQty}>
                  {formatNumber(getRemainQty(button.id))}
                </Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        ))}
      </View>

      {/* Today's Items Section */}
      <View style={styles.todaySection}>
        {TODAY_CONFIG.map(item => (
          <TouchableOpacity
            key={item.id}
            style={styles.todayItem}
            onPress={() => handleTodayItemPress(item.docType)}
            activeOpacity={0.7}>
            <Text style={styles.todayItemLabel}>{item.title}</Text>
            <View style={styles.todayItemRight}>
              <Text style={styles.todayItemQty}>
                {formatNumber(getTodayQty(item.docType))}
              </Text>
              <ChevronRightIcon size={20} color={COLORS.black} />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  contentContainer: {
    padding: 8,
  },
  // Header styles
  headerContainer: {
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  employeeName: {
    fontSize: 22,
    color: COLORS.black,
    textAlign: 'center',
  },
  departmentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'center',
    marginTop: 4,
  },
  // Main buttons styles
  buttonsRow: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  mainButtonWrapper: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
    overflow: 'hidden',
    aspectRatio: 1.2, // Reduce height (was 1 for square)
  },
  mainButton: {
    flex: 1,
    paddingLeft: 16,
    paddingBottom: 16,
    paddingTop: 8,
    paddingRight: 8,
    justifyContent: 'flex-end',
  },
  mainButtonImage: {
    borderRadius: 12,
  },
  buttonNumber: {
    position: 'absolute',
    top: 8,
    left: 16,
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.blue,
  },
  buttonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8,
  },
  remainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  remainLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.grayText,
  },
  remainQty: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.blue,
    marginLeft: 16,
  },
  // Today section styles
  todaySection: {
    marginTop: 16,
  },
  todayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.grayBackground,
    borderRadius: 8,
    paddingVertical: 12,
    paddingLeft: 16,
    paddingRight: 8,
    marginBottom: 8,
  },
  todayItemLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  todayItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  todayItemQty: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.black,
    marginRight: 8,
  },
});

export default HomeScreen;
