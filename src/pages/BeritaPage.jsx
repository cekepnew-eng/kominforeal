import React, { useState, useEffect } from "react";
import SecondaryPageTemplate from "../ui/PageLayout";
import NewsCard from "../ui/NewsCard2"; 
import { AlertCircle, Search } from "lucide-react"; // Tambah icon Search

export default function NewsList() {    
  const [newsData, setNewsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      try {
        // Menggunakan menu_id=9 untuk filter berita sesuai database
        const response = await fetch(`/api/pages?menu_id=9&page=${currentPage}&search=${searchTerm}`);
        const result = await response.json();
        
        // Laravel paginate menyimpan data di property 'data'
        setNewsData(result.data || []); 
        setPaginationInfo(result); 
      } catch (err) {
        setError("Gagal memuat berita.");
      } finally {
        setIsLoading(false);
      }
    };
    
    const delayDebounce = setTimeout(() => {
      fetchNews();
    }, 300); 

    return () => clearTimeout(delayDebounce);
  }, [currentPage, searchTerm]);

  return (
    <SecondaryPageTemplate
      title="Berita Terbaru"
      breadcrumb={[
        { label: "Beranda", link: "/" },
        { label: "Berita" },
      ]}
    >
      {/* --- Search Bar sesuai screenshot --- */}
      <div className="relative max-w-2xl mx-auto mb-12">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <Search className="w-5 h-5 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Cari dalam Berita..."
          className="block w-full p-4 pl-12 text-sm text-slate-900 border border-slate-200 rounded-2xl bg-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 shadow-sm transition-all"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reset ke hal 1 saat mencari
          }}
        />
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-slate-200 rounded-2xl h-80 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="py-20 text-center rounded-2xl bg-red-50">
            <AlertCircle className="mx-auto text-red-400" size={48} />
            <p className="mt-4 text-lg text-red-600">{error}</p>
        </div>
      ) : (
        // ✅ Gunakan Fragment <> agar tidak error saat merender banyak div
        <>
          <div className="grid gap-6 md:grid-cols-3">
            {newsData.length > 0 ? (
              newsData.map((news) => (
                <NewsCard key={news.id} news={news} />
              ))
            ) : (
              <div className="col-span-3 py-20 text-center text-slate-500">
                Berita tidak ditemukan.
              </div>
            )}
          </div>

          {/* --- Pagination Controls --- */}
          {paginationInfo?.last_page > 1 && (
            <div className="flex flex-col items-center gap-6 mt-12">
              <div className="flex items-center gap-2">
                {/* Tombol Sebelumnya */}
                <button 
                  disabled={currentPage === 1}
                  onClick={() => {
                    setCurrentPage(p => p - 1);
                    window.scrollTo(0, 0); // Scroll ke atas otomatis
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-50 transition-colors font-medium text-slate-700"
                >
                  Sebelumnya
                </button>
                
                {/* --- Deretan Angka Halaman (1, 2, 3...) --- */}
                <div className="hidden md:flex items-center gap-2">
                  {[...Array(paginationInfo.last_page)].map((_, i) => {
                    const pageNumber = i + 1;
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => {
                          setCurrentPage(pageNumber);
                          window.scrollTo(0, 0);
                        }}
                        className={`w-10 h-10 rounded-xl font-bold transition-all ${
                          currentPage === pageNumber
                            ? "bg-cyan-600 text-white shadow-lg shadow-cyan-200"
                            : "bg-white text-slate-600 border border-slate-200 hover:border-cyan-400"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>

                {/* Info halaman di Mobile */}
                <span className="md:hidden font-semibold text-slate-600">
                  {currentPage} / {paginationInfo?.last_page}
                </span>

                {/* Tombol Selanjutnya */}
                <button 
                  disabled={currentPage === paginationInfo?.last_page}
                  onClick={() => {
                    setCurrentPage(p => p + 1);
                    window.scrollTo(0, 0);
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-50 transition-colors font-medium text-slate-700"
                >
                  Selanjutnya
                </button>
              </div>

              {/* Detail Info Record (Sangat berguna buat user) */}
              <p className="text-sm text-slate-500">
                Menampilkan <span className="font-semibold text-slate-800">{paginationInfo?.from}</span> sampai <span className="font-semibold text-slate-800">{paginationInfo?.to}</span> dari <span className="font-semibold text-slate-800">{paginationInfo?.total}</span> berita
              </p>
            </div>
          )}
        </>
      )}
    </SecondaryPageTemplate>
  );
}