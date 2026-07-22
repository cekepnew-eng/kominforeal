import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import banner from "../assets/headerdukungan.jpg";
import Swal from "sweetalert2";
import Navbar from "../components/Navbar";
import axios from "axios";
import Select from "react-select";

export default function Komitmen() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [pegawai, setPegawai] = useState([]);
  const [selectedPegawai, setSelectedPegawai] = useState("");
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);
  const [canvasWidth, setCanvasWidth] = useState(800);
  const sigCanvas = useRef(null);
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(sessionStorage.getItem("komitmen_access") === "true");
  const handleLogout = () => {
      sessionStorage.removeItem("komitmen_access");
      setIsAuthorized(false);
    };

  // 1. Fungsi Fetch Pegawai yang lebih "tahan banting"
  useEffect(() => {
    const handleWindowResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, []);

  const fetchPegawai = () => {
    fetch("https://adm-diskominfo.kotabogor.go.id/api/pegawai")
      .then((res) => res.json())
      .then((data) => {
        // Cek apakah data langsung array atau dibungkus dalam objek .data
        const result = Array.isArray(data) ? data : (data.data || []);
        setPegawai(result);
      })
      .catch((err) => {
        console.error("Error fetching pegawai:", err);
        setPegawai([]); // Reset ke array kosong jika gagal
      });
  };

  const optionsPegawai = pegawai.map((p) => ({
    value: p.id,
    label: `${p.nama} ${p.signature ? "✅ (Sudah Isi)" : ""}`,
    isDisabled: p.signature !== null // Otomatis gak bisa dipilih kalau sudah TTD
  }));

  useEffect(() => {
    if (!isAuthorized) return; 

    fetchPegawai(); // Panggil datanya di sini

    const handleResize = () => {
      if (wrapperRef.current) {
        setCanvasWidth(wrapperRef.current.offsetWidth);
      }
    };

    handleResize();
    const resizeObserver = new ResizeObserver(() => handleResize());
    if (wrapperRef.current) {
      resizeObserver.observe(wrapperRef.current);
    }
    return () => resizeObserver.disconnect();
  }, [isAuthorized]);

  const generateMathCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    return {
      question: `${num1} + ${num2}`,
      answer: num1 + num2
    };
  };

  useEffect(() => {
      if (isAuthorized) return;

      const askPasscode = async () => {
        // Generate captcha baru setiap kali modal muncul
        const captcha = generateMathCaptcha();

        const result = await Swal.fire({
          title: "Otorisasi Pegawai",
          html: `
            <div style="text-align: left; width: 85%; margin: auto;">
              <label style="font-size: 0.85rem; color: #555; font-weight: 600;">Kode Akses:</label>
              <div style="position: relative; margin-top: 5px; margin-bottom: 20px;">
                <input 
                  type="password" 
                  id="swal-input-password" 
                  class="swal2-input" 
                  placeholder="Isi Kode Akses"
                  style="width: 100%; margin: 0; padding-right: 45px; box-sizing: border-box; height: 45px;"
                >
                <button 
                  type="button" 
                  id="toggle-password" 
                  style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); 
                        background: none; border: none; cursor: pointer; font-size: 1.2rem; 
                        z-index: 10; line-height: 1; padding: 5px;"
                >
                  👁️
                </button>
              </div>

              <label style="font-size: 0.85rem; color: #555; font-weight: 600;">Keamanan: Berapa hasil <b>${captcha.question}</b>?</label>
              <div style="margin-top: 5px;">
                <input 
                  type="number" 
                  id="swal-input-captcha" 
                  class="swal2-input" 
                  placeholder="Jawab hitungan"
                  style="width: 100%; margin: 0; box-sizing: border-box; height: 45px; display: block;"
                >
              </div>
            </div>
            <p style="font-size: 0.75rem; color: #888; margin-top: 20px;">Hubungi Admin untuk mendapatkan Kode Akses</p>
          `,
          allowOutsideClick: false,
          allowEscapeKey: false,
          showCancelButton: true,
          cancelButtonText: "⬅ Kembali",
          cancelButtonColor: "#6b7280",
          confirmButtonText: "Verifikasi Akses",
          confirmButtonColor: "#4a47a3",
          showLoaderOnConfirm: true,
          didOpen: () => {
            // Logic toggle password tetap ada
            const input = document.getElementById('swal-input-password');
            const toggleBtn = document.getElementById('toggle-password');
            if (toggleBtn && input) {
              toggleBtn.onclick = (e) => {
                e.preventDefault();
                const isPassword = input.type === 'password';
                input.type = isPassword ? 'text' : 'password';
              };
            }
          },
          preConfirm: async () => {
            const val = document.getElementById('swal-input-password').value.replace(/\s/g, '');
            const captchaUser = document.getElementById('swal-input-captcha').value;

            // Cek Captcha dulu (biar gak buang-buang hit ke API kalau salah hitung)
            if (parseInt(captchaUser) !== captcha.answer) {
              Swal.showValidationMessage(`Hasil hitungan salah!`);
              return false;
            }

            if (!val) {
              Swal.showValidationMessage(`Kode Akses tidak boleh kosong!`);
              return false;
            }

            try {
              const response = await axios.post("https://adm-diskominfo.kotabogor.go.id/api/verify-access", { 
                passcode: val 
              });
              return response.data;
            } catch (err) {
              Swal.showValidationMessage(err.response?.data?.message || "Kode akses salah!");
              return false;
            }
          }
        });

        if (result.isConfirmed && result.value) {
          setIsAuthorized(true);
          sessionStorage.setItem("komitmen_access", "true");
          Swal.fire({ icon: 'success', title: 'Akses Diterima', timer: 1000, showConfirmButton: false });
        } 
        else if (result.dismiss === Swal.DismissReason.cancel) {
          navigate("/"); 
        }
      };

      askPasscode();
    }, [isAuthorized, navigate]);

  // 2. Handler Resize untuk Canvas Signature
  useEffect(() => {
    // Tambahkan kondisi ini: Hanya jalan kalau sudah Authorized
    if (!isAuthorized) return; 

    const handleResize = () => {
      if (wrapperRef.current) {
        setCanvasWidth(wrapperRef.current.offsetWidth);
      }
    };

    handleResize();
    const resizeObserver = new ResizeObserver(() => handleResize());
    if (wrapperRef.current) {
      resizeObserver.observe(wrapperRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [isAuthorized]); // Tambahkan isAuthorized di sini

  const clearSignature = () => {
    sigCanvas.current.clear();
  };

  const handleSubmit = async () => {
    if (!selectedPegawai) {
      Swal.fire({
        icon: "warning",
        title: "Oops...",
        text: "Silakan pilih pegawai terlebih dahulu!",
        confirmButtonColor: "#4a47a3",
      });
      return;
    }

    if (sigCanvas.current.isEmpty()) {
      Swal.fire({
        icon: "warning",
        title: "Tanda tangan kosong",
        text: "Mohon isi tanda tangan terlebih dahulu.",
        confirmButtonColor: "#4a47a3",
      });
      return;
    }
    
    setLoading(true);

    try {
    // --- PROSES TRIM MANUAL ---
    // 1. Ambil canvas asli
    const canvas = sigCanvas.current.getCanvas();
    
    // 2. Buat canvas baru untuk menampung hasil potongan
    const trimmedCanvas = document.createElement('canvas');
    const context = trimmedCanvas.getContext('2d');

    // 3. Deteksi area yang ada coretannya saja
    const width = canvas.width;
    const height = canvas.height;
    const imageData = canvas.getContext('2d').getImageData(0, 0, width, height);
    const data = imageData.data;
    
    let top = height, bottom = 0, left = width, right = 0;

    // Cari batas pixel yang tidak transparan
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const alpha = data[(y * width + x) * 4 + 3];
        if (alpha > 0) {
          if (x < left) left = x;
          if (x > right) right = x;
          if (y < top) top = y;
          if (y > bottom) bottom = y;
        }
      }
    }

    // Jika kosong, pakai canvas asli saja
    if (bottom < top || right < left) {
       var signatureBase64 = canvas.toDataURL("image/png");
    } else {
       // Potong canvas sesuai koordinat coretan (tambah padding 5px)
       const trimmedWidth = (right - left) + 10;
       const trimmedHeight = (bottom - top) + 10;
       trimmedCanvas.width = trimmedWidth;
       trimmedCanvas.height = trimmedHeight;
       
       context.drawImage(canvas, left - 5, top - 5, trimmedWidth, trimmedHeight, 0, 0, trimmedWidth, trimmedHeight);
       var signatureBase64 = trimmedCanvas.toDataURL("image/png");
    }

    try {
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];  
        const res = await fetch("https://adm-diskominfo.kotabogor.go.id/api/komitmen", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        body: JSON.stringify({
            pegawai_id: selectedPegawai,
            signature: signatureBase64, // Kirim hasil getCanvas() biasa
            tanggal_ttd: formattedDate,
        }),
        });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal menyimpan data ke server.");
      }

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Pakta Integritas berhasil ditandatangani.",
        confirmButtonColor: "#43cea2",
      }).then(() => {
        // INI TAMBAHANNYA: Begitu klik OK, langsung pindah halaman
        navigate("/daftar-komitmen"); 
      });

      clearSignature();
      setSelectedPegawai("");
      fetchPegawai(); // Update dropdown untuk men-disable pegawai yang barusan ttd
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Terjadi Kesalahan",
        text: err.message || "Server bermasalah, silakan hubungi admin.",
      });
    } finally {
      setLoading(false);
    }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Terjadi Kesalahan",
        text: err.message || "Server bermasalah, silakan hubungi admin.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthorized) {
      return (
        <div style={{ 
          minHeight: "100vh", 
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <div style={{ color: "white", textAlign: "center" }}>
            <h2>🔒 Menunggu Verifikasi Akses...</h2>
          </div>
        </div>
      );
    }

  return (
    <>
      <Navbar /> 

      <div
        style={{
          minHeight: "100vh",
          padding: isMobile ? "100px 15px 40px 15px" : "120px 40px 40px 40px", 
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          // fontFamily: "'Inter', sans-serif",
          boxSizing: "border-box"
          // padding: "120px 40px 40px 40px", 
          // background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          // fontFamily: "'Inter', sans-serif",
          // filter: isAuthorized ? "none" : "blur(5px)",
          // pointerEvents: isAuthorized ? "all" : "none", 
          // transition: "filter 0.5s ease"
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "900px",
            margin: "auto",
            background: "#ffffff",
            padding: isMobile ? "25px 20px" : "50px", 
            borderRadius: "24px",
            borderTop: "8px solid #4a47a3",
            boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
            position: "relative",
            boxSizing: "border-box"
            // padding: window.innerWidth < 768 ? "20px" : "50px",
            // padding: "50px",
            // borderRadius: "24px",
            // borderTop: "8px solid #4a47a3",
            // boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
            // position: "relative"
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

          <h2 style={{ textAlign: "center", fontWeight: "800", letterSpacing: "1px" }}>
            {/* DINAS KOMUNIKASI DAN INFORMATIKA KOTA BOGOR */}
          </h2>

          <h1 style={{ 
              textAlign: "center", 
              fontWeight: "900", 
              fontSize: isMobile ? "22px" : "28px",
              marginBottom: "30px", 
              color: "#4a47a3",
              letterSpacing: "2px"
          }}>
              PAKTA INTEGRITAS
          </h1>

          <div style={{ 
              color: "#333", 
              lineHeight: "1.8", 
              textAlign: "justify", 
              fontSize: isMobile ? "14px" : "17px",
              padding: "10px"
              }}>
              <p style={{ fontWeight: "600", marginBottom: "15px" }}>
                  Kami, Pegawai Dinas Komunikasi dan Informatika Kota Bogor menyatakan sebagai berikut:
              </p>
              
              <ol style={{ 
                  paddingLeft: "25px", 
                  margin: "0",
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

          {/* DROPDOWN */}
          <div style={{ marginTop: "45px" }}>
            <label style={{ fontWeight: "600", color: "#444", display: "block", marginBottom: "10px" }}>
              Pilih Nama Pegawai:
            </label>
            <Select
              options={optionsPegawai}
              placeholder="-- Cari Nama Pegawai (Ketik di sini) --"
              isSearchable={true}
              isClearable={true}
              value={optionsPegawai.find(opt => opt.value === selectedPegawai)}
              onChange={(selectedOption) => setSelectedPegawai(selectedOption ? selectedOption.value : "")}
              styles={{
                control: (base) => ({
                  ...base,
                  padding: "5px",
                  borderRadius: "12px",
                  border: "1px solid #ddd",
                  boxShadow: "none",
                  "&:hover": { border: "1px solid #4a47a3" }
                }),
                option: (base, state) => ({
                  ...base,
                  // Jika sudah isi (disabled), kasih warna abu-abu. 
                  // Jika belum & sedang di-hover (isFocused), kasih warna ungu muda.
                  backgroundColor: state.isDisabled 
                    ? "#f3f4f6"  // Abu-abu terang untuk yang sudah isi
                    : state.isSelected 
                      ? "#4a47a3" 
                      : state.isFocused 
                        ? "#f0f0ff" 
                        : "#fff",
                  color: state.isDisabled 
                    ? "#9ca3af"  // Teks pudar (greyish) untuk yang sudah isi
                    : state.isSelected 
                      ? "#fff" 
                      : "#333",
                  cursor: state.isDisabled ? "not-allowed" : "default",
                  // Tambahin efek coret kalau mau lebih jelas (opsional)
                  // textDecoration: state.isDisabled ? "line-through" : "none", 
                })
              }}
            />
          </div>

          {/* SIGNATURE */}
          <div style={{ marginTop: "40px" }}>
            <p style={{ fontWeight: "600", marginBottom: "10px", color: "#444" }}>Tanda Tangan:</p>
            <div ref={wrapperRef} style={{ width: "100%", touchAction: "none" }}>
              <SignatureCanvas
                ref={sigCanvas}
                penColor="black"
                canvasProps={{
                  width: canvasWidth,
                  height: 220,
                  style: {
                    width: "100%",
                    height: "220px",
                    border: "2px solid #e5e7eb",
                    borderRadius: "14px",
                    background: "#fafafa",
                    touchAction: "none",
                  },
                }}
              />
            </div>
            <button
              onClick={clearSignature}
              style={{
                marginTop: "14px",
                background: "#ef4444",
                color: "white",
                padding: "10px 22px",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Hapus Tanda Tangan
            </button>
          </div>

          {/* SUBMIT */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: "100%",
              marginTop: isMobile ? "30px" : "50px",
              background: loading ? "#ccc" : "linear-gradient(135deg, #43cea2, #185a9d)",
              color: "white",
              padding: "18px",
              border: "none",
              borderRadius: "14px",
              fontSize: "18px",
              fontWeight: "700",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "0.3s",
            }}
          >
            {loading ? "Sedang Memproses..." : "Tanda Tangani Pakta Integritas"}
          </button>

          {/* FOOTER ACTION */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
            <button
              onClick={() => navigate("/daftar-komitmen")}
              style={{
                padding: "12px 25px",
                background: "linear-gradient(135deg, #c9d068, #2fa711)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: "700",
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
              }}
            >
              Lihat Pegawai yang Sudah Mengisi →
            </button>
          </div>
        </div>
      </div>
    </>
  );
}