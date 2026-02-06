import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import {useAppNavigation, useScreenActions} from '../navigation/RootNavigator';
import {useDocDetail, useSaveDocument} from '../hooks/useDocuments';
import {useAuthStore} from '../store/authStore';
import type {DocDetail} from '../types/document.types';

const COLORS = {
  blue: '#007AFF',
  blueLight: '#D9EBFF',
  white: '#FFFFFF',
  black: '#333333',
  grayText: '#666666',
  grayLight: '#999999',
  grayBackground: '#f5f5f5',
  grayBorder: '#ddd',
};

interface EditableDetail extends DocDetail {
  editedQty: string;
}

const DocDetailScreen: React.FC = () => {
  const {params, goBack} = useAppNavigation();
  const {noLot, noOrd, noOrd712, noSty, nameDepFrom, nameDepTo, noDep, noDepTo, noPrd, namePrd, docType, isEdit, noDed} = params || {};
  const {setSaveAction, setIsSaving} = useScreenActions();

  const {canEditDocuments} = useAuthStore();
  // canEdit = isEdit (screen allows editing) AND canEditDocuments (user has permission)
  // Like Android: isEdit=1 from DocList, isEdit=0 from DocsToday
  const canEdit = isEdit !== false && canEditDocuments();
  // noDed: empty from DocList, actual NO_DED from DocsToday (like Android)
  const {data, isLoading} = useDocDetail(noLot, noOrd712, noDep, docType, noDed || '');
  const saveMutation = useSaveDocument();

  const [editableDetails, setEditableDetails] = useState<EditableDetail[]>([]);

  useEffect(() => {
    if (data?.details) {
      setEditableDetails(
        data.details.map(d => ({
          ...d,
          editedQty: '',
        })),
      );
    }
  }, [data?.details]);

  // Update isSaving state when mutation status changes
  useEffect(() => {
    setIsSaving(saveMutation.isPending);
  }, [saveMutation.isPending, setIsSaving]);

  // Register save action for header button
  const handleSave = useCallback(() => {
    const invalidItems = editableDetails.filter(item => {
      if (!item.editedQty) return false;
      const qty = parseInt(item.editedQty, 10);
      return qty > item.QTY_REMAIN;
    });

    if (invalidItems.length > 0) {
      Alert.alert('Lỗi', 'Số lượng không được vượt quá số lượng còn lại');
      return;
    }

    const details = editableDetails.map(item => ({
      noCol: item.NO_COL,
      quantity: parseInt(item.editedQty, 10) || 0,
    }));

    const hasChanges = details.some(d => d.quantity > 0);
    if (!hasChanges) {
      Alert.alert('Thông báo', 'Chưa có số lượng để lưu');
      return;
    }

    Alert.alert('Xác nhận', 'Lưu phiếu giao nhận?', [
      {text: 'Hủy', style: 'cancel'},
      {
        text: 'Lưu',
        onPress: () => {
          saveMutation.mutate(
            {
              noOrd,
              noOrd712,
              noLot,
              noDep,
              noDepTo,
              noPrd,
              docType,
              details,
            },
            {
              onSuccess: () => {
                Alert.alert('Thành công', 'Đã lưu thành công', [
                  {text: 'OK', onPress: () => goBack()},
                ]);
              },
              onError: error => {
                Alert.alert(
                  'Lỗi',
                  error instanceof Error ? error.message : 'Không thể lưu',
                );
              },
            },
          );
        },
      },
    ]);
  }, [editableDetails, noOrd, noOrd712, noLot, noDep, noDepTo, noPrd, docType, saveMutation, goBack]);

  // Register save action with header when canEdit
  useEffect(() => {
    if (canEdit) {
      setSaveAction(() => handleSave);
    }
    return () => {
      setSaveAction(null);
    };
  }, [canEdit, handleSave, setSaveAction]);

  // Calculate totals
  const totalColors = editableDetails.length;
  const totalQty = editableDetails.reduce((sum, item) => {
    // In view-only mode (canEdit=false), show sum of QTY_IN_OUT (delivered quantities)
    // In edit mode, show sum of editedQty (quantities being entered)
    if (canEdit) {
      const qty = parseInt(item.editedQty, 10) || 0;
      return sum + qty;
    } else {
      return sum + (item.QTY_IN_OUT || 0);
    }
  }, 0);

  const handleQtyChange = (index: number, value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setEditableDetails(prev =>
      prev.map((item, i) =>
        i === index ? {...item, editedQty: numericValue} : item,
      ),
    );
  };


  const renderHeader = () => {
    return (
      <View style={styles.headerCard}>
        {/* Department badges */}
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{nameDepFrom || 'N/A'}</Text>
          </View>
          <View style={styles.arrowContainer}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                d="M9 6l6 6-6 6"
                stroke={COLORS.blue}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{nameDepTo || 'N/A'}</Text>
          </View>
        </View>

        {/* Info rows */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Style</Text>
          <Text style={styles.infoValue}>{noSty}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Lô</Text>
          <Text style={styles.infoValue}>{noLot}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>PO</Text>
          <Text style={styles.infoValue}>{noOrd}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>SP</Text>
          <Text style={styles.infoValue}>{namePrd || ''}</Text>
        </View>
      </View>
    );
  };

  const renderItem = ({item, index}: {item: EditableDetail; index: number}) => {
    return (
      <View style={styles.detailItem}>
        <Text style={styles.colorName}>{item.NAME_COL}</Text>
        <Text style={styles.remainQty}>{item.QTY_REMAIN}</Text>
        {canEdit ? (
          <TextInput
            style={styles.qtyInput}
            value={item.editedQty}
            onChangeText={value => handleQtyChange(index, value)}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={COLORS.grayLight}
            maxLength={6}
          />
        ) : (
          <Text style={styles.qtyReadOnly}>{item.QTY_IN_OUT}</Text>
        )}
      </View>
    );
  };

  const renderFooter = () => (
    <View style={styles.footerCard}>
      <Text style={styles.footerLabel}>Tổng cộng</Text>
      <View style={styles.footerRow}>
        <Text style={styles.footerColorCount}>{totalColors} màu</Text>
        <Text style={styles.footerTotalQty}>{totalQty}</Text>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.blue} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {renderHeader()}

      <Text style={styles.sectionTitle}>Chi tiết giao theo Màu</Text>

      <FlatList
        data={editableDetails}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.NO_SIZ}-${item.NO_COL}-${index}`}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {renderFooter()}
    </KeyboardAvoidingView>
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
  // Header card
  headerCard: {
    backgroundColor: COLORS.blueLight,
    margin: 12,
    padding: 16,
    borderRadius: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  badge: {
    backgroundColor: COLORS.blue,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  arrowContainer: {
    marginHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  infoLabel: {
    width: 50,
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  infoValue: {
    flex: 1,
    fontSize: 12,
    color: COLORS.black,
  },
  // Section title
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    marginHorizontal: 12,
    marginBottom: 8,
  },
  // List
  listContent: {
    marginHorizontal: 12,
    backgroundColor: COLORS.grayBackground,
    borderRadius: 12,
    padding: 12,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.grayBorder,
    marginVertical: 8,
  },
  // Detail item
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  colorName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
  },
  remainQty: {
    fontSize: 16,
    color: COLORS.grayText,
    marginRight: 16,
    minWidth: 40,
    textAlign: 'right',
  },
  qtyInput: {
    width: 60,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayBorder,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
    paddingVertical: 4,
    color: COLORS.black,
  },
  qtyReadOnly: {
    width: 60,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
    paddingVertical: 4,
    color: COLORS.black,
  },
  // Footer
  footerCard: {
    backgroundColor: COLORS.blueLight,
    margin: 12,
    padding: 16,
    borderRadius: 12,
  },
  footerLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerColorCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.blue,
  },
  footerTotalQty: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
});

export default DocDetailScreen;
