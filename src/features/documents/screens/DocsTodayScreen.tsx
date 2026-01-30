import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import {useDocsToday} from '../hooks/useDocuments';
import type {DocumentsStackParamList} from '../../../shared/types/navigation.types';
import type {DocMaster} from '../types/document.types';

type RouteProps = RouteProp<DocumentsStackParamList, 'DocsToday'>;

const COLORS = {
  blue: '#007AFF',
  purple: '#673AB7',
  green: '#4CAF50',
  white: '#FFFFFF',
  black: '#333333',
  grayText: '#666666',
  grayBackground: '#f5f5f5',
};

const DocsTodayScreen: React.FC = () => {
  const route = useRoute<RouteProps>();
  const {docType} = route.params;

  const {data: documents, isLoading, refetch} = useDocsToday(parseInt(docType, 10));

  const renderItem = ({item}: {item: DocMaster}) => (
    <View style={styles.itemContainer}>
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
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {isLoading ? 'Đang tải...' : 'Không có chứng từ hôm nay'}
      </Text>
    </View>
  );

  if (isLoading && !documents) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.blue} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={documents}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.NO_LOT}-${item.NO_ORD}-${index}`}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        ListEmptyComponent={renderEmpty}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayBackground,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 12,
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
    color: COLORS.purple,
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

export default DocsTodayScreen;
