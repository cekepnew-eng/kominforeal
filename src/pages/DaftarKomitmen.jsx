import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";
import { Search } from "lucide-react";
import Swal from "sweetalert2"; // <--- INI JANGAN LUPA DIIMPORT BRO!
import kopSurat from "../assets/kop-diskominfo.png";

export default function DaftarKomitmen() {
  const [listPegawai, setListPegawai] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isAuthorized, setIsAuthorized] = useState(sessionStorage.getItem("komitmen_access") === "true");
  const [isPetugas, setIsPetugas] = useState(false);

  const handleAdminUnlock = async () => {
  const { value: code } = await Swal.fire({
    title: "Otorisasi Petugas",
    input: "password",
    inputLabel: "Masukkan Kode Petugas Renlap",
    inputPlaceholder: "••••••••",
    showCancelButton: true,
    confirmButtonColor: "#4a47a3",
    confirmButtonText: "Buka Akses",
    cancelButtonText: "Batal",
    footer: `
      <div style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
        <input type="checkbox" id="show-password" style="cursor: pointer;">
        <label for="show-password" style="font-size: 14px; cursor: pointer; color: #666;">Lihat Kode</label>
      </div>
    `,
    didOpen: () => {
      const checkbox = document.getElementById('show-password');
      const input = Swal.getInput();
      checkbox.addEventListener('change', () => {
        input.type = checkbox.checked ? 'text' : 'password';
      });
    }
  });

  if (code) {
    try {
      Swal.fire({
        title: 'Memverifikasi...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      const response = await axios.post("https://adm-diskominfo.kotabogor.go.id/api/komitmen/verify-renlap", {
        passcode: code
      });

      // Jika sukses (Status 200)
      if (response.data.success) {
        setIsPetugas(true);
        Swal.fire({
          icon: "success",
          title: "Akses Diberikan",
          text: "Tombol Ekspor PDF aktif.",
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (err) {
      // CEK DISINI: Kalau server ngasih response (seperti 401), berarti koneksi aman tapi data salah
      if (err.response) {
        if (err.response.status === 401 || !err.response.data.success) {
          Swal.fire("Gagal", "Kode Otorisasi Salah!", "error");
        } else {
          Swal.fire("Gagal", "Terjadi kesalahan pada server.", "error");
        }
      } else {
        Swal.fire("Error", "Gagal menyambung ke server. Pastikan Backend jalan.", "error");
      }
    }
  }
}

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isAuthorized) {
      navigate("/komitmen");
    }
  }, [isAuthorized, navigate]);

  useEffect(() => {
    if (!isAuthorized) return;

    fetch("https://adm-diskominfo.kotabogor.go.id/api/komitmen/daftar")
      .then((res) => res.json())
      .then((data) => {
        const results = Array.isArray(data) ? data : (data.data || []);
        const sortedData = results.sort((a, b) => a.id - b.id);
        setListPegawai(sortedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Gagal fetch data:", err);
        setLoading(false);
      });
  }, [isAuthorized]);

  const filteredPegawai = listPegawai.filter((p) =>
    p.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.jabatan.toLowerCase().includes(searchTerm.toLowerCase())
  );  

  const exportToPDF = async () => {
    // Tampilkan loading karena PDF butuh proses berat
    Swal.fire({
      title: 'Sedang Membuat PDF...',
      text: 'Harap tunggu, proses ini melibatkan render gambar.',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });

    try {
      const doc = new jsPDF();
      doc.addImage(kopSurat, 'PNG', 10, 10, 190, 35);
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.text("PAKTA INTEGRITAS", 105, 55, { align: "center" });

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text("Kami, Pegawai Dinas Komunikasi dan Informatika Kota Bogor menyatakan sebagai berikut:", 20, 65);

      const points = [
        "Berperan secara pro-aktif dalam upaya pencegahan dan pemberantasan korupsi, kolusi dan nepotisme serta tidak melibatkan diri dalam perbuatan tercela;",
        "Tidak meminta atau menerima pemberian secara langsung atau tidak langsung berupa suap, hadiah, bantuan, atau bentuk lainnya yang tidak sesuai dengan ketentuan yang berlaku;",
        "Bersikap transparan, jujur, obyektif, dan akuntabel dalam melaksanakan tugas;",
        "Menghindari pertentangan kepentingan (conflict of interest) dalam pelaksanaan tugas;",
        "Memberi contoh dalam kepatuhan terhadap peraturan perundang-undangan dalam melaksanakan tugas secara konsisten;",
        "Akan menyampaikan informasi penyimpangan integritas serta menjaga kerahasiaan saksi atas pelanggaran yang dilaporkannya;",
        "Bila melanggar, saya siap menghadapi segala konsekuensinya."
      ];

      let currentY = 72;
      const marginX = 20;
      const numberWidth = 8; 
      const textMaxWidth = 162; 

      points.forEach((point, index) => {
        const pointNumber = `${index + 1}.`;
        doc.text(pointNumber, marginX, currentY);
        const targetText = "(conflict of interest)";
        
        if (point.includes(targetText)) {
          const parts = point.split(targetText);
          let currentX = marginX + numberWidth;
          doc.setFont("helvetica", "normal");
          doc.text(parts[0], currentX, currentY);
          currentX += doc.getTextWidth(parts[0]);
          doc.setFont("helvetica", "italic");
          doc.text(targetText, currentX, currentY);
          currentX += doc.getTextWidth(targetText);
          doc.setFont("helvetica", "normal");
          doc.text(parts[1], currentX, currentY);
          currentY += 7;
        } else {
          const splitPoint = doc.splitTextToSize(point, textMaxWidth);
          doc.text(splitPoint, marginX + numberWidth, currentY, { align: "justify", maxWidth: textMaxWidth });
          currentY += (splitPoint.length * 5) + 2; 
        }
      });

      const tableRows = listPegawai.map((p, index) => [
        index + 1,
        p.nama,
        p.jabatan,
        p.tanggal_ttd ? p.tanggal_ttd.split(" ")[0] : "-",
        "" 
      ]);

      autoTable(doc, {
        startY: currentY + 5,
        head: [["No", "Nama", "Jabatan", "Tanggal TTD", "Tanda Tangan"]],
        body: tableRows,
        theme: 'grid',
        styles: { fontSize: 9, valign: 'middle', halign: 'center' },
        headStyles: { fillColor: [220, 220, 220],
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          lineWidth: 0.1,
          lineColor: [130, 130, 130] },
        columnStyles: { 4: { cellWidth: 35, minCellHeight: 18 } },
        didDrawCell: (data) => {
          if (data.column.index === 4 && data.cell.section === 'body') {
            const base64Img = listPegawai[data.row.index].signature_base64;
            if (base64Img) {
              doc.addImage(base64Img, 'PNG', data.cell.x + 5, data.cell.y + 2, 25, 12);
            }
          }
        },
      });

      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(`Halaman ${i} dari ${pageCount}`, 195, 287, { align: "right" });
      }

      doc.save("Pakta_Integritas_Diskominfo.pdf");
      Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'File PDF telah diunduh.', timer: 2000, showConfirmButton: false });
    } catch (err) {
      console.error("PDF Error:", err);
      Swal.fire("Error", "Gagal mengekspor PDF. Pastikan data tanda tangan valid.", "error");
    }
  };

  if (!isAuthorized) return <div style={{ minHeight: "100vh", background: "#764ba2" }} />;

  return (
    <>
      <Navbar />
      <div style={{
          minHeight: "100vh",
          padding: isMobile ? "100px 10px 40px 10px" : "120px 40px 40px 40px",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          boxSizing: "border-box"
      }}>
        <div style={{
            width: "100%", maxWidth: "1100px", margin: "auto", background: "#ffffff",
            padding: isMobile ? "20px 15px" : "40px", borderRadius: "24px", boxShadow: "0 20px 60px rgba(0,0,0,0.25)"
        }}>
          <div style={{
            display: "flex", flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center",
            marginBottom: "40px", gap: isMobile ? "20px" : "0"
          }}>
            <div>
              <h1 style={{ color: "#4a47a3", margin: 0, fontWeight: "800", fontSize: isMobile ? "22px" : "28px" }}>Daftar Penandatangan</h1>
              <p style={{ color: "#666", marginTop: "5px" }}>Pegawai yang telah menyetujui Pakta Integritas</p>
            </div>

            <div style={{ display: "flex", gap: "10px", width: isMobile ? "100%" : "auto" }}>    
              {isPetugas ? (
                <button onClick={exportToPDF} style={{
                    padding: "12px 24px", borderRadius: "12px", background: "#ef4444", color: "#fff",
                    fontWeight: "700", border: "none", cursor: "pointer", boxShadow: "0 4px 15px rgba(239, 68, 68, 0.4)"
                }}>
                  Ekspor PDF (Petugas)
                </button>
              ) : (
                <button onClick={handleAdminUnlock} style={{
                    background: "#f8fafc", border: "1px dashed #cbd5e1", color: "#64748b",
                    borderRadius: "12px", padding: "12px 24px", fontWeight: "600", cursor: "pointer"
                }}>
                  🔒 Ekspor Terkunci
                </button>
              )}

              <button 
                onClick={() => navigate("/komitmen")} 
                style={{
                  padding: "12px 24px",
                  borderRadius: "12px",
                  border: "2px solid #4a47a3",
                  background: "transparent",
                  color: "#4a47a3",
                  fontWeight: "700",
                  cursor: "pointer",
                  fontSize: isMobile ? "14px" : "16px",
                  transition: "0.3s"
                }}
                onMouseOver={(e) => { e.target.style.background = "#4a47a3"; e.target.style.color = "#fff"; }}
                onMouseOut={(e) => { e.target.style.background = "transparent"; e.target.style.color = "#4a47a3"; }}
              >
                ← Kembali ke Form
              </button>
            </div>
          </div>

          {/* Kolom Search */}
          <div style={{ position: "relative", marginBottom: "30px" }}>
            <span style={{ position: "absolute", left: "15px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }}>
              <Search size={20} />
            </span>
            <input
              type="text" placeholder="Cari nama atau jabatan..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%", padding: "15px 15px 15px 45px", borderRadius: "15px",
                border: "2px solid #f0f0f0", outline: "none", transition: "0.3s"
              }}
            />
          </div>

          {/* Grid Pegawai */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "50px" }}>Memuat data...</div>
          ) : (
            <div style={{ 
            display: "grid", 
            gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(300px, 1fr))", 
            gap: "20px" 
          }}>
            {filteredPegawai.length > 0 ? (
              filteredPegawai.map((p, index) => (
                <div 
                  key={p.id || index}
                  style={{
                    padding: "25px",
                    borderRadius: "20px",
                    border: "1px solid #f0f0f0",
                    background: "#ffffff",
                    textAlign: "center",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.03)",
                    position: "relative",
                    overflow: "hidden"
                  }}
                >
                  <div style={{ 
                    position: "absolute", 
                    top: "15px", 
                    right: "-35px", 
                    background: "#22c55e", 
                    color: "white", 
                    padding: "5px 40px", 
                    fontSize: "10px", 
                    fontWeight: "bold", 
                    transform: "rotate(45deg)" 
                  }}>
                    Sudah TTD
                  </div>
                  <h3 style={{ margin: "5px 0", color: "#1a1a1a", fontSize: "18px", fontWeight: "600" }}>{p.nama}</h3>
                  <p style={{ color: "#666", fontSize: "14px", marginBottom: "15px" }}>{p.jabatan}</p>
                  
                  <div style={{ 
                    display: "inline-block",
                    padding: "8px 16px",
                    borderRadius: "12px",
                    background: "#f0fdf4",
                    color: "#16a34a",
                    fontSize: "12px",
                    fontWeight: "700",
                    border: "1px solid #bbf7d0",
                    width: "100%",
                    boxSizing: "border-box"
                  }}>
                    Ditandatangani pada: <br/> 
                    <span style={{ color: "#15803d" }}>
                      {p.tanggal_ttd ? p.tanggal_ttd.split(" ")[0] : "-"}
                    </span>
                  </div>
                  
                  {p.signature && (
                    <div style={{ 
                        marginTop: "20px", 
                        paddingTop: "15px", 
                        borderTop: "1px solid #eee",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        minHeight: "80px"
                    }}>
                        <img 
                            src={p.signature} 
                            alt={`TTD ${p.nama}`} 
                            style={{ 
                                maxWidth: "160px", 
                                maxHeight: "70px", 
                                objectFit: "contain",
                                filter: "contrast(1.2) multiply(1.1)"
                            }} 
                        />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px", background: "#f9fafb", borderRadius: "15px" }}>
                <p style={{ color: "#9ca3af", fontSize: "16px" }}>
                  {searchTerm ? `Nama "${searchTerm}" tidak ditemukan.` : "Belum ada data terekam."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </>
  );
}