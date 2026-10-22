# Portofolio Gastin — Frontend (React + Vite)

Port dari landing page portofolio satu file HTML ke React (JSX + Vite), mengikuti `design.md`.

## Menjalankan

```bash
cd frontend
npm install
npm run dev      # dev server
npm run build    # build produksi ke dist/
npm run preview  # preview hasil build
```

## Struktur

```
frontend/
├── index.html              # entry HTML (font Google dimuat di sini)
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx            # entry React
    ├── App.jsx             # komposisi halaman
    ├── index.css           # seluruh stylesheet (port 1:1 dari HTML sumber)
    ├── i18n/
    │   ├── content.js      # kamus konten ID / EN
    │   └── LangContext.jsx # context bahasa + localStorage
    └── components/
        ├── Navbar.jsx      # kapsul glass desktop + toggle ID/EN ("on-dark" otomatis)
        ├── Hero.jsx        # scrollytelling 460vh (progres scroll → animasi)
        ├── About.jsx       # seksi gelap "Tentang"
        ├── Work.jsx        # grid 4 kartu proyek
        ├── Services.jsx    # 4 kolom layanan
        ├── ContactCTA.jsx  # panel CTA kobalt
        ├── Footer.jsx      # tautan sosial
        ├── TabBar.jsx      # navigasi bawah mobile + scroll-spy
        └── ThankYou.jsx    # footer reveal merah
```

## Catatan

- **Logika scroll** (hero scrollytelling, reveal "Thank you", scroll-spy, on-dark)
  dipindahkan ke `useEffect` dengan ref — matematika progres (0–1) sama
  persis dengan JS asli, sehingga animasinya reversibel mengikuti scroll.
- **Bahasa**: toggle ID/EN di Navbar & TabBar menyimpan pilihan ke
  `localStorage` (`lang`). Semua teks bersumber dari `src/i18n/content.js`.
- **Perbaikan posisi hero awal**: pada HTML asli, kompensasi `padding-top`
  memakai tinggi penuh konten tersembunyi sehingga foto + "Halo" terdorong
  ke bawah. Di `Hero.jsx` kompensasi memakai **setengah** tinggi konten
  tersembunyi (`(l2 + bio) / 2`), sehingga komposasi awal tepat di tengah
  layar dan tetap bergeser mulus ke atas saat konten bio muncul.
- **Placeholder yang perlu diganti** (lihat design.md §8): logo
  (`images/logo.svg`, sudah disiapkan komentar),
  preview kartu proyek (`images/p1..4.jpg`), tautan sosial (`#`),
  dan file `frontend/public/cv/Gastin-Alfiansa-CV.pdf`.
  (Foto hero `.photo.pic` sudah terpasang: `frontend/public/images/gastin-hero.png`.)
