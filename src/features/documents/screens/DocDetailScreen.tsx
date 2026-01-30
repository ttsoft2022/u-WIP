import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import {useDocDetail, useUpdateDocDetail} from '../hooks/useDocuments';
import {useAuthStore} from '../../auth/store/authStore';
import type {DocumentsStackParamList} from '../../../shared/types/navigation.types';
import type {DocDetail} from '../types/document.types';

type RouteProps = RouteProp<DocumentsStackParamList, 'DocDetail'>;

const COLORS = {
  blue: '#007AFF',
  green: '#4CAF50',
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
  const route = useRoute<RouteProps>();
  const navigation = useNavigation();
  const {noLot, noOrd, docType} = route.params;

  const {canEditDocuments} = useAuthStore();
  const {data, isLoading} = useDocDetail(noLot, noOrd, docType);
  const updateMutation = useUpdateDocDetail();

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

  const handleQtyChange = (index: number, value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, '');

    setEditableDetails(prev =>
      prev.map((item, i) =>
        i === index ? {...item, editedQty: numericValue} : item,
      ),
    );
  };

  const validateAndSave = () => {
    // Validate quantities - check against remaining (QTY - QTY_DONE)
    const invalidItems = editableDetails.filter(item => {
      if (!item.editedQty) return false;
      const qty = parseInt(item.editedQty, 10);
      const remaining = item.QTY - item.QTY_DONE;
      return qty > remaining;
    });

    if (invalidItems.length > 0) {
      Alert.alert(
        'Lỗi',
        'Số lượng không được vượt quá số lượng còn lại',
      );
      return;
    }

    // Get items with changes
    const changedItems = editableDetails
      .filter(item => item.editedQty && parseInt(item.editedQty, 10) > 0)
      .map(item => ({
        noSize: item.NO_SIZE,
        noColor: item.NO_COLOR,
        qty: parseInt(item.editedQty, 10),
      }));

    if (changedItems.length === 0) {
      Alert.alert('Thông báo', 'Chưa có thay đổi để lưu');
      return;
    }

    Alert.alert(
      'Xác nhận',
      `Lưu ${changedItems.length} dòng?`,
      [
        {text: 'Hủy', style: 'cancel'},
        {
          text: 'Lưu',
          onPress: () => {
            updateMutation.mutate(
              {noLot, noOrd, docType, details: changedItems},
              {
                onSuccess: () => {
                  Alert.alert('Thành công', 'Đã lưu thành công', [
                    {text: 'OK', onPress: () => navigation.goBack()},
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
      ],
    );
  };

  const renderHeader = () => {
    if (!data?.master) return null;
    const {master} = data;

    return (
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          <Text style={styles.headerLabel}>Lot:</Text>
          <Text style={styles.headerValue}>{master.NO_LOT}</Text>
        </View>
        <View style={styles.headerRow}>
          <Text style={styles.headerLabel}>Order:</Text>
          <Text style={styles.headerValue}>{master.NO_ORD}</Text>
        </View>
        <View style={styles.headerRow}>
          <Text style={styles.headerLabel}>Style:</Text>
          <Text style={styles.headerValue}>{master.NO_STY}</Text>
        </View>
        <View style={styles.headerRow}>
          <Text style={styles.headerLabel}>Từ:</Text>
          <Text style={styles.headerValue}>{master.NAME_DEP_FROM}</Text>
        </View>
        <View style={styles.headerRow}>
          <Text style={styles.headerLabel}>Đến:</Text>
          <Text style={styles.headerValue}>{master.NAME_DEP_TO}</Text>
        </View>
        <View style={styles.headerRow}>
          <Text style={styles.headerLabel}>Sản phẩm:</Text>
          <Text style={styles.headerValue}>{master.NAME_PRD}</Text>
        </View>
      </View>
    );
  };

  const renderItem = ({item, index}: {item: EditableDetail; index: number}) => {
    const remaining = item.QTY - item.QTY_DONE;

    return (
      <View style={styles.detailItem}>
        <View style={styles.detailInfo}>
          <Text style={styles.sizeText}>Size: {item.NAME_SIZE || item.NO_SIZE}</Text>
          <Text style={styles.colorText}>
            Màu: {item.NAME_COLOR} ({item.NO_COLOR})
          </Text>
          <Text style={styles.remainText}>Còn lại: {remaining}</Text>
        </View>
        <View style={styles.qtyInputContainer}>
          <TextInput
            style={[
              styles.qtyInput,
              !canEditDocuments() && styles.qtyInputDisabled,
            ]}
            value={item.editedQty}
            onChangeText={value => handleQtyChange(index, value)}
            keyboardType="numeric"
            placeholder="0"
            editable={canEditDocuments()}
            maxLength={6}
          />
        </View>
      </View>
    );
  };

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

      <Text style={styles.sectionTitle}>Chi tiết</Text>

      <FlatList
        data={editableDetails}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.NO_SIZE}-${item.NO_COLOR}-${index}`}
        contentContainerStyle={styles.listContent}
      />

      {canEditDocuments() && (
        <TouchableOpacity
          style={[
            styles.saveButton,
            updateMutation.isPending && styles.saveButtonDisabled,
          ]}
          onPress={validateAndSave}
          disabled={updateMutation.isPending}>
          {updateMutation.isPending ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.saveButtonText}>Lưu</Text>
          )}
        </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
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
  headerCard: {
    backgroundColor: COLORS.white,
    margin: 12,
    padding: 16,
    borderRadius: 10,
    shadowColor: COLORS.black,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  headerLabel: {
    width: 80,
    fontSize: 14,
    color: COLORS.grayText,
  },
  headerValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    marginHorizontal: 12,
    marginBottom: 8,
  },
  listContent: {
    padding: 12,
    paddingBottom: 100,
  },
  detailItem: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  detailInfo: {
    flex: 1,
  },
  sizeText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
  },
  colorText: {
    fontSize: 14,
    color: COLORS.grayText,
    marginTop: 2,
  },
  remainText: {
    fontSize: 14,
    color: COLORS.green,
    marginTop: 2,
  },
  qtyInputContainer: {
    width: 80,
    marginLeft: 12,
  },
  qtyInput: {
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: COLORS.white,
  },
  qtyInputDisabled: {
    backgroundColor: COLORS.grayBackground,
  },
  saveButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: COLORS.blue,
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#90CAF9',
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default DocDetailScreen;
