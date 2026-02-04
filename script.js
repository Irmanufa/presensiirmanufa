// ============================================
// IRMAS ABSENSI - WITH PDF GENERATION
// ============================================

// Configuration
const CONFIG = {
  WHATSAPP_NUMBER: "+6289657751448",
  DIVISI_LIST: [
    "Keagamaan",
    "Humas",
    "Sekretariat",
    "Pubdekdok",
    "PHBI",
    "PSDM",
    "BPH",
  ],
  ABSENSI_DATA: [], // Untuk menyimpan data sebelum PDF
};

// State
let currentDivisi = CONFIG.DIVISI_LIST[0];

// Initialize App
function initializeApp() {
  updateClock();
  setInterval(updateClock, 1000);
  setupForm();
}

// Update Clock
function updateClock() {
  const timeElement = document.getElementById("currentTime");
  if (timeElement) {
    const now = new Date();
    timeElement.textContent = now.toLocaleTimeString("id-ID");
  }
  updatePreview();
}

// Setup Form
function setupForm() {
  const form = document.getElementById("absensiForm");
  const inputs = form.querySelectorAll("input, textarea");

  inputs.forEach((input) => {
    input.addEventListener("input", updatePreview);
    input.addEventListener("change", updatePreview);
  });

  updatePreview();
}

// Select Divisi
window.selectDivisi = function (element, divisi) {
  document.querySelectorAll(".divisi-option").forEach((opt) => {
    opt.classList.remove("active");
  });

  element.classList.add("active");
  currentDivisi = divisi;
  updatePreview();
};

// Update Preview
function updatePreview() {
  const nama = document.getElementById("nama")?.value || "[Nama Lengkap]";
  const kegiatan = document.getElementById("kegiatan")?.value || "[Nama Kegiatan]";
  const catatan = document.getElementById("catatan")?.value || "";

  const today = new Date();
  const dateStr = today.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeStr = today.toLocaleTimeString("id-ID");

  let message = `ABSENSI IRMAS NURUL FALAH\n\n`;
  message += `Tanggal: ${dateStr}\n`;
  message += `Waktu: ${timeStr}\n\n`;
  message += `Nama: ${nama}\n`;
  message += `Divisi: ${currentDivisi}\n`;
  message += `Kegiatan: ${kegiatan}\n`;

  if (catatan) {
    message += `Catatan: ${catatan}\n`;
  }

  message += `\nData dikirim via Sistem Absensi IRMAS`;

  const previewElement = document.getElementById("previewMessage");
  if (previewElement) {
    previewElement.textContent = message;
  }
}

// ============================================
// PDF GENERATION FUNCTION
// ============================================

window.generatePDF = function() {
  const nama = document.getElementById("nama").value.trim();
  const kegiatan = document.getElementById("kegiatan").value.trim();
  const catatan = document.getElementById("catatan").value.trim();
  
  if (!nama || !kegiatan) {
    alert("Harap isi nama dan kegiatan sebelum membuat PDF!");
    return;
  }

  const today = new Date();
  const dateStr = today.toLocaleDateString("id-ID");
  const timeStr = today.toLocaleTimeString("id-ID");
  const timestamp = today.getTime();
  
  // Simpan data ke array
  const absensiData = {
    id: timestamp,
    nama: nama,
    divisi: currentDivisi,
    kegiatan: kegiatan,
    catatan: catatan,
    tanggal: dateStr,
    waktu: timeStr,
    timestamp: today.toISOString()
  };
  
  CONFIG.ABSENSI_DATA.push(absensiData);
  
  // Buat PDF
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(0, 102, 204);
  doc.text("FORMULIR ABSENSI", 105, 15, null, null, 'center');
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text("IRMAS NURUL FALAH", 105, 22, null, null, 'center');
  
  // Garis pembatas
  doc.setDrawColor(0, 102, 204);
  doc.setLineWidth(0.5);
  doc.line(10, 25, 200, 25);
  
  // Data Absensi
  doc.setFontSize(11);
  let yPosition = 35;
  
  doc.setFont("helvetica", "bold");
  doc.text("ID Absensi:", 20, yPosition);
  doc.setFont("helvetica", "normal");
  doc.text(`IRMAS-${timestamp}`, 60, yPosition);
  
  yPosition += 8;
  doc.setFont("helvetica", "bold");
  doc.text("Tanggal:", 20, yPosition);
  doc.setFont("helvetica", "normal");
  doc.text(dateStr, 60, yPosition);
  
  yPosition += 8;
  doc.setFont("helvetica", "bold");
  doc.text("Waktu:", 20, yPosition);
  doc.setFont("helvetica", "normal");
  doc.text(timeStr, 60, yPosition);
  
  yPosition += 15;
  doc.setFont("helvetica", "bold");
  doc.text("Nama Lengkap:", 20, yPosition);
  doc.setFont("helvetica", "normal");
  doc.text(nama, 60, yPosition);
  
  yPosition += 8;
  doc.setFont("helvetica", "bold");
  doc.text("Divisi:", 20, yPosition);
  doc.setFont("helvetica", "normal");
  doc.text(currentDivisi, 60, yPosition);
  
  yPosition += 8;
  doc.setFont("helvetica", "bold");
  doc.text("Kegiatan:", 20, yPosition);
  doc.setFont("helvetica", "normal");
  // Handle text yang panjang
  const splitKegiatan = doc.splitTextToSize(kegiatan, 130);
  doc.text(splitKegiatan, 60, yPosition);
  yPosition += (splitKegiatan.length * 5);
  
  if (catatan) {
    yPosition += 5;
    doc.setFont("helvetica", "bold");
    doc.text("Catatan:", 20, yPosition);
    doc.setFont("helvetica", "normal");
    const splitCatatan = doc.splitTextToSize(catatan, 130);
    doc.text(splitCatatan, 60, yPosition);
    yPosition += (splitCatatan.length * 5);
  }
  
  yPosition += 15;
  doc.setDrawColor(150, 150, 150);
  doc.setLineWidth(0.3);
  doc.line(10, yPosition, 200, yPosition);
  
  yPosition += 10;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.text("Dokumen ini digenerate otomatis oleh Sistem Absensi IRMAS", 105, yPosition, null, null, 'center');
  
  // Simpan PDF
  const fileName = `Absensi_${nama.replace(/\s+/g, '_')}_${dateStr.replace(/\//g, '-')}.pdf`;
  doc.save(fileName);
  
  alert(`PDF berhasil dibuat: ${fileName}`);
  
  return absensiData;
};

// ============================================
// SUBMIT ABSENSI WITH PDF OPTION
// ============================================

window.submitAbsensi = function (e, withPDF = false) {
  e.preventDefault();

  const nama = document.getElementById("nama").value.trim();
  const kegiatan = document.getElementById("kegiatan").value.trim();
  const catatan = document.getElementById("catatan").value.trim();

  if (!nama || !kegiatan) {
    alert("Harap isi nama dan kegiatan!");
    return false;
  }

  // Jika mode dengan PDF, generate dulu
  let pdfData = null;
  if (withPDF) {
    pdfData = window.generatePDF();
    if (!pdfData) return false;
  }

  const today = new Date();
  const dateStr = today.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeStr = today.toLocaleTimeString("id-ID");

  // WhatsApp message
  let message = `ABSENSI IRMAS NURUL FALAH%0A%0A`;
  message += `Tanggal: ${dateStr}%0A`;
  message += `Waktu: ${timeStr}%0A%0A`;
  message += `Nama: ${encodeURIComponent(nama)}%0A`;
  message += `Divisi: ${currentDivisi}%0A`;
  message += `Kegiatan: ${encodeURIComponent(kegiatan)}%0A`;

  if (catatan) {
    message += `Catatan: ${encodeURIComponent(catatan)}%0A`;
  }

  // Tambahkan info PDF jika dibuat
  if (withPDF && pdfData) {
    message += `%0A✅ PDF Absensi telah dibuat%0A`;
    message += `ID: IRMAS-${pdfData.id}%0A`;
  }

  message += `%0AData dikirim via Sistem Absensi IRMAS`;

  const whatsappUrl = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${message}`;

  // Show loading
  const btn = document.querySelector(".submit-btn");
  const original = btn.innerHTML;
  btn.innerHTML = 'MENGIRIM...';
  btn.disabled = true;

  // Open WhatsApp
  setTimeout(() => {
    window.open(whatsappUrl, "_blank");

    // Reset form setelah delay
    setTimeout(() => {
      document.getElementById("absensiForm").reset();

      document.querySelectorAll(".divisi-option").forEach((opt, idx) => {
        opt.classList.remove("active");
        if (idx === 0) opt.classList.add("active");
      });
      currentDivisi = CONFIG.DIVISI_LIST[0];

      btn.innerHTML = original;
      btn.disabled = false;
      updatePreview();

      alert("Absensi berhasil dikirim ke WhatsApp!");
    }, 1500);
  }, 500);

  return false;
};

// ============================================
// TAMPILKAN DATA TERKUMUL
// ============================================

window.showAbsensiData = function() {
  if (CONFIG.ABSENSI_DATA.length === 0) {
    alert("Belum ada data absensi yang terkumpul.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  // Header Laporan
  doc.setFontSize(18);
  doc.setTextColor(0, 102, 204);
  doc.text("LAPORAN ABSENSI TERKUMUL", 105, 15, null, null, 'center');
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text("IRMAS NURUL FALAH", 105, 22, null, null, 'center');
  
  const today = new Date();
  const dateStr = today.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  doc.setFontSize(10);
  doc.text(`Dicetak pada: ${dateStr}`, 105, 28, null, null, 'center');
  
  // Tabel data
  let yPosition = 40;
  let page = 1;
  
  // Header tabel
  doc.setFillColor(230, 240, 255);
  doc.rect(10, yPosition, 190, 8, 'F');
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("No", 15, yPosition + 6);
  doc.text("Nama", 30, yPosition + 6);
  doc.text("Divisi", 80, yPosition + 6);
  doc.text("Kegiatan", 120, yPosition + 6);
  doc.text("Waktu", 170, yPosition + 6);
  
  yPosition += 10;
  
  // Isi tabel
  CONFIG.ABSENSI_DATA.forEach((data, index) => {
    // Cek jika perlu page baru
    if (yPosition > 270) {
      doc.addPage();
      page++;
      yPosition = 20;
      
      // Header tabel di page baru
      doc.setFillColor(230, 240, 255);
      doc.rect(10, yPosition, 190, 8, 'F');
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("No", 15, yPosition + 6);
      doc.text("Nama", 30, yPosition + 6);
      doc.text("Divisi", 80, yPosition + 6);
      doc.text("Kegiatan", 120, yPosition + 6);
      doc.text("Waktu", 170, yPosition + 6);
      yPosition += 10;
    }
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(`${index + 1}`, 15, yPosition + 5);
    doc.text(data.nama.substring(0, 20), 30, yPosition + 5);
    doc.text(data.divisi, 80, yPosition + 5);
    doc.text(data.kegiatan.substring(0, 25), 120, yPosition + 5);
    doc.text(data.waktu.substring(0, 8), 170, yPosition + 5);
    
    yPosition += 7;
  });
  
  // Footer
  const totalPages = doc.getNumberOfPages();
  for(let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(`Halaman ${i} dari ${totalPages}`, 105, 285, null, null, 'center');
    doc.text(`Total Absensi: ${CONFIG.ABSENSI_DATA.length}`, 105, 290, null, null, 'center');
  }
  
  doc.save(`Laporan_Absensi_${today.getTime()}.pdf`);
};

// Make functions available globally
window.initializeApp = initializeApp;