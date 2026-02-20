# Ready Asset Template

🚀 **Yeni projeler için hazır Nuxt.js template'i**

Modern full-stack web uygulamaları için temiz ve güçlü bir başlangıç şablonu. Hızlı proje başlatma ve deployment için optimize edilmiş altyapı.

- [NuxtHub Dokümantasyonu](https://hub.nuxt.com)

## Özellikler

- ⚡ **Nuxt 4** - En son Nuxt sürümü
- 🚀 **NuxtHub** - Edge'de full-stack uygulamalar
- 🎨 **Nuxt UI** - Modern UI bileşenleri
- 🎯 **TailwindCSS** - Utility-first CSS framework
- 📝 **TypeScript** - Tip güvenliği
- 🔧 **ESLint** - Kod kalitesi
- 🔄 **CI/CD** - GitHub Actions ile otomatik deployment
- 📦 **pnpm** - Hızlı paket yöneticisi

## Kurulum

Bağımlılıkları [pnpm](https://pnpm.io) ile kurun:

```bash
pnpm install
```

## Geliştirme

Development sunucusunu `http://localhost:3000` adresinde başlatın:

```bash
pnpm dev
```

## Production

Uygulamayı production için build edin:

```bash
pnpm build
```

## Deployment

### NuxtHub

NuxtHub ile deploy etmek için:

```bash
npx nuxthub deploy
```

### Vercel

#### 🚀 Hızlı Deploy (Temel)

1. **Vercel CLI kurulumu:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy et:**
   ```bash
   npx vercel
   ```
   
3. **Production deploy:**
   ```bash
   npx vercel --prod
   ```

#### ⚙️ NuxtHub Özellikleri ile Deploy

NuxtHub özelliklerini (Database, Blob, KV) kullanacaksan:

**1. Vercel Dashboard'da Storage Oluştur:**
- [Vercel Dashboard](https://vercel.com/dashboard) → Storage sekmesi
- **Database**: Turso SQLite database oluştur
- **Blob**: Vercel Blob store oluştur  
- **KV**: Upstash Redis database oluştur

**2. Environment Variables Ekle:**
Vercel Dashboard → Proje → Settings → Environment Variables:

```bash
# Database (Turso)
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-auth-token

# Blob Storage (Vercel Blob)
BLOB_READ_WRITE_TOKEN=your-blob-token

# KV Storage (Upstash Redis)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

**3. Deploy:**
```bash
pnpm run deploy-vercel
```

#### 🔄 Git ile Otomatik Deploy

1. **GitHub'a push et**
2. **Vercel'de import et:**
   - [Vercel Dashboard](https://vercel.com/dashboard) → Add New → Project
   - GitHub repository'ni seç
   - Deploy butonuna bas

**Her git push otomatik deploy tetikler!**

#### 📋 Vercel Deploy Checklist

- [ ] `pnpm install` çalışıyor
- [ ] `pnpm build` başarılı
- [ ] Environment variables eklendi (NuxtHub kullanıyorsan)
- [ ] Domain ayarları yapıldı (opsiyonel)
- [ ] SSL sertifikası aktif (otomatik)

### Cloudflare

Cloudflare Pages'e deploy etmek için:

```bash
pnpm build
npx wrangler pages deploy dist/
```

## NuxtHub Özellikleri

İhtiyacınıza göre şu NuxtHub özelliklerini ekleyebilirsiniz:

- **Database**: `hubDatabase()` - SQLite database
- **Blob Storage**: `hubBlob()` - Dosya depolama
- **KV Storage**: `hubKV()` - Key-value depolama
- **Cache**: `hubCache()` - Önbellekleme

Detaylar için [NuxtHub dokümantasyonunu](https://hub.nuxt.com/docs) inceleyin.
