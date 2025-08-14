import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { storageService } from '../utils/storage';
import { apiService } from '../services/api';

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Login'
>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateUsername = (value: string): boolean => {
    // Username validation rules
    if (!value || value.trim().length === 0) {
      Alert.alert('Hata', 'Kullanıcı adı boş olamaz');
      return false;
    }

    if (value.trim().length < 3) {
      Alert.alert('Hata', 'Kullanıcı adı en az 3 karakter olmalıdır');
      return false;
    }

    if (value.trim().length > 20) {
      Alert.alert('Hata', 'Kullanıcı adı en fazla 20 karakter olabilir');
      return false;
    }

    // Only allow alphanumeric characters and underscores
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(value.trim())) {
      Alert.alert(
        'Hata',
        'Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir'
      );
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validateUsername(username)) {
      return;
    }

    setIsLoading(true);

    try {
      // Check if API is available
      const isApiHealthy = await apiService.healthCheck();

      if (!isApiHealthy) {
        Alert.alert(
          'Bağlantı Hatası',
          'Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin.',
          [{ text: 'Tamam' }]
        );
        return;
      }

      // Save username to storage
      await storageService.saveUsername(username.trim());

      // Navigate to products screen
      navigation.replace('Products');
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(
        'Giriş Hatası',
        'Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.',
        [{ text: 'Tamam' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUsernameChange = (value: string) => {
    setUsername(value);
  };

  const isFormValid =
    username.trim().length >= 3 && username.trim().length <= 20;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Amper Tracker</Text>
          <Text style={styles.subtitle}>
            ESP32 cihazınızdan gelen amper verilerini takip edin
          </Text>
        </View>

        {/* Login Form */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Kullanıcı Adı</Text>
            <TextInput
              style={[
                styles.input,
                username.trim().length > 0 && !isFormValid && styles.inputError,
              ]}
              value={username}
              onChangeText={handleUsernameChange}
              placeholder="Kullanıcı adınızı girin"
              placeholderTextColor="#999"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="username"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.loginButton,
              (!isFormValid || isLoading) && styles.loginButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={!isFormValid || isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.loginButtonText}>Başla</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            ESP32 cihazınızla aynı kullanıcı adını kullanın
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    marginBottom: 48,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
    position: 'relative',
  },
  inputError: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFF5F5',
  },

  loginButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loginButtonDisabled: {
    backgroundColor: '#BDBDBD',
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default LoginScreen;
