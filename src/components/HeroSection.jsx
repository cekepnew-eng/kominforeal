// ✅ Mengaktifkan mode client-side (Next.js app router)
// Komponen ini menggunakan useState, useEffect, dan API DOM sehingga harus dijalankan di client.
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Navigation, Autoplay, Pagination } from "swiper/modules";

// Import CSS Swiper (pastikan dependency `swiper` sudah terinstall)
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/navigation";
import "swiper/css/pagination";

// API helper (asumsi: getBanner() mengembalikan Promise yang resolve ke array banner)
// { id: number|string, judul: string, subjudul: string, deskripsi: string, banner_url: string }
import { getBanner } from "../api/bannerApi";

const scrollToLayanan = () => {
  document.getElementById("layanan")?.scrollIntoView({
    behavior: "smooth",
  });
};


const scrollToAbout = () => {
  document.getElementById("tentangkami")?.scrollIntoView({
    behavior: "smooth",
  });
};

/* -------------------------------------
   Komponen utama
   ------------------------------------- */
export default function HeroSectionProfessional() {
  // State untuk menyimpan data banner (array)
  const [banner, setBanner] = useState([]);
  // State loading untuk menampilkan spinner
  const [isLoading, setIsLoading] = useState(true);
  // State error sederhana jika fetch gagal
  const [error, setError] = useState(null);
  // Key untuk memaksa re-mount Swiper saat data baru datang (trik praktis)
  const [swiperKey, setSwiperKey] = useState(0);

  // Refs untuk tombol navigasi Swiper (lebih stabil daripada selector string)
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  useEffect(() => {
    let isMounted = true; // flag untuk mencegah update state setelah unmount

    /**
     * fetchData
     * - Memanggil getBanner() untuk mengambil data banner dari API.
     * - Mengatur state loading / banner / error.
     * - Jika komponen sudah di-unmount, perubahan state diabaikan.
     */
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await getBanner();

        // Validasi sederhana: pastikan result berupa array
        const normalized = Array.isArray(result) ? result : [];

        if (isMounted) {
          setBanner(normalized);
          // Tingkatkan swiperKey agar Swiper re-mount & inisialisasi ulang
          setSwiperKey((prev) => prev + 1);
        }
      } catch (err) {
        // Tangani error jaringan / parsing
        console.error("Gagal ambil data banner:", err);
        if (isMounted) {
          setError("Gagal mengambil data banner. Silakan coba lagi nanti.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    // Cleanup saat unmount: set flag false
    return () => {
      isMounted = false;
    };
    // Kosong dependency -> hanya run sekali saat mount
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-white">
      {/* -----------------------------------
          Background dekoratif (layer z-0)
          ----------------------------------- */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 opacity-30 bg-gradient-to-br from-cyan-50 via-white to-teal-50" />
        <div className="absolute top-0 right-0 hidden rounded-full w-96 h-96 bg-cyan-100 blur-3xl opacity-20 sm:block" />
        <div className="absolute bottom-0 left-0 hidden bg-teal-100 rounded-full w-96 h-96 blur-3xl opacity-20 sm:block" />
        <div
          className="absolute inset-0 hidden opacity-5 md:block"
          style={{
            backgroundImage:
              "linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* -----------------------------------
          Main content (z-10)
          ----------------------------------- */}
        <div className="relative z-10 w-full px-4 pt-20 pb-12 mx-auto max-w-7xl sm:pt-24 sm:pb-16 sm:px-6 lg:px-8">
          {/* Header (judul, deskripsi, CTA) */}
          <div className="mb-8 text-center sm:mb-12 flex flex-col items-center">
            
            {/* ===== BADGE SELAMAT DATANG (VERSI AMAN) ===== */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 text-xs font-medium border rounded-full bg-cyan-50 text-cyan-700 border-cyan-100 shadow-sm sm:text-sm sm:px-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              Selamat Datang di Website Resmi
            </div>
            {/* =========================================== */}

            <h1 className="px-2 mb-3 text-3xl font-bold leading-tight text-gray-900 sm:mb-4 sm:text-4xl lg:text-5xl xl:text-6xl">
              Dinas Komunikasi &amp; Informatika Kota Bogor
            </h1>

          <p className="max-w-3xl px-2 mx-auto mb-6 text-base leading-relaxed text-gray-600 sm:mb-8 sm:text-lg lg:text-xl">
            Membangun ekosistem digital yang inovatif untuk pelayanan publik
            yang lebih cepat, transparan, dan berkualitas tinggi bagi seluruh
            masyarakat Kota Bogor
          </p>

          <div className="flex flex-col justify-center gap-3 px-4 sm:flex-row sm:flex-wrap sm:gap-4 sm:px-0">
            {/* Tombol utama: jelajahi layanan */}
            <button
              onClick={scrollToLayanan}
              className="relative px-6 py-2.5 text-sm font-semibold text-white rounded-lg 
                         bg-gradient-to-r from-cyan-400 to-blue-500 shadow-lg
                         transition-all duration-300 ease-out
                         hover:from-cyan-500 hover:to-blue-600 hover:shadow-xl hover:-translate-y-0.5
                         focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:ring-offset-2
                         sm:px-8 sm:py-3 sm:text-base"
            >
              Jelajahi Layanan
            </button>

            {/* Tombol sekunder: pelajari lebih lanjut */}
            <button
              onClick={scrollToAbout}
              className="px-6 py-2.5 text-sm font-semibold text-gray-700 transition-all duration-300 bg-white border-2 border-gray-300 rounded-lg hover:border-cyan-600 hover:text-cyan-600 hover:-translate-y-0.5 sm:px-8 sm:py-3 sm:text-base"
            >
              Pelajari Lebih Lanjut
            </button>
          </div>
        </div>

        {/* -----------------------------------
            Carousel section
            ----------------------------------- */}
       <div className="relative mb-8 sm:mb-12">
  {isLoading ? (
    <div className="flex items-center justify-center w-full min-h-[320px] sm:min-h-[400px] md:min-h-[480px]">
      <div className="flex flex-col items-center justify-center">
        <svg
          className="w-10 h-10 text-cyan-500 animate-spin sm:w-12 sm:h-12"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <p className="mt-3 text-sm text-gray-500">Memuat banner...</p>
      </div>
    </div>
  ) : error ? (

            // Error UI sederhana: tampilkan pesan error dan fallback CTA
            <div className="w-full pb-8 min-h-[220px] sm:min-h-[280px] md:min-h-[320px] flex items-center justify-center">
              <div className="max-w-2xl px-6 py-5 text-center border border-red-100 rounded-lg bg-red-50">
                <p className="mb-2 text-sm font-semibold text-red-700">Terjadi masalah</p>
                <p className="mb-3 text-xs text-red-600">{error}</p>
                <div>
                  <button
                    onClick={() => {
                      // reload data
                      setIsLoading(true);
                      setError(null);
                      // panggil ulang effect: kita memanggil getBanner langsung agar lebih sederhana
                      getBanner()
                        .then((res) => setBanner(Array.isArray(res) ? res : []))
                        .catch((e) => {
                          console.error(e);
                          setError("Gagal mengambil data banner. Silakan coba lagi nanti.");
                        })
                        .finally(() => setIsLoading(false));
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                  >
                    Coba Lagi
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Data ready: tampilkan Swiper
            <>
              <Swiper
                key={swiperKey}
                modules={[EffectCoverflow, Navigation, Autoplay, Pagination]}
                effect={"coverflow"}
                loop={banner.length > 1}
                centeredSlides={true}
                slidesPerView={"auto"}
                grabCursor={true}
                autoplay={{
                  delay: 5000,
                  disableOnInteraction: false,
                }}
                pagination={{
                  clickable: true,
                  dynamicBullets: true,
                }}
                coverflowEffect={{
                  rotate: 0,
                  stretch: 0,
                  depth: 100,
                  modifier: 2,
                  slideShadows: false,
                }}
                // Gunakan onBeforeInit untuk menetapkan ref elemen navigasi
                onBeforeInit={(swiper) => {
                  // NOTE: swiper.params.navigation.* harus di-assign ke DOM element yang terkini
                  swiper.params.navigation.prevEl = prevRef.current;
                  swiper.params.navigation.nextEl = nextRef.current;
                }}
                // observer membantu Swiper mendeteksi perubahan layout/parent
                observer={true}
                observeParents={true}
                className="w-full pb-8 min-h-[280px] sm:pb-10 sm:min-h-[350px] md:pb-12 md:min-h-[420px]"
              >
                {banner.map((slide, index) => (
                  <SwiperSlide
                    key={`${slide.id || index}-${swiperKey}`}
                    className="!w-[90vw] sm:!w-[85vw] md:!w-[70vw] lg:!w-[750px]"
                  >
                    {({ isActive }) => (
                      <div
                        className={`relative w-full overflow-hidden transition-all duration-700 rounded-xl sm:rounded-2xl group ${
                          isActive ? "shadow-xl sm:shadow-2xl opacity-100" : "opacity-60"
                        }`}
                      >
                        <div className="relative aspect-video">
                          {/* Gambar banner */}
                          <img
                            src={slide.banner_url}
                            alt={slide.judul || "Banner"}
                            width={1600}
                            height={900}
                            loading="lazy"
                            className="object-cover w-full h-full transition-transform duration-[2000ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                            onLoad={(e) => {
                              // Saat gambar selesai load, set opacity agar tampil halus.
                              // Catatan: manipulasi style DOM langsung sederhana & efektif.
                              e.currentTarget.style.opacity = "1";
                            }}
                            style={{
                              opacity: 0,
                              transition: "opacity 0.5s ease-in-out",
                            }}
                          />

                          {/* Overlay gradient untuk meningkatkan kontras teks */}
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent" />

                          {/* Konten teks (subjudul, judul, deskripsi) */}
                          <div
                            className={`absolute inset-0 flex flex-col justify-end p-4 sm:p-6 md:p-8 transition-all duration-700 ${
                              isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
                            }`}
                          >
                            <div className="inline-block px-2.5 py-1 mb-2 text-xs font-semibold tracking-wider uppercase rounded-full text-cyan-400 bg-cyan-500/20 backdrop-blur-sm w-fit sm:px-3 sm:mb-3">
                              {slide.subjudul}
                            </div>
                            <h3 className="mb-1.5 text-xl font-bold text-white sm:mb-2 sm:text-2xl md:text-3xl lg:text-4xl">
                              {slide.judul}
                            </h3>
                            <p className="max-w-xl text-xs text-gray-200 sm:text-sm md:text-base line-clamp-2 sm:line-clamp-none">
                              {slide.deskripsi}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </SwiperSlide>
                ))}

                {/* Custom Navigation - Hidden pada mobile */}
                <div className="absolute z-20 justify-between hidden w-full px-4 -translate-y-1/2 pointer-events-none top-1/2 lg:px-8 sm:flex">
                  {/* Tombol prev  */}
                  <button
                    ref={prevRef}
                    aria-label="Sebelumnya"
                    className="flex items-center justify-center w-10 h-10 text-gray-700 transition-all duration-300 bg-white border-2 border-gray-300 rounded-full shadow-lg pointer-events-auto sm:w-12 sm:h-12 hover:bg-cyan-600 hover:text-white hover:border-cyan-600 hover:scale-110"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                      className="sm:w-5 sm:h-5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M11.354 1.646a.5.5 0 0 1 0 
                           .708L5.707 8l5.647 5.646a.5.5 0 0 
                           1-.708.708l-6-6a.5.5 0 0 1 
                           0-.708l6-6a.5.5 0 0 1 .708 0z"
                      />
                    </svg>
                  </button>

                  {/* Tombol next*/}
                  <button
                    ref={nextRef}
                    aria-label="Berikutnya"
                    className="flex items-center justify-center w-10 h-10 text-gray-700 transition-all duration-300 bg-white border-2 border-gray-300 rounded-full shadow-lg pointer-events-auto sm:w-12 sm:h-12 hover:bg-cyan-600 hover:text-white hover:border-cyan-600 hover:scale-110"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                      className="sm:w-5 sm:h-5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.646 1.646a.5.5 0 0 
                           1 .708 0l6 6a.5.5 0 0 1 0 
                           .708l-6 6a.5.5 0 0 
                           1-.708-.708L10.293 8 
                           4.646 2.354a.5.5 0 0 1 
                           0-.708z"
                      />
                    </svg>
                  </button>
                </div>
              </Swiper>

              {/* Gradient fade di kiri & kanan untuk efek visual (hidden di mobile) */}
              <div className="absolute inset-y-0 left-0 z-10 hidden w-16 pointer-events-none bg-gradient-to-r from-cyan-50 via-white/60 to-transparent sm:block sm:w-20 lg:w-24" />
              <div className="absolute inset-y-0 right-0 z-10 hidden w-16 pointer-events-none bg-gradient-to-l from-cyan-50 via-white/60 to-transparent sm:block sm:w-20 lg:w-24" />
            </>
          )}
        </div>

        {/* -----------------------------------
            Info Banner kecil (CTA kontak)
            ----------------------------------- */}
        <div className="p-4 mt-8 border rounded-lg bg-gradient-to-r from-cyan-50 to-teal-50 border-cyan-200 sm:p-6 sm:mt-12 sm:rounded-xl">
          <div className="flex flex-col items-center justify-between gap-3 sm:gap-4 md:flex-row">
            <div className="flex items-start space-x-3 text-center md:text-left">
              <div className="flex items-center justify-center flex-shrink-0 hidden w-10 h-10 rounded-full bg-cyan-100 text-cyan-600 sm:flex">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="mb-1 text-base font-semibold text-gray-900 sm:text-lg">Butuh Bantuan?</h4>
                <p className="text-xs text-gray-600 sm:text-sm">
                  Tim kami siap membantu Anda 24/7 melalui berbagai saluran komunikasi
                </p>
              </div>
            </div>

            {/* Gunakan link absolute (pastikan route /kontak tersedia) */}
            <a href="/kontak" className="w-full sm:w-auto">
              <div className="px-5 py-2 text-sm font-semibold text-center text-white transition-all duration-300 rounded-lg shadow-md bg-cyan-600 hover:bg-cyan-700 whitespace-nowrap sm:px-6">
                Hubungi Kami
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* -----------------------------------
          Custom pagination style (lokal)
          - Overwrite bullet default Swiper
          ----------------------------------- */}
      <style>{`
        .swiper-pagination-bullet {
          background: #cbd5e1;
          opacity: 1;
          width: 7px;
          height: 7px;
        }
        @media (min-width: 640px) {
          .swiper-pagination-bullet {
            width: 8px;
            height: 8px;
          }
        }
        .swiper-pagination-bullet-active {
          background: linear-gradient(to right, #0891b2, #14b8a6);
          width: 20px;
          border-radius: 4px;
        }
        @media (min-width: 640px) {
          .swiper-pagination-bullet-active {
            width: 24px;
          }
        }
      `}</style>
    </section>
  );
}
