import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Camera, ArrowRight, Loader, X } from "lucide-react";
import { getAlbums, getPhotos, getVideos } from "../api/api";
import SecondaryPageTemplate from "../ui/PageLayout";

// --- PHOTO CARD ---
const PhotoCard = ({ photo, onClick }) => (
  <div
    onClick={() => onClick(photo)}
    className="cursor-pointer overflow-hidden bg-white rounded-xl shadow-md group transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
  >
    <div className="relative aspect-square overflow-hidden">
      <img
        src={photo.file_url}
        alt={photo.judul}
        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
        loading="lazy"
      />
      <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-0 bg-black/20 group-hover:opacity-100">
        <div className="p-2 bg-white/20 backdrop-blur-md rounded-full">
          <Camera className="text-white" size={24} />
        </div>
      </div>
    </div>
    <div className="p-3 bg-white border-t border-gray-50">
      <h3 className="text-sm font-semibold text-gray-700 truncate group-hover:text-cyan-600 transition-colors">
        {photo.judul || "Tanpa Judul"}
      </h3>
    </div>
  </div>
);

// --- ALBUM CARD ---
const AlbumCard = ({ album }) => (
  <Link
    to={`/galeri/album/${album.id}`}
    className="block w-full overflow-hidden transition-all duration-300 bg-white shadow-lg group rounded-xl hover:shadow-2xl hover:-translate-y-2"
  >
    <div className="relative h-56 overflow-hidden">
      <img
        src={album.cover_album_url}
        alt={album.nama}
        loading="lazy"
        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="text-center text-white p-4">
          <h3 className="font-bold">{album.nama}</h3>
          <p className="text-xs">{album.galeri_count || 0} Foto</p>
        </div>
      </div>
    </div>
  </Link>
);

// --- VIDEO CARD ---
const VideoCard = ({ video }) => {
  const isYoutube = video.embed_url && (video.embed_url.includes('youtube.com') || video.embed_url.includes('youtu.be'));
  
  // Fungsi ekstraksi ID agar konsisten
  const getYoutubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const youtubeId = isYoutube ? getYoutubeId(video.embed_url) : null;

  return (
    <div className="overflow-hidden transition-all duration-300 bg-white shadow-lg group rounded-xl hover:shadow-2xl hover:-translate-y-2">
      <div className="relative aspect-video bg-black">
        {youtubeId ? (
          <iframe
            // Tambahkan origin dan enablejsapi agar tidak diblokir
            src={`https://www.youtube.com/embed/${youtubeId}?rel=0&enablejsapi=1&origin=${window.location.origin}`}
            title={video.judul}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        ) : video.file_url ? (
          <video src={video.file_url} controls className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">Video tidak tersedia</div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 truncate">{video.judul || "Tanpa Judul"}</h3>
      </div>
    </div>
  );
};

const GalleryPage = () => {
  const [albums, setAlbums] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    const fetchGalleryData = async () => {
      try {
        setLoading(true);
        const [albumsRes, photosRes, videosRes] = await Promise.all([
          getAlbums(), getPhotos(), getVideos()
        ]);
        setAlbums(albumsRes.data?.data || albumsRes.data || []);
        setPhotos(photosRes.data?.data || photosRes.data || []);
        setVideos(videosRes.data?.data || videosRes.data || []);
      } catch (err) {
        setError("Gagal memuat data galeri.");
      } finally {
        setLoading(false);
      }
    };
    fetchGalleryData();
  }, []);

  // --- LOGIC ANTI-NAVBAR & ANTI-SCROLL ---
  useEffect(() => {
    // Cari elemen navbar (biasanya tag <nav> atau header)
    const navbar = document.querySelector('nav') || document.querySelector('header');
    
    if (selectedPhoto) {
      document.body.style.overflow = 'hidden'; // Stop scroll
      if (navbar) navbar.style.zIndex = '0';   // Turunin paksa z-index navbar ke dasar
    } else {
      document.body.style.overflow = 'unset';  // Normalin scroll
      if (navbar) navbar.style.zIndex = '';    // Balikin z-index navbar ke awal
    }

    return () => {
      document.body.style.overflow = 'unset';
      if (navbar) navbar.style.zIndex = '';
    };
  }, [selectedPhoto]);

  const renderContent = () => {
    if (loading) return <div className="flex items-center justify-center py-40"><Loader className="animate-spin text-cyan-500" size={48} /></div>;
    if (error) return <div className="py-40 text-center text-red-500">{error}</div>;

    return (
      <div className="space-y-20">
        {/* Album Section */}
        {albums.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="pl-3 text-3xl font-bold text-gray-800 border-l-4 border-cyan-500">Album Terbaru</h2>
              <Link to="/galeri/semua-album" className="text-blue-600 hover:underline flex items-center gap-1 text-sm font-semibold">Lihat Semua <ArrowRight size={16} /></Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {albums.slice(0, 6).map((album) => <AlbumCard key={album.id} album={album} />)}
            </div>
          </section>
        )}

        {/* Photo Section */}
        {photos.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="pl-3 text-3xl font-bold text-gray-800 border-l-4 border-cyan-500">Foto Terbaru</h2>
              <Link to="/galeri/foto" className="text-blue-600 hover:underline flex items-center gap-1 text-sm font-semibold">Lihat Semua <ArrowRight size={16} /></Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {photos.slice(0, 10).map((photo) => (
                <PhotoCard key={photo.id} photo={photo} onClick={(p) => setSelectedPhoto(p)} />
              ))}
            </div>
          </section>
        )}

        {/* Video Section */}
        {videos.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="pl-3 text-3xl font-bold text-gray-800 border-l-4 border-cyan-500">Video Terbaru</h2>
              <Link to="/galeri/video" className="text-blue-600 hover:underline flex items-center gap-1 text-sm font-semibold">Lihat Semua <ArrowRight size={16} /></Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {videos.slice(0, 6).map((video) => <VideoCard key={video.id} video={video} />)}
            </div>
          </section>
        )}
      </div>
    );
  };

  return (
    <SecondaryPageTemplate 
      title="Galeri" 
      breadcrumb={[{ label: "Beranda", link: "/" }, { label: "Galeri" }]}
    >
      <div className="container p-6 mx-auto relative">
        {renderContent()}

        {/* LIGHTBOX MODAL - DENGAN Z-INDEX MAKSIMAL */}
        {selectedPhoto && (
          <div 
            className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black/95 p-4 backdrop-blur-md"
            onClick={() => setSelectedPhoto(null)}
          >
            {/* Tombol Close - Dipastikan paling depan */}
            <button 
              className="absolute top-10 right-10 text-white p-3 hover:bg-white/20 rounded-full transition-all z-[100000] shadow-xl border border-white/20"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPhoto(null);
              }}
            >
              <X size={40} strokeWidth={2.5} />
            </button>
            
            <div 
              className="relative max-w-5xl w-full flex flex-col items-center" 
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedPhoto.file_url}
                alt={selectedPhoto.judul}
                className="max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl border border-white/10 scale-in-center animate-in zoom-in duration-300"
              />

              {selectedPhoto.judul && (
                <div className="mt-6 text-center">
                  <h3 className="text-white text-lg md:text-xl font-medium bg-black/60 px-8 py-3 rounded-full backdrop-blur-md border border-white/20">
                    {selectedPhoto.judul}
                  </h3>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </SecondaryPageTemplate>
  );
};

export default GalleryPage;