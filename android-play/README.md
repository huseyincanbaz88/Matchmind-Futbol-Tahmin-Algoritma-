# MatchMind Google Play sürümü

Bu klasör, mevcut web sürümünden bağımsız Android uygulamasıdır. Play sürümünde bahis kuponu, bahis oranları, para yatırma ve bahis sitesine yönlendirme bulunmaz.

## Paket

- Uygulama kimliği: `com.matchmind.footballanalytics`
- Sürüm: `1.0.0` (`versionCode 1`)
- Minimum Android: 7.0 (API 24)
- Hedef Android API: 36

## Yerel paketleme

Android SDK ve Gradle 8.10.2 kurulu bir ortamda:

```bash
gradle bundleRelease
```

Google Play'e yüklenen AAB, kalıcı bir upload key ile imzalanmalıdır. Keystore dosyaları repoya eklenmemelidir.
