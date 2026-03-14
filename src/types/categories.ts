// Category Types
export interface Category {
  id: string;
  tenChungLoai: string;
  donVi: string;
  gia: number;
  moTa?: string;
  ghiChu?: string;
  createdAt: string;
}

// Machine Types  
export interface Machine {
  id: string;
  // UI-friendly name
  tenMay: string;
  // legacy/optional identifiers
  maMay?: string;
  loaiMay?: string;

  // pricing variants (some pages use these names)
  giaGioSang?: number;
  giaGioChieu?: number;
  giaGioToi?: number;

  // alternate naming conventions used in oil export
  giaGio8h1Ca?: number;
  giaGio10h1Ca?: number;
  giaGio8h2Ca?: number;
  giaGio10h2Ca?: number;
  giaGio12h1Ca?: number;

  // optional metadata
  moTa?: string;
  ghiChu?: string;

  // optional QR payload stored with the machine
  qrData?: string;

  createdAt: string;
}

// Warehouse Types - Only tenKho and ghiChu
export interface Warehouse {
  id: string;
  tenKho: string;
  loaiKho?: string;
  ghiChu?: string;
  createdAt: string;
}

// User Types
export interface User {
  id: string;
  hoTen: string;
  msnv: string;
  chucVu: string;
  phongBan: string;
  // compatibility / legacy fields used across UI
  chucDanh?: string;
  boPhan?: string;
  matKhau?: string;
  vaiTro?: 'admin' | 'manager' | 'user';
  trangThai?: 'active' | 'inactive';
  name?: string;
  username?: string;
  lastLogin?: string | Date;
  email?: string;
  soDienThoai?: string;
  createdAt: string;
}