import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getNewsDetail, getNews } from "../api/api"; // Pastikan fungsi ini ada di file api.php lo
import SecondaryPageTemplate from "../ui/PageLayout";
import { Loader, Calendar, User, Tag } from "lucide-react";

const DetailNewsPage = () => {
  const { id } = useParams();
  const [news, setNews] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetailData = async () => {
      try {
        setLoading(true);
        // 1. Ambil detail berita berdasarkan ID
        const response = await getNewsDetail(id);
        const data = response.data?.data || response.data;
        setNews(data);

        // 2. Ambil berita lainnya untuk "Berita Terkait"
        const allNewsRes = await getNews();
        const allNews = allNewsRes.data?.data || allNewsRes.data || [];
        // Filter berita yang sedang dibuka agar tidak muncul di terkait
        setRelatedNews(allNews.filter((item) => item.id !== parseInt(id)).slice(0, 3));
      } catch (err) {
        console.error("Gagal memuat berita:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetailData();
    // Scroll ke atas kalau ganti berita
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Loader className="animate-spin text-orange-500 mb-4" size={48} />
        <p className="text-gray-500">Memuat isi berita...</p>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="flex items-center justify-center py-40">
        <p className="text-xl text-gray-600">Berita tidak ditemukan atau sudah dihapus.</p>
      </div>
    );
  }

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <SecondaryPageTemplate
      title={news.judul || news.title} // Sesuaikan dengan field DB lo (biasanya 'judul')
      breadcrumb={[
        { label: "Beranda", link: "/" },
        { label: "Berita", link: "/berita" },
        { label: news.judul || news.title },
      ]}
    >
      <div className="max-w-4xl px-4 py-10 mx-auto space-y-8">
        {/* Gambar Utama */}
        <div className="overflow-hidden rounded-2xl shadow-lg">
          <img
            src={news.gambar_url || news.image} // Sesuaikan field API
            alt={news.judul}
            className="object-cover w-full max-h-[500px]"
          />
        </div>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-b border-gray-100 text-gray-500">
          <div className="flex items-center gap-2 text-sm">
            <Calendar size={18} className="text-orange-500" />
            <span>{formatDate(news.created_at || news.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <User size={18} className="text-orange-500" />
            <span>{news.author || "Admin Diskominfo"}</span>
          </div>
        </div>

        {/* Isi Berita */}
        <article className="prose prose-orange max-w-none">
          {/* Gunakan dangerouslySetInnerHTML kalau isi berita lo berupa HTML dari text editor (Rich Text) */}
          <div 
            className="text-lg leading-relaxed text-gray-800 whitespace-pre-line"
            dangerouslySetInnerHTML={{ __html: news.isi || news.content }}
          />
        </article>

        {/* Tags */}
        {news.tags && (
          <div className="flex flex-wrap gap-2 pt-6">
            <Tag size={18} className="text-gray-400" />
            {news.tags.split(',').map((tag, i) => ( // Asumsi tags disimpan sebagai string comma separated
              <span key={i} className="px-3 py-1 text-xs font-medium text-orange-700 bg-orange-100 rounded-full">
                #{tag.trim()}
              </span>
            ))}
          </div>
        )}

        {/* Berita Terkait */}
        {relatedNews.length > 0 && (
          <section className="pt-12 mt-12 border-t">
            <h2 className="mb-6 text-2xl font-bold text-gray-800 flex items-center gap-2">
              <span className="w-2 h-8 bg-orange-500 rounded-full"></span>
              Berita Terkait
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
              {relatedNews.map((item) => (
                <Link
                  key={item.id}
                  to={`/berita/${item.id}`}
                  className="group flex flex-col overflow-hidden rounded-xl shadow-sm bg-white border border-gray-100 hover:shadow-xl transition-all"
                >
                  <div className="overflow-hidden h-40">
                    <img
                      src={item.gambar_url || item.image}
                      alt={item.judul}
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="p-4 text-sm font-bold text-gray-800 line-clamp-2 group-hover:text-orange-600">
                    {item.judul || item.title}
                  </h3>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </SecondaryPageTemplate>
  );
};

export default DetailNewsPage;