import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";
import NoImage from "../../public/unnamed.webp";

const NewsCard = ({ news, style }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "Tanggal tidak tersedia";
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Link
      // to={`/page/detail/${news.id}`}
      to={`/berita/${news.id}`}
      className="relative flex flex-col w-full max-w-[360px] h-[420px] overflow-hidden transition-all duration-300 bg-white border shadow-md opacity-0 group rounded-2xl border-slate-200/80 hover:shadow-2xl hover:-translate-y-2 hover:shadow-sky-500/10 animate-fade-in-up"
      style={style}
    >
      {/* Gambar Berita — tetap h-56 */}
      <div className="relative flex-shrink-0 h-56 overflow-hidden">
        <img
          src={news.thumbnail_url || news.gambar_url || NoImage}
          alt={news.judul || "Gambar Berita"}
          loading="lazy"
          className="object-cover w-full h-full transition duration-500 ease-in-out group-hover:scale-110"
          onError={(e) => {
            e.target.src = NoImage;
          }}
        />

        {/* Overlay hitam geser dari kiri */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 transition-transform duration-500 ease-out -translate-x-full bg-black/40 group-hover:translate-x-0"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-semibold tracking-wide text-white transition-opacity duration-500 delay-100 opacity-0 group-hover:opacity-100">
              Lihat Berita
            </span>
          </div>
        </div>
      </div>

      {/* Konten — isi ruang tersisa */}
      <div className="flex flex-col flex-grow p-5 overflow-hidden">
        <h3 className="flex-grow mb-3 text-base font-semibold leading-relaxed text-slate-800 line-clamp-3 group-hover:text-sky-800">
          {news.judul || "Judul Berita Tidak Tersedia"}
        </h3>

        <div className="flex items-center pt-3 mt-auto text-xs border-t text-slate-500 border-slate-200">
          <Calendar size={14} className="flex-shrink-0 mr-2 text-sky-500" />
          <span className="truncate">
            {news.created_at_formatted || formatDate(news.created_at)}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default NewsCard;