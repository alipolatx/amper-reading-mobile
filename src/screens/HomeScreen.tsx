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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, UserStats, AmperReading } from '../types';
import { apiService } from '../services/api';
import { storageService } from '../utils/storage';
import CircularProgress from '../components/CircularProgress';

// Table Header Row
const TableHeader = () => (
  <View style={styles.tableRow}>
    <Text style={[styles.tableCell, styles.headerCell]}>Tarih-Saat</Text>
    <Text style={[styles.tableCell, styles.headerCell]}>Amper Değeri</Text>
  </View>
);

// FlatList Table Row
const TableRow = ({ item }: { item: AmperReading }) => {
  const isHighAmper = item.amper >= 1.0;
  return (
    <View style={styles.tableRow}>
      <Text style={styles.tableCell}>{new Date(item.timestamp).toLocaleString('tr-TR', { hour12: false })}</Text>
      <Text style={[styles.tableCell, isHighAmper ? styles.highAmperText : styles.lowAmperText]}>{item.amper.toFixed(1)}A</Text>
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
  const { username } = route.params;
  
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentReadings, setRecentReadings] = useState<AmperReading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auto-refresh interval (60 seconds)
  const REFRESH_INTERVAL = 60000;

  const fetchData = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    }
    setError(null);

    try {
      // Fetch stats and recent readings in parallel
      const [statsData, readingsData] = await Promise.all([
        apiService.getUserStats(username),
        apiService.getRecentReadings(username),
      ]);

      setStats(statsData);
      setRecentReadings(readingsData);
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
  }, [username]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchData(false);
  }, [fetchData]);

  const handleLogout = async () => {
    Alert.alert(
      'Çıkış Yap',
      'Çıkış yapmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            try {
              await storageService.removeUsername();
              navigation.replace('Login');
            } catch (error) {}
          },
        },
      ]
    );
  };

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

  // Save last sync time
  useEffect(() => {
    if (lastSync) {
      storageService.saveLastSync(lastSync);
    }
  }, [lastSync]);

  // Header + Progress + Sync Info + Error + Table Header
  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Amper Tracker</Text>
          <Text style={styles.headerSubtitle}>Hoş geldin, {username}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
          <Text style={styles.logoutButtonText}>Çıkış</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.progressBarWrapper}>
        <CircularProgress
          percentage={stats?.percentage || 0}
          totalReadings={stats?.totalReadings || 0}
          highAmpCount={stats?.highAmpCount || 0}
          lowAmpCount={stats?.lowAmpCount || 0}
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
      <View style={styles.tableSection}>
        <Text style={styles.title}>Son 24 Saat Verileri</Text>
        <Text style={styles.subtitle}>{recentReadings.length} okuma bulundu</Text>
        <View style={styles.tableRowHeader}>
          <Text style={[styles.tableCell, styles.headerCell]}>Tarih-Saat</Text>
          <Text style={[styles.tableCell, styles.headerCell, styles.amperHeaderCell]}>Amper Değeri</Text>
        </View>
      </View>
    </>
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
              <Text style={styles.emptyText}>Son 24 saatte veri bulunamadı</Text>
              <Text style={styles.emptySubText}>ESP32 cihazından veri gelmeye başladığında burada görünecek</Text>
            </View>
          ) : null
        }
        contentContainerStyle={styles.listContent}
      />
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
  headerContent: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  headerSubtitle: { fontSize: 14, color: '#666', marginTop: 2 },
  logoutButton: { backgroundColor: '#FF6B6B', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  logoutButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
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
  highAmperText: {
    color: '#4CAF50',
    fontWeight: '600',
    textAlign: 'right',
  },
  lowAmperText: {
    color: '#FF9800',
    fontWeight: '600',
    textAlign: 'right',
  },
});

export default HomeScreen; 
