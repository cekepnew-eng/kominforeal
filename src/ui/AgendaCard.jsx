// src/ui/AgendaCard.jsx

import { FileText, Clock, Calendar } from 'lucide-react';

const AgendaCard = ({ agenda, style, onClick }) => {
  const formatTime = (timeString) => {
    if (!timeString || typeof timeString !== 'string') return null;
    return timeString.substring(0, 5);
  };

  const startTime = formatTime(agenda.waktu_mulai);
  const endTime = formatTime(agenda.waktu_selesai);
  const timeInfo = startTime || endTime 
    ? `${startTime || '--:--'} - ${endTime || '--:--'} WIB` 
    : null;

  // Format tanggal: "2025-10-15" → "15 Okt"
  const formatDate = (dateString) => {
    if (!dateString) return null;
    const options = { day: 'numeric', month: 'short' };
    return new Date(dateString).toLocaleDateString('id-ID', options).replace('.', '');
  };

  const tanggalTampil = formatDate(agenda.tanggal);

  return (
    <div
      onClick={() => onClick(agenda)}
      className="flex items-start w-full gap-3 p-3 transition-all duration-300 bg-white border shadow-sm cursor-pointer rounded-xl animate-fade-in-up hover:border-sky-300 hover:shadow-md hover:bg-sky-50 sm:gap-4 sm:p-4"
      style={style}
    >
      {/* Kolom Ikon */}
      <div className="flex-shrink-0 pt-0.5">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-sky-100 text-sky-700 sm:w-12 sm:h-12">
          <FileText size={20} className="sm:size-6" />
        </div>
      </div>

      {/* Kolom Detail */}
      <div className="flex-1 overflow-hidden">
        {/* Tanggal (Hanya di mobile, opsional) */}
        {tanggalTampil && (
          <div className="flex items-center mb-1 text-xs font-semibold text-sky-600 md:hidden">
            <Calendar size={12} className="mr-1" />
            <span>{tanggalTampil}</span>
          </div>
        )}

        {/* Judul */}
        <p className="text-sm font-bold leading-tight break-words text-slate-800 line-clamp-3 sm:text-base">
          {agenda.judul || agenda.agenda || 'Judul Agenda'}
        </p>

        {/* Waktu */}
        {timeInfo && (
          <div className="flex items-center mt-1.5 text-xs font-medium text-slate-500 sm:mt-2">
            <Clock size={14} className="mr-1.5 flex-shrink-0" />
            <span className="truncate">{timeInfo}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgendaCard;