# NETAS Lojistik web sitesi

NETAS için tek sayfalık, Türkçe tanıtım sitesi. Hava, deniz, kara ve demiryolu hizmetlerini, gönderi takibini ve teklif formunu içerir.

Saf HTML, CSS ve JavaScript ile yazıldı. Derleme adımı ve bağımlılık yok.

## Klasör yapısı

```
netas-website/
├── index.html            Sayfa içeriği
├── assets/
│   ├── css/style.css     Tüm stiller
│   ├── js/main.js        Etkileşimler, küre, harita ve görsel çizimleri
│   └── favicon.svg       Sekme ikonu
└── README.md
```

## Yerelde açma

`index.html` dosyasını tarayıcıda açmanız yeterli.

## GitHub Pages ile yayınlama

1. GitHub'da yeni bir depo oluşturun ve bu klasörün içeriğini depoya yükleyin. `index.html` deponun kök dizininde olmalı.
2. Depoda **Settings → Pages** bölümüne gidin.
3. **Source** olarak `Deploy from a branch`, dal olarak `main` ve klasör olarak `/ (root)` seçip kaydedin.
4. Birkaç dakika sonra site `https://<kullanici-adi>.github.io/<depo-adi>/` adresinde yayında olur.

## Yayından önce değiştirilmesi gerekenler

Aşağıdaki bilgiler örnek olarak yazıldı, gerçek bilgilerle değiştirilmeli:

- Telefon, e-posta ve adres (`index.html` içindeki iletişim bölümü ve alt bilgi)
- Müşteri logoları, müşteri yorumları ve genel müdür alıntısı
- Rakamlar (ülke sayısı, zamanında teslimat oranı, gönderi sayısı, merkez ve sefer sayıları)
- Haber kartları
- Gönderi takibindeki örnek takip numaraları (`assets/js/main.js` içindeki `SHIPMENTS`)

## Formlar

Teklif formu ve bülten formu alanları kontrol eder, ancak hiçbir sisteme bağlı değildir ve veri göndermez. Gerçek kullanım için bir form servisine (örneğin Formspree, Netlify Forms) ya da kendi sunucunuza bağlanmaları gerekir. Bağlantı `assets/js/main.js` içindeki `quote-form` ve `news-form` işleyicilerinden yapılır.

## Kullanılan fontlar

Google Fonts üzerinden yüklenir:

- **Schibsted Grotesk**: başlık ve metinler
- **IBM Plex Mono**: menü, etiket ve butonlar
