# Amper Tracker Mobile App

ESP32 cihazından gelen amper tüketim verilerini takip eden modern React Native mobil uygulaması.

## 🚀 Özellikler

- **Gerçek Zamanlı Veri Takibi**: ESP32'den gelen amper verilerini anlık görüntüleme
- **Dairesel Progress Bar**: Yüksek amper (≥1.0A) oranını görsel olarak gösterim
- **Son 24 Saat Verileri**: Detaylı tablo formatında veri listesi
- **Otomatik Yenileme**: 60 saniyede bir otomatik veri güncelleme
- **Modern UI/UX**: Material Design prensipleri ile tasarlanmış arayüz
- **Offline Desteği**: AsyncStorage ile yerel veri saklama
- **TypeScript**: Tam tip güvenliği

## 🛠 Teknoloji Stack'i

- **React Native**: 0.79.5 (En yeni sürüm)
- **React**: 19.0.0 (En yeni sürüm)
- **Expo**: ~53.0.17 (En yeni sürüm)
- **TypeScript**: ~5.8.3 (En yeni sürüm)
- **React Navigation**: Modern navigasyon
- **Axios**: HTTP istekleri
- **AsyncStorage**: Yerel veri saklama
- **React Native SVG**: Dairesel progress bar

## 📱 Ekran Yapısı

### Giriş Ekranı (LoginScreen)
- Kullanıcı adı girişi ve validasyon
- API bağlantı kontrolü
- Modern form tasarımı

### Ana Ekran (HomeScreen)
- **Üst Kısım**: Dairesel progress bar
  - Yüksek amper oranı (%)
  - Toplam okuma sayısı
  - Yüksek/Düşük amper sayıları
- **Alt Kısım**: Veri tablosu
  - Son 24 saat verileri
  - Tarih-saat ve amper değeri
  - Pull-to-refresh özelliği

## 🔧 Kurulum

### Gereksinimler
- Node.js 18+ 
- npm veya yarn
- Expo CLI
- iOS Simulator veya Android Emulator

### Adımlar

1. **Projeyi klonlayın**
```bash
git clone <repository-url>
cd amper-reading-mobile
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
```

3. **Uygulamayı başlatın**
```bash
npm start
```

4. **Platform seçin**
- iOS: `npm run ios`
- Android: `npm run android`
- Web: `npm run web`

## 📊 API Entegrasyonu

Uygulama, backend API'si ile şu endpoint'leri kullanır:

- `GET /api/health` - Sağlık kontrolü
- `GET /api/user/{username}/stats` - Kullanıcı istatistikleri
- `GET /api/user/{username}/recent` - Son 24 saat verileri

## 🎨 Bileşenler

### CircularProgress
- SVG tabanlı dairesel progress bar
- Responsive tasarım
- Özelleştirilebilir renkler ve boyutlar

### ReadingsTable
- FlatList ile performanslı liste
- Pull-to-refresh desteği
- Loading ve error state'leri
- Boş veri durumu

## 🔄 Veri Akışı

1. **ESP32** → POST /api/data → **Backend API**
2. **Backend API** → MongoDB Atlas
3. **Mobile App** ← GET /api/user/* ← **Backend API**
4. **60 saniye interval** ile otomatik yenileme

## 📁 Proje Yapısı

```
src/
├── components/          # Yeniden kullanılabilir bileşenler
│   ├── CircularProgress.tsx
│   └── ReadingsTable.tsx
├── navigation/          # Navigasyon yapısı
│   └── AppNavigator.tsx
├── screens/            # Ekran bileşenleri
│   ├── LoginScreen.tsx
│   └── HomeScreen.tsx
├── services/           # API servisleri
│   └── api.ts
├── types/              # TypeScript tip tanımları
│   └── index.ts
└── utils/              # Yardımcı fonksiyonlar
    ├── dateUtils.ts
    └── storage.ts
```

## 🚀 Deployment

### Expo Application Services (EAS)

1. **EAS CLI kurulumu**
```bash
npm install -g @expo/eas-cli
```

2. **EAS Build konfigürasyonu**
```bash
eas build:configure
```

3. **Build oluşturma**
```bash
eas build --platform ios
eas build --platform android
```

## 🔧 Geliştirme

### Kod Standartları
- TypeScript strict mode
- ESLint ve Prettier
- Modern ES6+ syntax
- Functional components ve hooks

### Test
```bash
npm test
```

### Lint
```bash
npm run lint
```

## 📱 Özellikler

- ✅ Modern React Native + Expo
- ✅ TypeScript desteği
- ✅ Gerçek zamanlı veri güncelleme
- ✅ Offline veri saklama
- ✅ Responsive tasarım
- ✅ Error handling
- ✅ Loading states
- ✅ Pull-to-refresh
- ✅ Auto-refresh (60s)
- ✅ Modern UI/UX

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

- Proje Sahibi: [İsim]
- Email: [email]
- GitHub: [github-username]

---

**Not**: Bu uygulama ESP32 cihazından gelen amper verilerini görselleştirmek için tasarlanmıştır. Backend API'si ayrı bir projede bulunmaktadır. 