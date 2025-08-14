import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar as RNStatusBar,
  FlatList,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, UserStats, AmperReading, Product } from '../types';
import { apiService } from '../services/api';
import CircularProgress from '../components/CircularProgress';

// Table Header Row
const TableHeader = () => (
  <View style={styles.tableRow}>
    <Text style={[styles.tableCell, styles.headerCell]}>Tarih-Saat</Text>
    <Text style={[styles.tableCell, styles.headerCell]}>Amper Değeri</Text>
  </View>
);

// Helper function to get amper status and style
const getAmperStatus = (amper: number) => {
  if (amper > 22) {
    return null; // Don't show
  } else if (amper > 5) {
    return { status: 'max', style: 'maxAmperText' };
  } else if (amper >= 3) {
    return { status: 'mid', style: 'midAmperText' };
  } else if (amper >= 1) {
    return { status: 'min', style: 'minAmperText' };
  } else {
    return { status: 'off', style: 'offAmperText' };
  }
};

// Helper function to get time range label
const getTimeRangeLabel = (range: string) => {
  switch (range) {
    case '1h': return 'Son 1 Saat';
    case '6h': return 'Son 6 Saat';
    case '12h': return 'Son 12 Saat';
    case '24h': return 'Son 24 Saat';
    case '7d': return 'Son 7 Gün';
    case '30d': return 'Son 30 Gün';
    default: return 'Son 24 Saat';
  }
};

// FlatList Table Row
const TableRow = ({ item }: { item: AmperReading }) => {
  const amperStatus = getAmperStatus(item.amper);
  
  if (!amperStatus) {
    return null; // Don't render if amper > 22
  }
  
  return (
    <View style={styles.tableRow}>
      <Text style={styles.tableCell}>{new Date(item.timestamp).toLocaleString('tr-TR', { hour12: false })}</Text>
      <View style={styles.amperCell}>
        <Text style={[styles.tableCell, styles[amperStatus.style as keyof typeof styles]]}>{item.amper.toFixed(1)}A</Text>
        <Text style={[styles.statusText, styles[amperStatus.style as keyof typeof styles]]}>{amperStatus.status.toUpperCase()}</Text>
      </View>
    </View>
  );
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;
type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
  route: HomeScreenRouteProp;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, route }) => {
  const { username, product, selectedSensor } = route.params;
  
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentReadings, setRecentReadings] = useState<AmperReading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showTimeFilter, setShowTimeFilter] = useState(false);
  const [timeRange, setTimeRange] = useState<string>('24h');

  // Auto-refresh interval (60 seconds)
  const REFRESH_INTERVAL = 60000;

  const fetchData = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    }
    setError(null);

    try {
      // Fetch readings for the specific product, user and sensor
      const readingsData = await apiService.getProductUserReadings(product._id, username, selectedSensor, { timeRange });

      // Filter out readings over 22A
      const filteredReadings = readingsData.filter((reading: AmperReading) => reading.amper <= 22);
      
      // Calculate stats from filtered readings using the 4-tier system
      const totalReadings = filteredReadings.length;
      const offCount = filteredReadings.filter(r => r.amper <= 1).length;
      const minCount = filteredReadings.filter(r => r.amper >= 1 && r.amper < 3).length;
      const midCount = filteredReadings.filter(r => r.amper >= 3 && r.amper < 5).length;
      const maxCount = filteredReadings.filter(r => r.amper >= 5 && r.amper <= 22).length;
      
      // Percentage of active readings (min + mid + max)
      const activeCount = minCount + midCount + maxCount;
      const percentage = totalReadings > 0 ? (activeCount / totalReadings) * 100 : 0;
      
      setStats({
        totalReadings,
        highAmpCount: activeCount,
        lowAmpCount: offCount,
        percentage,
        offCount,
        minCount,
        midCount,
        maxCount
      });
      setRecentReadings(filteredReadings);
      setLastSync(new Date().toISOString());

    } catch (error) {
      setError('Veriler yüklenirken bir hata oluştu');
      Alert.alert(
        'Veri Hatası',
        'Sunucudan veri alınamadı. Lütfen internet bağlantınızı kontrol edin.',
        [
          { text: 'Tekrar Dene', onPress: () => fetchData() },
          { text: 'Tamam', style: 'cancel' },
        ]
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [product._id, username, timeRange]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchData(false);
  }, [fetchData]);


  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh setup (1 dakikada bir istek atar)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading && !isRefreshing) {
        fetchData(false);
      }
    }, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData, isLoading, isRefreshing]);


  // Header + Progress + Sync Info + Error + Table Header
  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>‹ Geri</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Amper Tracker</Text>
          <Text style={styles.headerSubtitle}>Kullanıcı: {username}</Text>
        </View>
        <View style={styles.placeholder} />
      </View>
      <View style={styles.contextInfo}>
        <Text style={styles.contextProduct}>Ürün: {product.name}</Text>
        <Text style={styles.contextSensor}>Sensör: {selectedSensor}</Text>
      </View>
      <View style={styles.progressBarWrapper}>
        <CircularProgress
          percentage={stats?.percentage || 0}
          totalReadings={stats?.totalReadings || 0}
          offCount={stats?.offCount || 0}
          minCount={stats?.minCount || 0}
          midCount={stats?.midCount || 0}
          maxCount={stats?.maxCount || 0}
          size={140}
        />
      </View>
      {lastSync && (
        <View style={styles.syncInfo}>
          <Text style={styles.syncText}>Son güncelleme: {new Date(lastSync).toLocaleTimeString('tr-TR')}</Text>
        </View>
      )}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      <View style={styles.filterSection}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowTimeFilter(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.filterButtonText}>Zaman Filtresi: {getTimeRangeLabel(timeRange)}</Text>
          <Text style={styles.filterArrow}>▼</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.tableSection}>
        <Text style={styles.title}>Amper Verileri</Text>
        <Text style={styles.subtitle}>{recentReadings.length} okuma bulundu</Text>
        <View style={styles.tableRowHeader}>
          <Text style={[styles.tableCell, styles.headerCell]}>Tarih-Saat</Text>
          <Text style={[styles.tableCell, styles.headerCell, styles.amperHeaderCell]}>Amper Değeri</Text>
        </View>
      </View>
    </>
  );

  const handleTimeRangeSelect = (range: string) => {
    setTimeRange(range);
    setShowTimeFilter(false);
    fetchData();
  };

  const timeRangeOptions = [
    { value: '1h', label: 'Son 1 Saat' },
    { value: '6h', label: 'Son 6 Saat' },
    { value: '12h', label: 'Son 12 Saat' },
    { value: '24h', label: 'Son 24 Saat' },
    { value: '7d', label: 'Son 7 Gün' },
    { value: '30d', label: 'Son 30 Gün' },
  ];

  const renderTimeRangeOption = ({ item }: { item: { value: string; label: string } }) => (
    <TouchableOpacity
      style={[
        styles.timeRangeOption,
        timeRange === item.value && styles.selectedTimeRangeOption
      ]}
      onPress={() => handleTimeRangeSelect(item.value)}
    >
      <Text style={[
        styles.timeRangeOptionText,
        timeRange === item.value && styles.selectedTimeRangeOptionText
      ]}>
        {item.label}
      </Text>
      {timeRange === item.value && (
        <Text style={styles.checkmark}>✓</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <FlatList
        data={recentReadings}
        renderItem={({ item }) => <TableRow item={item} />}
        keyExtractor={(item) => item._id || item.timestamp}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#4CAF50']}
            tintColor="#4CAF50"
          />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Seçilen zaman aralığında veri bulunamadı</Text>
              <Text style={styles.emptySubText}>ESP32 cihazından veri gelmeye başladığında burada görünecek</Text>
            </View>
          ) : null
        }
        contentContainerStyle={styles.listContent}
      />

      <Modal
        visible={showTimeFilter}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTimeFilter(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Zaman Aralığı Seç</Text>
              <TouchableOpacity
                onPress={() => setShowTimeFilter(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={timeRangeOptions}
              renderItem={renderTimeRangeOption}
              keyExtractor={(item) => item.value}
              showsVerticalScrollIndicator={false}
              style={styles.timeRangeList}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  header: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: '600',
  },
  headerContent: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  headerSubtitle: { fontSize: 14, color: '#666', marginTop: 2 },
  placeholder: {
    width: 50,
  },
  contextInfo: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  contextProduct: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 4,
  },
  contextSensor: {
    fontSize: 14,
    color: '#4CAF50',
  },
  syncInfo: { alignItems: 'center', marginBottom: 8 },
  syncText: { fontSize: 12, color: '#999' },
  errorContainer: { backgroundColor: '#FFEBEE', marginHorizontal: 16, marginBottom: 8, padding: 12, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#F44336' },
  errorText: { color: '#D32F2F', fontSize: 14 },
  tableSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 0,
    borderRadius: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
    marginTop: 16,
  },
  title: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  tableRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#fff',
  },
  tableCell: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    textAlign: 'left',
  },
  headerCell: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: 15,
  },
  amperHeaderCell: {
    textAlign: 'right',
  },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#666', textAlign: 'center' },
  emptySubText: { fontSize: 14, color: '#999', textAlign: 'center', marginTop: 8 },
  progressBarWrapper: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 32,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 48,
    backgroundColor: '#F5F5F5',
  },
  amperCell: {
    flex: 1,
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  offAmperText: {
    color: '#9E9E9E',
    fontWeight: '600',
  },
  minAmperText: {
    color: '#FF9800',
    fontWeight: '600',
  },
  midAmperText: {
    color: '#2196F3',
    fontWeight: '600',
  },
  maxAmperText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  filterSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
  },
  filterButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  filterArrow: {
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#999',
  },
  timeRangeList: {
    padding: 20,
  },
  timeRangeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F8F9FA',
  },
  selectedTimeRangeOption: {
    backgroundColor: '#E8F5E8',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  timeRangeOptionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  selectedTimeRangeOptionText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});

export default HomeScreen; 
