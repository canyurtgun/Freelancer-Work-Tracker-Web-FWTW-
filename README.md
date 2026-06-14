# ◆ Freelance İş Takip

Freelance projelerinizi, müşterilerinizi, ödemelerinizi ve çalışan atamalarınızı tek bir panelden yönetmenizi sağlayan **full-stack web uygulaması**.

> **Teknoloji Yığını:** React 19 · Express 5 · Prisma ORM · SQLite · JWT · Framer Motion · Recharts

---

## 📑 İçindekiler

- [Özellikler](#-özellikler)
- [Ekran Görüntüleri](#-ekran-görüntüleri)
- [Mimari Genel Bakış](#-mimari-genel-bakış)
- [Gereksinimler](#-gereksinimler)
- [Kurulum](#-kurulum)
  - [1. Projeyi İndirme](#1-projeyi-indirme)
  - [2. Backend Bağımlılıkları](#2-backend-bağımlılıkları)
  - [3. Veritabanı Kurulumu](#3-veritabanı-kurulumu)
  - [4. Frontend Bağımlılıkları](#4-frontend-bağımlılıkları)
  - [5. Frontend Build](#5-frontend-build)
  - [6. Uygulamayı Başlatma](#6-uygulamayı-başlatma)
- [Geliştirme Modu](#-geliştirme-modu)
- [Ortam Değişkenleri](#-ortam-değişkenleri)
- [Veritabanı Şeması](#-veritabanı-şeması)
- [API Referansı](#-api-referansı)
  - [Kimlik Doğrulama (Auth)](#kimlik-doğrulama-auth)
  - [Kullanıcılar (Users)](#kullanıcılar-users)
  - [Projeler (Projects)](#projeler-projects)
  - [Uyarılar (Alerts)](#uyarılar-alerts)
- [Proje Yapısı](#-proje-yapısı)
- [Frontend Bileşenleri](#-frontend-bileşenleri)
- [Kullanıcı Rolleri ve Yetkilendirme](#-kullanıcı-rolleri-ve-yetkilendirme)
- [Proje Durumları](#-proje-durumları)
- [Tasarım Sistemi](#-tasarım-sistemi)
- [Production Dağıtımı](#-production-dağıtımı)
- [Sorun Giderme](#-sorun-giderme)
- [Lisans](#-lisans)

---

## ✨ Özellikler

| Kategori | Detay |
|----------|-------|
| **Proje Yönetimi** | Proje oluşturma, düzenleme, silme; müşteri adı, fiyat, depozito, başlangıç/teslim tarihi, durum takibi |
| **Ekstra İstekler** | Her projeye bağımsız olarak fiyatlandırılabilen ekstra satır ekleme (örn. ek özellik talepleri) |
| **Çalışan Ataması** | Sürükle-bırak (drag & drop) arayüzü ile projelere kullanıcı atama ve sıralama |
| **Kullanıcı Yönetimi** | Admin panelinden kullanıcı oluşturma (otomatik şifre üretimi dahil), düzenleme, şifre sıfırlama, silme |
| **Uyarı Sistemi** | Gecikmiş ve 3 gün içinde teslim tarihi olan projeleri otomatik tespit eden bildirim modalı |
| **Bugün Teslim Modalı** | Bugün teslim tarihi olan aktif projeleri listeleyerek durum güncelleme imkânı sunan açılış diyaloğu |
| **İstatistik Kartları** | Toplam proje, aktif iş, beklenen gelir, toplanan miktar, kalan bakiye, ortalama proje süresi, ekstra gelir |
| **Grafikler** | Durum dağılımı pasta grafiği, aylık gelir çubuk grafiği (Recharts) |
| **Arama & Filtreleme** | Başlık, müşteri adı, içerik ve notlar üzerinden arama; durum bazlı filtreleme; çoklu sıralama seçenekleri |
| **JSON Dışa Aktarma** | Tüm proje verilerini JSON dosyası olarak indirme (sadece admin) |
| **Kimlik Doğrulama** | JWT tabanlı oturum yönetimi, HTTP-only cookie desteği, 7 gün geçerli token |
| **Modern UI** | Glassmorphism, aurora orb animasyonları, gradient butonlar, framer-motion mikro-animasyonlar |
| **Responsive Tasarım** | Mobil ve masaüstü uyumlu arayüz |

---

## 🖼 Ekran Görüntüleri

Uygulama **koyu tema** ile çalışır. Temel ekranlar:

1. **Giriş Sayfası** — Glassmorphism kart tasarımı, animasyonlu orb'lar ve hata mesajları
2. **Ana Dashboard** — İstatistik kartları, grafikler, proje listesi, arama ve filtreleme araçları
3. **Proje Oluşturma / Düzenleme Modalı** — Çoklu alan formu, ekstra satır yönetimi, sürükle-bırak çalışan ataması
4. **Kullanıcı Yönetim Paneli** — Tablo görünümü, CRUD işlemleri, şifre sıfırlama
5. **Uyarılar Modalı** — Gecikmiş ve yaklaşan teslimatların otomatik tespiti

---

## 🏗 Mimari Genel Bakış

```
┌────────────────────────────────────────────────────────────┐
│                     Tarayıcı (Client)                      │
│  React 19 + Framer Motion + Recharts                       │
│  SPA — client/build/ dizininden serve edilir                │
└──────────────────────────┬─────────────────────────────────┘
                           │ HTTP (fetch, cookie)
┌──────────────────────────▼─────────────────────────────────┐
│                   Express 5 Backend                        │
│  index.js — ana giriş noktası                              │
│  ┌─────────────────┐ ┌──────────────────────────────────┐  │
│  │  Middleware      │ │  API Rotaları (/api/...)          │  │
│  │  • JWT Auth      │ │  • /api/auth   — login/logout/me │  │
│  │  • Admin Guard   │ │  • /api/users  — CRUD + şifre    │  │
│  │  • CORS          │ │  • /api/projects — CRUD + assign │  │
│  │  • Cookie Parser │ │  • /api/alerts — gecikmiş/yaklaşan│  │
│  └─────────────────┘ └──────────────────────────────────┘  │
│                           │                                │
│                    Prisma ORM                              │
└──────────────────────────┬─────────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────────┐
│                    SQLite Veritabanı                        │
│                    prisma/dev.db                            │
│  Tablolar: User, Project, ProjectUser, Extra               │
└────────────────────────────────────────────────────────────┘
```

---

## 📋 Gereksinimler

| Araç | Minimum Sürüm | Açıklama |
|------|---------------|----------|
| **Node.js** | 18.x veya üstü | Runtime ortamı |
| **npm** | 9.x veya üstü | Paket yöneticisi (Node.js ile birlikte gelir) |

> **Not:** SQLite sürücüsü Prisma tarafından otomatik olarak yönetilir, ayrı kurulum gerekmez.

---

## 🚀 Kurulum

### 1. Projeyi İndirme

```bash
# Projeyi klonlayın veya zip olarak indirip açın
cd <proje-dizini>
```

### 2. Backend Bağımlılıkları

Proje kök dizininde:

```bash
npm install
```

Bu komut aşağıdaki paketleri yükler:

| Paket | Açıklama |
|-------|----------|
| `express` | Web framework (v5) |
| `@prisma/client` | Veritabanı ORM istemcisi |
| `prisma` (dev) | Veritabanı şema yönetimi ve migration aracı |
| `bcryptjs` | Şifre hashleme |
| `jsonwebtoken` | JWT token oluşturma ve doğrulama |
| `cookie-parser` | HTTP cookie okuma |
| `cors` | Cross-Origin Resource Sharing desteği |
| `dotenv` | Ortam değişkenleri yönetimi |

### 3. Veritabanı Kurulumu

#### 3a. Ortam Değişkenleri Dosyasını Oluşturma

Proje kök dizininde bir `.env` dosyası oluşturun (veya mevcut olanı düzenleyin):

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="buraya-guclu-ve-benzersiz-bir-anahtar-yazin"
```

> ⚠️ **Önemli:** `JWT_SECRET` değerini production ortamında mutlaka uzun ve rastgele bir değer ile değiştirin.

#### 3b. Veritabanı Migration'ını Çalıştırma

```bash
npx prisma migrate deploy
```

Bu komut:
- `prisma/dev.db` adında bir SQLite veritabanı dosyası oluşturur
- `User`, `Project`, `ProjectUser` ve `Extra` tablolarını oluşturur

> **Alternatif (sıfırdan oluşturma):**
> ```bash
> npx prisma migrate dev --name init
> ```

#### 3c. Prisma Client Üretimi

```bash
npx prisma generate
```

Bu komut Prisma istemci kodunu `node_modules/@prisma/client` altında oluşturur.

### 4. Frontend Bağımlılıkları

```bash
cd client
npm install
```

Bu komut aşağıdaki paketleri yükler:

| Paket | Açıklama |
|-------|----------|
| `react`, `react-dom` | UI kütüphanesi (v19) |
| `react-scripts` | Create React App build araçları |
| `framer-motion` | Animasyon kütüphanesi |
| `recharts` | Grafik kütüphanesi |
| `@testing-library/*` | Test araçları |

### 5. Frontend Build

Hâlâ `client/` dizinindeyken:

```bash
npm run build
```

Bu komut üretim için optimize edilmiş statik dosyaları `client/build/` dizininde oluşturur. Express sunucusu bu dosyaları otomatik olarak serve eder.

### 6. Uygulamayı Başlatma

Proje kök dizinine dönün ve sunucuyu başlatın:

```bash
cd ..
node index.js
```

Başarılı çıktı:

```
✓ Varsayılan admin hesabı oluşturuldu (admin / admin123)
Server çalışıyor: http://localhost:5000
```

> **Not:** Admin hesabı sadece veritabanında hiç kullanıcı yoksa otomatik oluşturulur.

### Hızlı Başlangıç (Tek Komut Dizisi)

```bash
# Kök dizinde
npm install
npx prisma migrate deploy
npx prisma generate

# Client
cd client
npm install
npm run build
cd ..

# Sunucuyu başlat
node index.js
```

Tarayıcıda **http://localhost:5000** adresini açın.

**Varsayılan giriş bilgileri:**
| Alan | Değer |
|------|-------|
| Kullanıcı adı | `admin` |
| Şifre | `admin123` |

---

## 🛠 Geliştirme Modu

Frontend'i hot-reload ile geliştirmek için iki terminal kullanın:

**Terminal 1 — Backend:**
```bash
# Kök dizinde
node index.js
```

**Terminal 2 — Frontend (dev server):**
```bash
cd client
npm start
```

Frontend dev sunucusu `http://localhost:3000` üzerinde çalışır ve API isteklerini `package.json`'daki `"proxy": "http://localhost:5000"` ayarı sayesinde otomatik olarak backend'e yönlendirir.

---

## 🔧 Ortam Değişkenleri

| Değişken | Zorunlu | Varsayılan | Açıklama |
|----------|---------|-----------|----------|
| `DATABASE_URL` | ✅ | `file:./dev.db` | Prisma veritabanı bağlantı dizesi. SQLite için `file:./dosya-adi.db` formatı kullanılır |
| `JWT_SECRET` | ✅ | `freelance-tracker-secret` | JWT token imzalama anahtarı. **Production'da mutlaka değiştirin** |
| `PORT` | ❌ | `5000` | Sunucunun dinleyeceği port numarası |

---

## 🗄 Veritabanı Şeması

Veritabanı 4 tablodan oluşur. Şema dosyası: `prisma/schema.prisma`

### User (Kullanıcı)

| Alan | Tip | Açıklama |
|------|-----|----------|
| `id` | String (UUID) | Birincil anahtar, otomatik üretilir |
| `username` | String | Benzersiz kullanıcı adı |
| `password` | String | bcrypt ile hashlenmiş şifre |
| `fullName` | String | Tam ad soyad |
| `role` | String | `"admin"` veya `"user"` (varsayılan: `"user"`) |
| `createdAt` | DateTime | Oluşturulma tarihi |
| `updatedAt` | DateTime | Son güncelleme tarihi |

### Project (Proje)

| Alan | Tip | Açıklama |
|------|-----|----------|
| `id` | String (UUID) | Birincil anahtar |
| `title` | String | Proje başlığı (zorunlu) |
| `customerName` | String? | Müşteri adı |
| `content` | String? | Proje içeriği / kapsam açıklaması |
| `price` | Float | Anlaşılan fiyat (₺), varsayılan: 0 |
| `deposit` | Float | Depozito / ön ödeme (₺), varsayılan: 0 |
| `startDate` | DateTime? | Başlangıç tarihi |
| `deliveryDate` | DateTime? | Teslim tarihi |
| `status` | String | Proje durumu (varsayılan: `"planning"`) |
| `notes` | String? | İç notlar |
| `completedAt` | DateTime? | Tamamlanma tarihi (otomatik ayarlanır) |
| `createdAt` | DateTime | Oluşturulma tarihi |
| `updatedAt` | DateTime | Son güncelleme tarihi |

### ProjectUser (Proje-Kullanıcı İlişkisi)

| Alan | Tip | Açıklama |
|------|-----|----------|
| `id` | String (UUID) | Birincil anahtar |
| `projectId` | String | İlişkili proje (cascade delete) |
| `userId` | String | İlişkili kullanıcı (cascade delete) |
| `sortOrder` | Int | Sıralama değeri (sürükle-bırak sırası) |

> `projectId + userId` çifti benzersizdir (bir kullanıcı bir projeye yalnızca bir kez atanabilir).

### Extra (Ekstra İstek)

| Alan | Tip | Açıklama |
|------|-----|----------|
| `id` | String (UUID) | Birincil anahtar |
| `label` | String | Açıklama metni |
| `price` | Float | Fiyat (₺), varsayılan: 0 |
| `status` | String | `"pending"`, `"done"` veya `"cancelled"` |
| `projectId` | String | İlişkili proje (cascade delete) |

### İlişki Diyagramı

```
User ──────┐
           │ N:M (ProjectUser aracılığıyla)
Project ───┘
  │
  │ 1:N
  ▼
Extra
```

---

## 📡 API Referansı

Tüm API rotaları `/api` öneki ile başlar. Kimlik doğrulama, HTTP-only cookie'deki JWT token ile yapılır.

### Kimlik Doğrulama (Auth)

| Method | Endpoint | Yetki | Açıklama |
|--------|----------|-------|----------|
| `POST` | `/api/auth/login` | Herkese açık | Giriş yapar, JWT cookie set eder |
| `POST` | `/api/auth/logout` | Herkese açık | Çıkış yapar, cookie temizler |
| `GET` | `/api/auth/me` | Giriş gerekli | Aktif oturumdaki kullanıcı bilgisini döner |

#### `POST /api/auth/login`

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Başarılı Yanıt (200):**
```json
{
  "user": {
    "id": "uuid-string",
    "username": "admin",
    "fullName": "Sistem Yöneticisi",
    "role": "admin"
  }
}
```

**Hata Yanıtları:**
- `400` — `{ "error": "Kullanıcı adı ve şifre gerekli" }`
- `401` — `{ "error": "Geçersiz kullanıcı adı veya şifre" }`

---

### Kullanıcılar (Users)

> ⚠️ Tüm kullanıcı endpointleri **admin** yetkisi gerektirir.

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `GET` | `/api/users` | Tüm kullanıcıları listeler |
| `POST` | `/api/users` | Yeni kullanıcı oluşturur |
| `PUT` | `/api/users/:id` | Kullanıcı bilgilerini günceller |
| `DELETE` | `/api/users/:id` | Kullanıcıyı siler |
| `POST` | `/api/users/:id/reset-password` | Kullanıcının şifresini sıfırlar |

#### `POST /api/users`

**Request Body:**
```json
{
  "username": "yenikullanici",
  "fullName": "Yeni Kullanıcı",
  "role": "user",
  "autoGenerate": true
}
```

Veya manuel şifre ile:
```json
{
  "username": "yenikullanici",
  "fullName": "Yeni Kullanıcı",
  "role": "user",
  "autoGenerate": false,
  "password": "guvenli-sifre-123"
}
```

**Başarılı Yanıt (201):**
```json
{
  "user": {
    "id": "uuid",
    "username": "yenikullanici",
    "fullName": "Yeni Kullanıcı",
    "role": "user",
    "createdAt": "2026-01-01T00:00:00.000Z"
  },
  "generatedPassword": "aB3$xKm9pQ2w"
}
```

> `generatedPassword` yalnızca `autoGenerate: true` olduğunda döner.

#### `POST /api/users/:id/reset-password`

**Request Body:**
```json
{
  "autoGenerate": true
}
```

---

### Projeler (Projects)

> Tüm proje endpointleri **giriş** gerektirir (admin veya normal kullanıcı).

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `GET` | `/api/projects` | Tüm projeleri listeler |
| `POST` | `/api/projects` | Yeni proje oluşturur |
| `PUT` | `/api/projects/:id` | Projeyi günceller |
| `DELETE` | `/api/projects/:id` | Projeyi siler |
| `PUT` | `/api/projects/:id/users` | Proje kullanıcı atamasını günceller |
| `GET` | `/api/projects/export` | Tüm projeleri JSON olarak dışa aktarır (**admin**) |

#### `POST /api/projects`

**Request Body:**
```json
{
  "title": "Web Sitesi Projesi",
  "customerName": "Ahmet Yılmaz",
  "content": "E-ticaret sitesi geliştirme",
  "price": 15000,
  "deposit": 5000,
  "startDate": "2026-01-15",
  "deliveryDate": "2026-03-15",
  "status": "planning",
  "notes": "Responsive tasarım isteniyor",
  "extras": [
    {
      "label": "SEO optimizasyonu",
      "price": 2000,
      "status": "pending"
    }
  ],
  "assignedUsers": ["user-uuid-1", "user-uuid-2"]
}
```

**Başarılı Yanıt (201):**
```json
{
  "id": "uuid",
  "title": "Web Sitesi Projesi",
  "customerName": "Ahmet Yılmaz",
  "status": "planning",
  "price": 15000,
  "deposit": 5000,
  "extras": [...],
  "users": [
    {
      "id": "user-uuid-1",
      "fullName": "Kullanıcı 1",
      "username": "kullanici1",
      "role": "user",
      "sortOrder": 0
    }
  ]
}
```

---

### Uyarılar (Alerts)

| Method | Endpoint | Yetki | Açıklama |
|--------|----------|-------|----------|
| `GET` | `/api/alerts` | Giriş gerekli | Gecikmiş ve yaklaşan teslimatları döner |

**Başarılı Yanıt (200):**
```json
{
  "overdue": [
    {
      "id": "uuid",
      "title": "Geciken Proje",
      "customerName": "Müşteri",
      "deliveryDate": "2026-01-01T00:00:00.000Z",
      "daysOverdue": 5,
      "users": [{ "id": "uuid", "fullName": "Kullanıcı" }]
    }
  ],
  "upcoming": [
    {
      "id": "uuid",
      "title": "Yaklaşan Proje",
      "deliveryDate": "2026-01-20T00:00:00.000Z",
      "daysUntil": 2,
      "users": [...]
    }
  ]
}
```

> Uyarılar yalnızca aktif durumdaki (`planning`, `in_progress`, `review`) projeleri kapsar. "Yaklaşan" teslimatlar 3 gün içindeki projeleri içerir.

---

## 📂 Proje Yapısı

```
nodejstestv2/
├── .env                          # Ortam değişkenleri
├── index.js                      # Express sunucu giriş noktası
├── package.json                  # Backend bağımlılıkları
│
├── middleware/
│   ├── auth.js                   # JWT doğrulama, requireAuth, requireAdmin
│   └── seed.js                   # İlk admin hesabı oluşturma
│
├── routes/
│   ├── auth.js                   # POST login, POST logout, GET me
│   ├── users.js                  # GET, POST, PUT, DELETE kullanıcı; şifre sıfırlama
│   ├── projects.js               # GET, POST, PUT, DELETE proje; kullanıcı ataması; export
│   └── alerts.js                 # GET gecikmiş/yaklaşan teslimatlar
│
├── prisma/
│   ├── schema.prisma             # Veritabanı şema tanımı
│   ├── dev.db                    # SQLite veritabanı dosyası (otomatik oluşur)
│   └── migrations/               # Prisma migration dosyaları
│
└── client/                       # React frontend
    ├── package.json              # Frontend bağımlılıkları
    ├── public/                   # Statik dosyalar (index.html, favicon)
    ├── build/                    # Production build çıktısı (npm run build sonrası)
    └── src/
        ├── index.js              # React giriş noktası
        ├── index.css             # Global stiller
        ├── App.js                # Ana uygulama bileşeni + dashboard
        ├── App.css               # Tüm uygulama stilleri (~2500 satır)
        ├── api.js                # Backend API istemcisi (fetch wrapper)
        ├── constants.js          # Proje/ekstra durum sabitleri ve renkler
        │
        ├── contexts/
        │   └── AuthContext.js    # Oturum yönetimi context'i
        │
        ├── hooks/
        │   └── useProjects.js    # Proje CRUD hook'u
        │
        ├── utils/
        │   ├── dates.js          # Tarih yardımcıları (bugün teslim, gecikme kontrolü)
        │   ├── format.js         # Para birimi ve tarih formatlama
        │   └── stats.js          # İstatistik hesaplama fonksiyonları
        │
        └── components/
            ├── LoginPage.js              # Giriş sayfası
            ├── Header.js                 # Üst başlık çubuğu
            ├── SummaryCards.js            # İstatistik kartları (7 adet)
            ├── ChartsPanel.js            # Pasta + çubuk grafik paneli
            ├── Toolbar.js                # Arama, filtre, sıralama araç çubuğu
            ├── ProjectList.js            # Proje grid listesi
            ├── ProjectCard.js            # Tekil proje kartı
            ├── ProjectFormModal.js        # Proje oluşturma/düzenleme modalı
            ├── Modal.js                  # Yeniden kullanılabilir genel modal
            ├── AlertsModal.js            # Gecikmiş/yaklaşan teslim uyarı modalı
            ├── TodayCheckInModal.js       # Bugün teslim olacak projeler modalı
            ├── TodayDeliveryEntryButton.js # Bugünkü teslimat durum butonu
            ├── UserManagementPanel.js     # Kullanıcı yönetim paneli
            ├── UserFormModal.js           # Kullanıcı oluşturma/düzenleme formu
            ├── DragDropUserAssignment.js  # Sürükle-bırak çalışan ataması
            └── NotificationsPanel.js      # Bildirim paneli
```

---

## 🧩 Frontend Bileşenleri

### Sayfa Bileşenleri

| Bileşen | Dosya | Açıklama |
|---------|-------|----------|
| **LoginPage** | `LoginPage.js` | Glassmorphism tasarımlı giriş formu. Animasyonlu orb'lar, floating grid pattern, shake efekti |
| **Dashboard** | `App.js` | Ana kontrol paneli. SummaryCards, ChartsPanel, Toolbar ve ProjectList'i içerir |

### Veri Görüntüleme

| Bileşen | Dosya | Açıklama |
|---------|-------|----------|
| **SummaryCards** | `SummaryCards.js` | 7 istatistik kartı: toplam proje, aktif, beklenen gelir, toplanan, kalan, ortalama süre, ekstra gelir. Emoji ikonları ve stagger animasyonu |
| **ChartsPanel** | `ChartsPanel.js` | Recharts ile durum dağılımı (PieChart) ve aylık gelir (BarChart) grafikleri |
| **ProjectCard** | `ProjectCard.js` | Tekil proje kartı: başlık, müşteri, durum badge'i, tarih bilgileri, fiyat, kullanıcı chip'leri, düzenle/sil butonları |
| **ProjectList** | `ProjectList.js` | Proje kartlarını CSS Grid ile düzenler |

### Formlar ve Modallar

| Bileşen | Dosya | Açıklama |
|---------|-------|----------|
| **Modal** | `Modal.js` | Yeniden kullanılabilir modal. Portal rendering, focus trap, ESC ile kapatma, body scroll lock, spring animasyonu |
| **ProjectFormModal** | `ProjectFormModal.js` | Kapsamlı proje formu: başlık, müşteri, içerik, fiyat, depozito, tarihler, durum, notlar, ekstra satırlar, sürükle-bırak kullanıcı ataması |
| **UserFormModal** | `UserFormModal.js` | Kullanıcı oluşturma/düzenleme formu: ad, kullanıcı adı, rol seçimi, otomatik/manuel şifre |
| **AlertsModal** | `AlertsModal.js` | Sayfa yüklendiğinde otomatik açılan uyarı modalı. Gecikmiş (kırmızı) ve yaklaşan (sarı) teslimatları listeler |
| **TodayCheckInModal** | `TodayCheckInModal.js` | Bugün teslim tarihli aktif projeleri listeler. "Tamamlandı" veya "Devam ediyor" durumu atanabilir |

### Yardımcı Bileşenler

| Bileşen | Dosya | Açıklama |
|---------|-------|----------|
| **Header** | `Header.js` | Logo, başlık, uyarı butonu, kullanıcı yönetimi butonu (admin), JSON dışa aktar, kullanıcı bilgisi, çıkış |
| **Toolbar** | `Toolbar.js` | Arama kutusu, durum filtresi dropdown, sıralama seçenekleri, yeni proje butonu |
| **UserManagementPanel** | `UserManagementPanel.js` | Admin kullanıcı tablosu, kullanıcı düzenleme/silme/şifre sıfırlama, silme onayı, şifre gösterimi |
| **DragDropUserAssignment** | `DragDropUserAssignment.js` | İki sütunlu (Tüm Kullanıcılar / Atananlar) sürükle-bırak arayüzü. Animasyonlu parçacık efekti |
| **TodayDeliveryEntryButton** | `TodayDeliveryEntryButton.js` | Bugün teslim olan aktif proje varsa gösterilen bildirim butonu |

---

## 👥 Kullanıcı Rolleri ve Yetkilendirme

| Özellik | Admin | Kullanıcı |
|---------|-------|-----------|
| Giriş / Çıkış | ✅ | ✅ |
| Proje listeleme | ✅ | ✅ |
| Proje oluşturma | ✅ | ✅ |
| Proje düzenleme | ✅ | ✅ |
| Proje silme | ✅ | ✅ |
| Uyarıları görüntüleme | ✅ | ✅ |
| Kullanıcı yönetimi | ✅ | ❌ |
| Kullanıcı oluşturma | ✅ | ❌ |
| Şifre sıfırlama | ✅ | ❌ |
| Kullanıcı silme | ✅ | ❌ |
| JSON dışa aktarma | ✅ | ❌ |

---

## 📊 Proje Durumları

| Durum | Kod | Renk | Açıklama |
|-------|-----|------|----------|
| Planlama | `planning` | 🔘 Gri (#94a3b8) | Henüz başlanmamış |
| Devam ediyor | `in_progress` | 🔵 Mavi (#38bdf8) | Aktif olarak üzerinde çalışılıyor |
| İnceleme / Revizyon | `review` | 🟡 Sarı (#fbbf24) | Müşteri incelemesi veya revizyon aşamasında |
| Tamamlandı | `completed` | 🟢 Yeşil (#34d399) | İş tamamlandı |
| İptal | `cancelled` | 🔴 Kırmızı (#f87171) | İş iptal edildi |

### Ekstra İstek Durumları

| Durum | Kod | Açıklama |
|-------|-----|----------|
| Beklemede | `pending` | Henüz tamamlanmamış |
| Tamamlandı | `done` | İş yapıldı |
| İptal | `cancelled` | İptal edildi |

---

## 🎨 Tasarım Sistemi

### CSS Değişkenleri (Custom Properties)

Tüm stiller `App.css` içinde tanımlıdır. Temel CSS değişkenleri:

```css
--ft-bg: #060810;                           /* Ana arka plan */
--ft-surface: rgba(18, 22, 38, 0.68);       /* Kart yüzeyleri */
--ft-surface-2: rgba(24, 30, 50, 0.82);     /* İkincil yüzey */
--ft-border: rgba(148, 163, 184, 0.1);      /* Kenarlık */
--ft-border-glow: rgba(99, 102, 241, 0.15); /* Parlayan kenarlık */
--ft-text: #e8ecf4;                         /* Ana metin rengi */
--ft-muted: #8896b0;                        /* Soluk metin rengi */
--ft-accent: #818cf8;                       /* Vurgu rengi (indigo) */
--ft-accent-2: #2dd4bf;                     /* İkincil vurgu (teal) */
--ft-accent-3: #f472b6;                     /* Üçüncül vurgu (pink) */
--ft-radius: 18px;                          /* Büyük border-radius */
--ft-radius-sm: 12px;                       /* Küçük border-radius */
--ft-shadow: 0 24px 80px rgba(0,0,0,0.55);  /* Gölge */
--ft-glass: blur(20px) saturate(1.6);       /* Glass efekti */
```

### Tasarım Özellikleri

- **Aurora Orb Animasyonları** — Arka planda yüzen 3 renkli gradient orb
- **Noise Texture Overlay** — Premium hissi artıran SVG noise katmanı
- **Glassmorphism** — Bulanık cam efektli kartlar ve modallar
- **Gradient Butonlar** — Animasyonlu gradient shift efektli birincil butonlar
- **Micro-Animasyonlar** — Hover scale, press shrink, stagger entrance efektleri
- **Rounded Modallar** — 28px border-radius modallar, pill-shaped butonlar
- **Responsive Grid** — `auto-fill` / `minmax()` ile otomatik düzenlenen kartlar

### Yazı Tipleri

- **Outfit** — Başlıklar ve önemli metinler
- **DM Sans** — Yedek başlık fontu
- **Sistem fontu** — Gövde metinleri (`font-family: inherit`)

---

## 🌐 Production Dağıtımı

### Temel Adımlar

1. **Ortam değişkenlerini ayarlayın:**
   ```env
   DATABASE_URL="file:./prod.db"
   JWT_SECRET="cok-uzun-ve-rastgele-bir-production-anahtari"
   PORT=80
   ```

2. **Frontend'i build edin:**
   ```bash
   cd client && npm run build && cd ..
   ```

3. **Sunucuyu başlatın:**
   ```bash
   NODE_ENV=production node index.js
   ```

### PM2 ile Çalıştırma (Önerilir)

```bash
# PM2 kurulumu
npm install -g pm2

# Uygulamayı başlatma
pm2 start index.js --name "freelance-tracker"

# Otomatik yeniden başlatma
pm2 startup
pm2 save
```

### Nginx Reverse Proxy (İsteğe Bağlı)

```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Güvenlik Notları

- 🔐 `JWT_SECRET` değerini production'da mutlaka değiştirin
- 🔐 `.env` dosyasını asla versiyon kontrolüne eklemeyin
- 🔐 HTTPS kullanın (cookie güvenliği için)
- 🔐 İlk giriş sonrası admin şifresini değiştirin
- 🔐 Veritabanı dosyasını (`dev.db`) düzenli olarak yedekleyin

---

## ❓ Sorun Giderme

### Sık Karşılaşılan Sorunlar

| Sorun | Çözüm |
|-------|-------|
| `Cannot find module '@prisma/client'` | `npx prisma generate` komutunu çalıştırın |
| `Error: P2021 - Table does not exist` | `npx prisma migrate deploy` komutunu çalıştırın |
| Port 5000 zaten kullanılıyor | `.env` dosyasında `PORT=3001` gibi farklı bir port belirleyin |
| Frontend değişiklikleri yansımıyor | `cd client && npm run build` ile yeniden build alın |
| Login sonrası yönlendirilmiyor | Tarayıcı cookie'lerinin etkin olduğundan emin olun |
| Admin hesabı oluşturulmuyor | Veritabanında zaten kullanıcı var. `prisma/dev.db` dosyasını silip migration'ı yeniden çalıştırın |
| `react-scripts: command not found` | `cd client && npm install` ile frontend bağımlılıklarını yükleyin |
| CORS hatası (dev modda) | `client/package.json`'daki `"proxy"` değerinin `"http://localhost:5000"` olduğundan emin olun |

### Veritabanını Sıfırlama

Tüm verileri silip sıfırdan başlamak için:

```bash
# Veritabanı dosyasını sil
rm prisma/dev.db

# Migration'ları yeniden uygula
npx prisma migrate deploy

# Sunucuyu yeniden başlat (admin hesabı otomatik oluşur)
node index.js
```

### Prisma Studio (Veritabanı Tarayıcısı)

Veritabanını görsel olarak incelemek ve düzenlemek için:

```bash
npx prisma studio
```

Bu komut `http://localhost:5555` adresinde bir veritabanı yönetim arayüzü açar.

---

## 📄 Lisans

ISC
