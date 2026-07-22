import React, { useState, useEffect } from "react";
import { getVideos } from "../api/api";
import SecondaryPageTemplate from "../ui/PageLayout";
import { Loader, AlertCircle, Calendar, Play } from "lucide-react";
import Pagination from "../components/Pagination";

const ITEMS_PER_PAGE = 9;

// --- ✅ Card Video dengan Fitur Play In-Place & Fullscreen ---
const VideoCard = ({ video }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const isYoutube = video.embed_url && (video.embed_url.includes('youtube.com') || video.embed_url.includes('youtu.be'));
  const getYoutubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };
  
  const youtubeId = isYoutube ? video.embed_url.split('/').pop().split('?')[0] : null;

  const formatDate = (dateString) => {
    if (!dateString) return "Tanggal tidak tersedia";
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  return (
    <div className="flex flex-col overflow-hidden transition-all duration-300 bg-white shadow-lg group rounded-xl hover:shadow-2xl">
      <div className="relative bg-black aspect-video overflow-hidden">
        {isPlaying && youtubeId ? (
          <iframe
            // TAMBAHKAN origin={window.location.origin} agar YouTube tidak memblokir domain anda
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&enablejsapi=1&origin=${window.location.origin}`}
            title={video.judul}
            className="w-full h-full"
            frameBorder="0"
            // Tambahkan izin lengkap di bawah ini
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        ) : (
          <div 
            className="relative w-full h-full cursor-pointer" 
            onClick={() => setIsPlaying(true)}
          >
            {youtubeId ? (
              <>
                <img
                  src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
                  alt={video.judul}
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => { e.target.src = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all duration-300">
                  <div className="flex items-center justify-center w-14 h-14 bg-red-600 rounded-full text-white shadow-xl transform transition-transform duration-300 group-hover:scale-110">
                    <Play size={28} fill="currentColor" />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-gray-200">
                <p className="text-gray-400 text-sm">Pratinjau tidak tersedia</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col flex-grow p-4">
        <h3 className="font-bold text-gray-800 text-md line-clamp-2 min-h-[3rem]">
          {video.judul || "Tanpa Judul"}
        </h3>
        <div className="flex items-center mt-4 text-xs text-gray-500 border-t pt-3">
          <Calendar className="inline-block w-3.5 h-3.5 mr-2" />
          <span>{formatDate(video.created_at)}</span>
        </div>
      </div>
    </div>
  );
};

// --- Halaman Utama ---
const VideoPage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const response = await getVideos();
        // Memastikan data di-load dari array yang benar sesuai response API
        const videoData = response.data?.data || response.data || [];
        setVideos(Array.isArray(videoData) ? videoData : []);
      } catch (err) {
        setError("Gagal memuat galeri video.");
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  // Logika Paginasi
  const totalPages = Math.ceil(videos.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentVideos = videos.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const breadcrumb = [
    { label: "Beranda", link: "/" },
    { label: "Galeri", link: "/galeri" },
    { label: "Semua Video" },
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-40">
          <Loader className="animate-spin text-cyan-500 mb-4" size={48} />
          <p className="text-gray-500">Memproses data...</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="py-40 text-center text-red-600">
          <AlertCircle className="mx-auto mb-2" size={48} />
          <p className="text-lg font-medium">{error}</p>
        </div>
      );
    }
    if (videos.length === 0) {
      return <p className="py-40 text-center text-gray-500">Belum ada video yang diunggah.</p>;
    }
    return (
      <>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {currentVideos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
        {totalPages > 1 && (
          <div className="flex justify-center mt-16">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </>
    );
  };

  return (
    <SecondaryPageTemplate title="Galeri Video" breadcrumb={breadcrumb}>
      <div className="container p-6 mx-auto max-w-7xl">
        {renderContent()}
      </div>
    </SecondaryPageTemplate>
  );
};

export default VideoPage;