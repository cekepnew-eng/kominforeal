import React, { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight, AlertCircle, Calendar, Newspaper, Sparkles, FileText } from "lucide-react"; 
import { useQuery } from "@tanstack/react-query";
import NewsCard from "../ui/NewsCard";
import { getAgendas } from "../api/menuApi";

const MONTH_NAMES = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const DAY_NAMES = ["Min","Sen","Sel","Rab","Kam","Jum","Sab"];
const DAYS_PER_PAGE = 7;

const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
const isSameDay = (date1, date2) => date1.toDateString() === date2.toDateString();

const AgendaDayButton = ({ day, isSelected, isToday, hasAgenda, onSelectDate }) => (
  <button
    onClick={() => onSelectDate(day)}
    className={`relative group flex flex-col items-center justify-center w-full rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2
      ${isSelected ? "bg-gradient-to-br from-cyan-600 to-blue-600 text-white shadow-lg scale-[1.02]" : isToday ? "bg-cyan-50 text-cyan-900 ring-2 ring-cyan-300 hover:bg-cyan-100" : "bg-white text-slate-700 hover:bg-slate-50 hover:shadow-md border border-slate-200"}
      min-h-[72px] sm:min-h-[80px]`}
  >
    <span className={`text-[10px] font-medium mb-0.5 ${isSelected ? 'text-cyan-100' : isToday ? 'text-cyan-600' : 'text-slate-400'}`}>{DAY_NAMES[day.getDay()]}</span>
    <span className={`text-xl font-bold ${isSelected ? 'text-white' : isToday ? 'text-cyan-700' : 'text-slate-800'}`}>{day.getDate()}</span>
    {hasAgenda && (
      <div className="absolute bottom-1.5 flex gap-0.5">
        {[...Array(3)].map((_, i) => <span key={i} className={`w-1 h-1 rounded-full ${isSelected ? "bg-white" : "bg-cyan-600"}`} />)}
      </div>
    )}
  </button>
);

const NewsAgendaSection = () => {
  const today = useMemo(() => new Date(), []);
  
  // Di dalam NewsAgendaSection
  const { data: newsDataResponse, isLoading: isLoadingNews, isError: isErrorNews, error: newsError } = useQuery({
      queryKey: ["newsHome"], 
      queryFn: async () => {
        // Tambahkan /index.php di depan rute agar Apache tidak bingung
        const response = await fetch('/fetch-pages?menu_id=9&limit=3');
        if (!response.ok) throw new Error("Gagal load data");
        return response.json();
      },
      retry: 1, // Coba sekali lagi kalau gagal
  });

  const news = useMemo(() => {
      // Pastikan data yang di-map adalah array
      return Array.isArray(newsDataResponse) ? newsDataResponse : [];
  }, [newsDataResponse]);

  const { data: agendaData, isLoading: isLoadingAgenda, isError: isErrorAgenda, refetch: refetchAgenda } = useQuery({
    queryKey: ["agenda"],
    queryFn: () => getAgendas(),
  });

  const [selectedDate, setSelectedDate] = useState(today);
  const [currentDisplayMonth, setCurrentDisplayMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [openAgendaId, setOpenAgendaId] = useState(null);

  const agendaMap = useMemo(() => {
    const map = new Map();
    (agendaData || []).forEach(agenda => {
      if (!agenda.tanggal) return;
      const dateKey = agenda.tanggal.split('T')[0];
      if (!map.has(dateKey)) map.set(dateKey, []);
      map.get(dateKey).push(agenda);
    });
    return map;
  }, [agendaData]);

  const getAgendasForDate = useCallback((date) => {
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return agendaMap.get(dateKey) || [];
  }, [agendaMap]);

  const agendasToShow = useMemo(() => getAgendasForDate(selectedDate), [selectedDate, getAgendasForDate]);
  const totalDaysInMonth = useMemo(() => getDaysInMonth(currentDisplayMonth), [currentDisplayMonth]);
  const [currentPage, setCurrentPage] = useState(Math.floor((today.getDate() - 1) / DAYS_PER_PAGE));

  const visibleDays = useMemo(() => {
    const start = currentPage * DAYS_PER_PAGE + 1;
    const end = Math.min(start + DAYS_PER_PAGE - 1, totalDaysInMonth);
    return Array.from({ length: end - start + 1 }, (_, i) => new Date(currentDisplayMonth.getFullYear(), currentDisplayMonth.getMonth(), start + i));
  }, [currentPage, totalDaysInMonth, currentDisplayMonth]);

  return (
    <section className="relative py-20 bg-gradient-to-b from-slate-50 to-white sm:py-24">
      <div className="container px-4 mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* News Part */}
          <div className="lg:col-span-7">
            <div className="mb-12">
              <h2 className="text-4xl font-bold text-slate-900">Berita & <span className="text-cyan-600">Inovasi</span></h2>
              <p className="mt-4 text-slate-600 text-lg">Informasi terbaru dari Diskominfo Kota Bogor</p>
            </div>

            {/* --- LOGIKA TAMPILAN BARU --- */}
            {isLoadingNews ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-2xl"></div>
                ))}
              </div>
            // ) : isErrorNews ? (
            //   <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl">
            //     <AlertCircle className="w-10 h-10 mx-auto mb-3 text-red-400" />
            //     <p className="text-slate-600">Gagal memuat berita: {newsError?.message}</p>
            //     {/* Tombol darurat buat ngecek link langsung */}
            //     <a href="/fetch-pages?menu_id=9&limit=3" target="_blank" className="text-xs text-cyan-600 underline mt-2 block">
            //       Cek koneksi API
            //     </a>
            //   </div>
            ) : news.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {news.map((item) => <NewsCard key={item.id} news={item} />)}
              </div>
            ) : (
              <p className="text-center text-slate-400 py-10">Silahkan klik tombol berikut:</p>
            )}
            {/* --- END LOGIKA TAMPILAN --- */}

            <div className="flex justify-center mt-10">
              <Link to="/page/9" className="inline-flex items-center gap-2 px-6 py-3 font-bold text-white rounded-xl bg-cyan-600 hover:bg-cyan-700 transition-all">
                <Newspaper size={20} /> Lihat Semua Berita
              </Link>
            </div>
          </div>

          {/* Agenda Part */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 border rounded-3xl bg-white shadow-xl overflow-hidden">
              <div className="p-6 bg-slate-50 border-b flex items-center justify-between">
                <button onClick={() => setCurrentPage(p => Math.max(0, p-1))} disabled={currentPage === 0}><ChevronLeft/></button>
                <h4 className="font-bold text-lg">{MONTH_NAMES[currentDisplayMonth.getMonth()]} {currentDisplayMonth.getFullYear()}</h4>
                <button onClick={() => setCurrentPage(p => p+1)} disabled={(currentPage+1)*DAYS_PER_PAGE >= totalDaysInMonth}><ChevronRight/></button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-7 gap-2 mb-6">
                  {visibleDays.map(day => (
                    <AgendaDayButton key={day.toISOString()} day={day} isSelected={isSameDay(selectedDate, day)} isToday={isSameDay(today, day)} hasAgenda={getAgendasForDate(day).length > 0} onSelectDate={setSelectedDate} />
                  ))}
                </div>
                <div className="space-y-3">
                  {agendasToShow.length > 0 ? agendasToShow.map(agenda => (
                    <div key={agenda.id} className="p-4 border rounded-xl">
                      <h4 className="font-bold text-slate-800">{agenda.judul || agenda.agenda}</h4>
                      <p className="text-sm text-slate-600 mt-2">{agenda.deskripsi}</p>
                    </div>
                  )) : <p className="text-center text-slate-400 py-10">Tidak ada agenda</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsAgendaSection;