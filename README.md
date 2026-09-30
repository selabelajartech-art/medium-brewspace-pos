# MedPOS - Point of Sale & Cafe System

Aplikasi POS web berbasis React, Tailwind CSS, dan Supabase Backend.

## Fitur Utama
- POS & Kasir dengan Split-Bill (Bagi Rata & Pilih Menu).
- Manajemen Stok Bahan Baku Mentah & Sinkronisasi Otomatis Stok Menu.
- Transaksi Offline-Capable (IndexedDB Fallback).
- Pencetakan Struk via Bluetooth & Sistem OS.

## Struktur Database (Supabase)
- Seluruh DDL SQL & Stored Procedure tersimpan di file `database_master.sql`.
- Fungsi utama checkout: `process_advanced_checkout`.
- Trigger sinkronisasi stok: `sync_inventory_stock_on_ingredient_update`.

## Cara Menjalankan Proyek
1. Clone / Extract repository ini.
2. Jalankan `npm install` di terminal.
3. Buat file `.env` dan isi dengan konfigurasi Supabase:
   ```env
   VITE_SUPABASE_URL=[https://your-project.supabase.co](https://your-project.supabase.co)
   VITE_SUPABASE_ANON_KEY=your-anon-key