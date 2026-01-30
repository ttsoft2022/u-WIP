import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RouteProp} from '@react-navigation/native';
import {useDocList} from '../hooks/useDocuments';
import type {DocumentsStackParamList} from '../../../shared/types/navigation.types';
import type {DocMaster} from '../types/document.types';

type NavigationProp = NativeStackNavigationProp<DocumentsStackParamList, 'DocList'>;
type RouteProps = RouteProp<DocumentsStackParamList, 'DocList'>;

const COLORS = {
  blue: '#007AFF',
  green: '#4CAF50',
  white: '#FFFFFF',
  black: '#000000',
  grayText: '#666666',
  grayLight: '#999999',
  grayBackground: '#f5f5f5',
  grayBorder: '#e0e0e0',
};

const DocListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const {docType} = route.params;

  const [searchText, setSearchText] = useState('');

  const {data: documents, isLoading, refetch} = useDocList({docType});

  // Filter documents based on search text
  const filteredDocuments = useMemo(() => {
    if (!documents) return [];
    if (!searchText.trim()) return documents;

    const search = searchText.toLowerCase();
    return documents.filter(
      doc =>
        doc.NO_LOT?.toLowerCase().includes(search) ||
        doc.NO_ORD?.toLowerCase().includes(search) ||
        doc.NO_STY?.toLowerCase().includes(search) ||
        doc.NAME_PRD?.toLowerCase().includes(search),
    );
  }, [documents, searchText]);

  const handleDocPress = (doc: DocMaster) => {
    navigation.navigate('DocDetail', {
      noLot: doc.NO_LOT,
      noOrd: doc.NO_ORD,
      docType: docType,
    });
  };

  const renderItem = ({item}: {item: DocMaster}) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => handleDocPress(item)}>
      <View style={styles.itemHeader}>
        <Text style={styles.lotNumber}>{item.NO_LOT}</Text>
        <Text style={styles.quantity}>SL: {item.QTY}</Text>
      </View>
      <View style={styles.itemBody}>
        <Text style={styles.orderInfo}>
          Order: {item.NO_ORD} | Style: {item.NO_STY}
        </Text>
        <Text style={styles.departmentInfo}>
          {item.NAME_DEP_FROM} → {item.NAME_DEP_TO}
        </Text>
        <Text style={styles.productInfo}>{item.NAME_PRD}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {isLoading ? 'Đang tải...' : 'Không có chứng từ'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm theo Lot, Order, Style..."
          value={searchText}
          onChangeText={setSearchText}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Document List */}
      {isLoading && !documents ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.blue} />
        </View>
      ) : (
        <FlatList
          data={filteredDocuments}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${item.NO_LOT}-${item.NO_ORD}-${index}`}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} />
          }
          ListEmptyComponent={renderEmpty}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayBackground,
  },
  searchContainer: {
    padding: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayBorder,
  },
  searchInput: {
    backgroundColor: COLORS.grayBackground,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  listContent: {
    padding: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    marginBottom: 12,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  lotNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.blue,
  },
  quantity: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.green,
  },
  itemBody: {
    marginBottom: 4,
  },
  orderInfo: {
    fontSize: 14,
    color: COLORS.black,
    marginBottom: 4,
  },
  departmentInfo: {
    fontSize: 14,
    color: COLORS.grayText,
    marginBottom: 4,
  },
  productInfo: {
    fontSize: 14,
    color: COLORS.grayText,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.grayText,
  },
});

export default DocListScreen;
