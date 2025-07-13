import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { AmperReading } from '../types';
import { formatTimestamp, formatAmperValue } from '../utils/dateUtils';

interface ReadingsTableProps {
  readings: AmperReading[];
  isLoading: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  onLoadMore?: () => void;
  hasMoreData?: boolean;
}

const ReadingsTable: React.FC<ReadingsTableProps> = ({
  readings,
  isLoading,
  isRefreshing,
  onRefresh,
  onLoadMore,
  hasMoreData = false,
}) => {
  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerText}>Tarih-Saat</Text>
      <Text style={[styles.headerText, styles.headerTextRight]}>Amper Değeri</Text>
    </View>
  );

  const renderItem = ({ item, index }: { item: AmperReading; index: number }) => {
    const isHighAmper = item.amper >= 1.0;
    
    return (
      <View style={[styles.row, index % 2 === 0 && styles.evenRow]}>
        <Text style={styles.timestampText}>
          {formatTimestamp(item.timestamp)}
        </Text>
        <Text style={[
          styles.amperText,
          isHighAmper ? styles.highAmperText : styles.lowAmperText
        ]}>
          {formatAmperValue(item.amper)}
        </Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!hasMoreData) return null;
    
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#4CAF50" />
        <Text style={styles.footerText}>Daha fazla veri yükleniyor...</Text>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        Son 24 saatte veri bulunamadı
      </Text>
      <Text style={styles.emptySubText}>
        ESP32 cihazından veri gelmeye başladığında burada görünecek
      </Text>
    </View>
  );

  if (isLoading && readings.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Veriler yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Son 24 Saat Verileri</Text>
        <Text style={styles.subtitle}>
          {readings.length} okuma bulundu
        </Text>
      </View>

      <FlatList
        data={readings}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={['#4CAF50']}
            tintColor="#4CAF50"
          />
        }
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  titleContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  header: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    justifyContent: 'space-between',
  },
  headerText: {
    width: '60%',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  headerTextRight: {
    width: '40%',
    textAlign: 'right',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  evenRow: {
    backgroundColor: '#FAFAFA',
  },
  timestampText: {
    width: '60%',
    fontSize: 14,
    color: '#333',
  },
  amperText: {
    width: '40%',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  highAmperText: {
    color: '#4CAF50',
  },
  lowAmperText: {
    color: '#FF9800',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  footerText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  listContent: {
    flexGrow: 1,
  },
});

export default ReadingsTable; 