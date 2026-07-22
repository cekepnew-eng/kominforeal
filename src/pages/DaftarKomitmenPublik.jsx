import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import banner from "../assets/headerdukungan.jpg";

export default function DaftarKomitmenPublik() {
  const [listPegawai, setListPegawai] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
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
  }, []);

  return (
    <>
      <Navbar />
      <div
        style={{
          minHeight: "100vh",
          padding: isMobile ? "90px 10px 40px 10px" : "120px 40px 40px 40px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            boxSizing: "border-box"
        //   fontFamily: "'Inter', sans-serif",
        }}
      >
        <div
          style={{
            width: "100%", 
            maxWidth: "1100px",
            margin: "auto",
            background: "#ffffff",
            // GANTI baris padding ini:
            padding: isMobile ? "20px 15px" : "50px",
            borderRadius: "24px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
            boxSizing: "border-box"
          }}
        >
          <img
            src={banner}
            alt="Header Dukungan"
            style={{
              width: "100%",
              borderRadius: "16px",
              marginBottom: "30px",
              boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
            }}
          />

          <h1 style={{ 
              textAlign: "center", 
                fontWeight: "900", 
                fontSize: isMobile ? "22px" : "28px", // Responsif
                marginBottom: "30px", 
                color: "#4a47a3",
                letterSpacing: "1px"
          }}>
              PAKTA INTEGRITAS
          </h1>

          <div style={{ 
                color: "#333", 
                lineHeight: "1.6", 
                textAlign: "justify", 
                fontSize: isMobile ? "13px" : "15px", // Lebih kecil di HP
                padding: isMobile ? "15px" : "20px", 
                background: "#f8f9fa",
                borderRadius: "15px",
                marginBottom: "40px",
                borderLeft: "5px solid #4a47a3"
            }}>
                <p style={{ fontWeight: "600", marginBottom: "15px" }}>
                    Kami, Pegawai Dinas Komunikasi dan Informatika Kota Bogor menyatakan sebagai berikut:
                </p>
                <ol style={{ 
                    paddingLeft: "30px", 
                    margin: "0", 
                    fontSize: "14px",
                    listStyleType: "decimal" 
                }}>
                    <li style={{ marginBottom: "12px", paddingLeft: "10px" }}>
                        Berperan secara pro-aktif dalam upaya pencegahan dan pemberantasan korupsi, kolusi dan nepotisme serta tidak melibatkan diri dalam perbuatan tercela;
                    </li>
                    <li style={{ marginBottom: "12px", paddingLeft: "10px" }}>
                        Tidak meminta atau menerima pemberian secara langsung atau tidak langsung berupa suap, hadiah, bantuan, atau bentuk lainnya yang tidak sesuai dengan ketentuan yang berlaku;
                    </li>
                    <li style={{ marginBottom: "12px", paddingLeft: "10px" }}>
                        Bersikap transparan, jujur, obyektif, dan akuntabel dalam melaksanakan tugas;
                    </li>
                    <li style={{ marginBottom: "12px", paddingLeft: "10px" }}>
                        Menghindari pertentangan kepentingan <i>(conflict of interest)</i> dalam pelaksanaan tugas;
                    </li>
                    <li style={{ marginBottom: "12px", paddingLeft: "10px" }}>
                        Memberi contoh dalam kepatuhan terhadap peraturan perundang-undangan dalam melaksanakan tugas secara konsisten;
                    </li>
                    <li style={{ marginBottom: "12px", paddingLeft: "10px" }}>
                        Akan menyampaikan informasi penyimpangan integritas serta menjaga kerahasiaan saksi atas pelanggaran yang dilaporkannya;
                    </li>
                    <li style={{ marginBottom: "12px", paddingLeft: "10px", fontWeight: "700" }}>
                        Bila melanggar, saya siap menghadapi segala konsekuensinya.
                    </li>
                </ol>
            </div>

          <hr style={{ border: "0", borderTop: "1px solid #eee", marginBottom: "40px" }} />

          {loading ? (
            <div style={{ textAlign: "center", padding: "50px" }}>
              <p>Memuat data...</p>
            </div>
          ) : (
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(280px, 1fr))", 
              gap: isMobile ? "15px" : "25px" 
            }}>
              {listPegawai.map((p, index) => (
                <div key={p.id || index} style={{
                    padding: "25px",
                    borderRadius: "20px",
                    border: "1px solid #f0f0f0",
                    background: "#ffffff",
                    textAlign: "center",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.03)",
                    position: "relative",
                    overflow: "hidden"
                }}>
                  <div style={{ 
                    position: "absolute", 
                    top: "12px", 
                    right: "-30px", 
                    background: "#22c55e", 
                    color: "white", 
                    padding: "4px 30px", 
                    fontSize: "9px", 
                    fontWeight: "bold", 
                    transform: "rotate(45deg)" 
                  }}>
                    Sudah TTD
                  </div>

                  <h3 style={{ margin: "5px 0", color: "#1a1a1a", fontSize: "18px", fontWeight: "600" }}>{p.nama}</h3>
                  <p style={{ color: "#666", fontSize: "14px", marginBottom: "20px" }}>{p.jabatan}</p>
                  
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
                      {/* Fungsi split memisahkan '2026-02-05 12:28:25' menjadi ['2026-02-05', '12:28:25'] */}
                      {p.tanggal_ttd ? p.tanggal_ttd.split(" ")[0] : "-"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}