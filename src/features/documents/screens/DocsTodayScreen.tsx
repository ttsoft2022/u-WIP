import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {useAppNavigation} from '../../../navigation/RootNavigator';
import {useDocsToday} from '../hooks/useDocuments';
import type {DocMaster} from '../types/document.types';

const COLORS = {
  blue: '#007AFF',
  white: '#FFFFFF',
  black: '#000000',
  grayText: '#666666',
  grayBackground: '#EEEEEE',
  grayItemBg: '#F5F5F5',
};

const DocsTodayScreen: React.FC = () => {
  const {navigate, params} = useAppNavigation();
  const docType = params?.docType || '1';

  const {data: documents, isLoading, refetch} = useDocsToday(parseInt(docType, 10));

  // Format number with dots for thousands
  const formatNumber = (num: number | undefined): string => {
    if (num === undefined || num === null) return '0';
    return num.toLocaleString('vi-VN');
  };

  // Navigate to DocDetail with isEdit=false (view-only mode, like Android)
  // Pass noDed (NO_DED) for existing documents from today's list
  const handleDocPress = (doc: DocMaster) => {
    navigate('DocDetail', {
      noLot: doc.NO_LOT,
      noOrd: doc.NO_ORD,
      noOrd712: doc.NO_ORD_712,
      noSty: doc.NO_STY,
      nameDepFrom: doc.NAME_DEP_FROM,
      nameDepTo: doc.NAME_DEP_TO,
      noDep: doc.NO_DEP_FROM,
      noDepTo: doc.NO_DEP_TO,
      noPrd: doc.NO_PRD,
      namePrd: doc.NAME_PRD,
      docType: docType,
      isEdit: false, // View-only mode for today's documents
      noDed: doc.NO_DED || '', // Pass actual NO_DED for existing documents
    });
  };

  const renderItem = ({item}: {item: DocMaster}) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => handleDocPress(item)}>
      {/* Department Badge */}
      <View style={styles.badgeContainer}>
        <Text style={styles.badgeText}>{item.NAME_DEP_FROM || 'N/A'}</Text>
      </View>

      {/* Detail Rows */}
      <View style={styles.detailsContainer}>
        {/* Style Row */}
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Style</Text>
          <Text style={styles.detailValueBold}>{item.NO_STY || ''}</Text>
        </View>

        {/* Lot Row */}
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Lô</Text>
          <Text style={styles.detailValue}>{item.NO_LOT || ''}</Text>
        </View>

        {/* PO Row */}
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>PO</Text>
          <Text style={styles.detailValue}>{item.NO_ORD || ''}</Text>
        </View>

        {/* SP Row */}
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>SP</Text>
          <Text style={styles.detailValue}>{item.NAME_PRD || ''}</Text>
        </View>
      </View>

      {/* Quantity at bottom right */}
      <Text style={styles.quantityText}>{formatNumber(item.QTY)}</Text>
    </TouchableOpacity>
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
    backgroundColor: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 8,
  },
  itemContainer: {
    backgroundColor: COLORS.grayItemBg,
    borderRadius: 8,
    marginBottom: 8,
    padding: 16,
    position: 'relative',
  },
  badgeContainer: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.blue,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 12,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  detailsContainer: {
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    width: 80,
    fontSize: 15,
    color: COLORS.black,
    fontWeight: 'bold',
  },
  detailValue: {
    flex: 1,
    fontSize: 15,
    color: COLORS.black,
  },
  detailValueBold: {
    flex: 1,
    fontSize: 15,
    color: COLORS.black,
    fontWeight: 'bold',
  },
  quantityText: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
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
