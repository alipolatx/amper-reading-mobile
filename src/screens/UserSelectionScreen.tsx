import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar as RNStatusBar,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  RefreshControl,
  KeyboardAvoidingView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { apiService } from '../services/api';
import { storageService } from '../utils/storage';

type UserSelectionNavigationProp = NativeStackNavigationProp<RootStackParamList, 'UserSelection'>;
type UserSelectionRouteProp = RouteProp<RootStackParamList, 'UserSelection'>;

interface UserSelectionScreenProps {
  navigation: UserSelectionNavigationProp;
  route: UserSelectionRouteProp;
}

interface UserGroup {
  username: string;
  readingCount: number;
  lastReading?: string;
}

const UserSelectionScreen: React.FC<UserSelectionScreenProps> = ({ navigation, route }) => {
  const { product, selectedSensor } = route.params;
  const [newUsername, setNewUsername] = useState('');
  const [userGroups, setUserGroups] = useState<UserGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserGroups = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const users = await apiService.getProductUsers(product._id);
      setUserGroups(users.sort((a, b) => a.username.localeCompare(b.username)));
    } catch (error) {
      setError('Kullanıcı verileri yüklenirken bir hata oluştu');
      console.error('Error fetching user groups:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [product._id]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchUserGroups(false);
  }, [fetchUserGroups]);

  const handleSaveUsername = async () => {
    if (!newUsername.trim()) {
      Alert.alert('Hata', 'Lütfen bir kullanıcı adı girin');
      return;
    }

    const trimmedUsername = newUsername.trim();
    
    const existingUser = userGroups.find(group => 
      group.username.toLowerCase() === trimmedUsername.toLowerCase()
    );
    
    if (existingUser) {
      Alert.alert('Bilgi', 'Bu kullanıcı adı zaten mevcut');
      return;
    }

    setIsSaving(true);
    try {
      // Save username to storage for future use
      await storageService.saveUsername(trimmedUsername);
      
      navigation.navigate('Home', { 
        username: trimmedUsername, 
        product, 
        selectedSensor 
      });
    } catch (error) {
      Alert.alert('Hata', 'Kullanıcı seçilirken bir hata oluştu');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUserPress = async (username: string) => {
    try {
      // Save username to storage for future use
      await storageService.saveUsername(username);
      
      navigation.navigate('Home', { 
        username, 
        product, 
        selectedSensor 
      });
    } catch (error) {
      Alert.alert('Hata', 'Kullanıcı seçilirken bir hata oluştu');
    }
  };

  useEffect(() => {
    fetchUserGroups();
  }, [fetchUserGroups]);

  const renderUserItem = ({ item }: { item: UserGroup }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => handleUserPress(item.username)}
      activeOpacity={0.7}
    >
      <View style={styles.userContent}>
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.readingCount}>{item.readingCount} okuma</Text>
      </View>
      <View style={styles.arrowContainer}>
        <Text style={styles.arrow}>›</Text>
      </View>
    </TouchableOpacity>
  );

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
          <Text style={styles.headerTitle}>Kullanıcı Seçimi</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.productInfo}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.selectedSensor}>Seçili Sensör: {selectedSensor}</Text>
      </View>

      <View style={styles.newUserSection}>
        <Text style={styles.sectionTitle}>Yeni Kullanıcı Ekle</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Kullanıcı adı girin"
            value={newUsername}
            onChangeText={setNewUsername}
            autoCapitalize="none"
            autoCorrect={false}
            blurOnSubmit={false}
            returnKeyType="done"
            onSubmitEditing={handleSaveUsername}
          />
          <TouchableOpacity
            style={[styles.saveButton, !newUsername.trim() && styles.saveButtonDisabled]}
            onPress={handleSaveUsername}
            disabled={!newUsername.trim() || isSaving}
            activeOpacity={0.7}
          >
            <Text style={[styles.saveButtonText, !newUsername.trim() && styles.saveButtonTextDisabled]}>
              {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.existingUsersSection}>
        <Text style={styles.sectionTitle}>Mevcut Kullanıcılar</Text>
        <Text style={styles.sectionSubtitle}>
          {userGroups.length} kullanıcı bulundu
        </Text>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FlatList
        data={userGroups}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.username}
        ListHeaderComponent={renderHeader}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
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
              <Text style={styles.emptyText}>Henüz kullanıcı bulunamadı</Text>
              <Text style={styles.emptySubText}>Yukarıdan yeni bir kullanıcı ekleyebilirsiniz</Text>
            </View>
          ) : null
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      </KeyboardAvoidingView>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  keyboardAvoidingView: {
    flex: 1,
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
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 50,
  },
  productInfo: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  selectedSensor: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  newUserSection: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonTextDisabled: {
    color: '#999',
  },
  existingUsersSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 48,
  },
  userCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userContent: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  readingCount: {
    fontSize: 14,
    color: '#666',
  },
  arrowContainer: {
    marginLeft: 16,
  },
  arrow: {
    fontSize: 20,
    color: '#999',
    fontWeight: '300',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
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
  errorContainer: {
    position: 'absolute',
    bottom: 50,
    left: 16,
    right: 16,
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
  },
});

export default UserSelectionScreen;