export function humanizeMessage(message?: string) {
  if (!message) {
    return "Terjadi kendala. Silakan coba lagi.";
  }

  const text = message.toLowerCase();

  if (text.includes("unauthorized")) {
    return "Sesi Anda sudah berakhir. Silakan login kembali.";
  }
  if (text.includes("forbidden")) {
    return "Anda tidak memiliki akses untuk melakukan aksi ini.";
  }
  if (text.includes("invalid payload")) {
    return "Data yang dikirim belum lengkap atau formatnya belum sesuai.";
  }
  if (text.includes("username already exists")) {
    return "Username sudah digunakan. Silakan pakai username lain.";
  }
  if (text.includes("statement not found")) {
    return "Sebagian statement tidak ditemukan untuk account yang dipilih.";
  }
  if (text.includes("failed to connect to s3")) {
    return "Koneksi ke penyimpanan file sedang bermasalah. Coba lagi beberapa saat.";
  }
  if (text.includes("no matching files")) {
    return "Belum ada file yang cocok untuk periode ini. Coba cek tahun/bulan.";
  }
  if (text.includes("password")) {
    return "Aksi terkait password tidak berhasil. Silakan coba lagi.";
  }

  return message;
}
