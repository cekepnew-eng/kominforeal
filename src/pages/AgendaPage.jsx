import React, { useState, useMemo, useCallback, useEffect } from "react";
import SecondaryPageTemplate from "./../ui/PageLayout";
import { getAgendas } from "../api/menuApi";
import { Calendar as CalendarIcon, Search, AlertCircle, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

// --- Komponen Kalender (Modern) ---
const Calendar = ({
  currentMonth,
  monthNames,
  dayNames,
  agendaData,
  selectedDate,
  onSelectDate,
  navigateMonth,
}) => {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const leadingBlanks = Array.from({ length: firstDay }, (_, i) => <div key={`blank-${i}`} />);

  const hasAgendaOnDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    return agendaData.some(agenda => agenda.tanggal && agenda.tanggal.startsWith(dateString));
  };

  return (
    <div className="w-full p-5 transition-shadow duration-300 bg-white border border-gray-200 shadow-sm rounded-2xl hover:shadow-md">
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-2 transition-colors rounded-full hover:bg-gray-100"
          aria-label="Bulan sebelumnya"
        >
          <ChevronLeft size={20} className="text-gray-600 hover:text-cyan-600" />
        </button>
        <h2 className="text-lg font-semibold text-gray-800">
          {monthNames[month]} {year}
        </h2>
        <button
          onClick={() => navigateMonth(1)}
          className="p-2 transition-colors rounded-full hover:bg-gray-100"
          aria-label="Bulan berikutnya"
        >
          <ChevronRight size={20} className="text-gray-600 hover:text-cyan-600" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-2 mb-3 text-xs font-medium text-center text-gray-500">
        {dayNames.map(day => <div key={day} className="py-1.5">{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {leadingBlanks}
        {dates.map(dateNum => {
          const dateObj = new Date(year, month, dateNum);
          const isSelected = selectedDate && selectedDate.toDateString() === dateObj.toDateString();
          const isToday = new Date().toDateString() === dateObj.toDateString();
          const hasAgenda = hasAgendaOnDate(dateObj);

          return (
            <button
              key={dateNum}
              onClick={() => onSelectDate(dateObj)}
              className={`
                relative h-11 w-11 flex items-center justify-center text-sm rounded-xl transition-all duration-200
                ${isSelected 
                  ? 'bg-cyan-600 text-white font-semibold shadow-sm' 
                  : isToday 
                    ? 'bg-cyan-50 text-cyan-700 font-medium border border-cyan-200' 
                    : 'text-gray-700 hover:bg-gray-100'}
                focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-opacity-50
              `}
            >
              {dateNum}
              {hasAgenda && (
                <span className={`absolute -bottom-1 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-cyan-600'}`}></span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// --- Komponen Accordion Item (Modern) ---
const AgendaAccordionItem = ({ agenda, isOpen, onClick }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "Tanggal tidak tersedia";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formattedDate = formatDate(agenda.tanggal);
  const [isExpanded, setIsExpanded] = useState(false);
  const MAX_LENGTH = 150;
  const description = agenda.deskripsi || "Tidak ada deskripsi detail.";
  const shouldTruncate = description.length > MAX_LENGTH;

  return (
    <li className="overflow-hidden transition-all duration-300 bg-white border border-gray-200 rounded-xl hover:border-cyan-300 hover:shadow-sm">
      <button 
        onClick={onClick} 
        className="flex items-start justify-between w-full p-5 text-left transition-colors"
      >
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-800 break-words line-clamp-2">
            {agenda.agenda || agenda.judul}
          </h4>
          <div className="flex items-center mt-2 text-sm text-gray-600">
            <CalendarIcon size={14} className="mr-1.5 text-cyan-600 flex-shrink-0" />
            <span className="truncate">{formattedDate}</span>
          </div>
        </div>
        <ChevronDown
          className={`flex-shrink-0 ml-3 text-cyan-600 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          size={18}
        />
      </button>

      <div
        className={`transition-all duration-300 ease-in-out grid ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="px-5 pb-5 overflow-hidden">
          <div className="pt-3 border-t border-gray-100">
            <p className="text-sm leading-relaxed text-gray-600 break-words">
              {shouldTruncate && !isExpanded
                ? `${description.substring(0, MAX_LENGTH)}...`
                : description}
            </p>
            {shouldTruncate && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="inline-flex items-center mt-2 text-sm font-medium text-cyan-600 hover:text-cyan-800"
              >
                {isExpanded ? "Sembunyikan" : "Lihat Lengkap"}
                <ChevronDown 
                  size={14} 
                  className={`ml-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                />
              </button>
            )}
          </div>
        </div>
      </div>
    </li>
  );
};

// --- Komponen Utama ---
const AgendaPage = () => {
  const breadcrumb = [
    { label: "Beranda", link: "/" },
    { label: "Agenda Diskominfo" },
  ];

  const [agendas, setAgendas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [openAgendaId, setOpenAgendaId] = useState(null);

  useEffect(() => {
    const fetchAgendas = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getAgendas();
        setAgendas(response || []);
      } catch (err) {
        setError("Gagal memuat data agenda. Silakan coba lagi.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAgendas();
  }, []);
  
  const navigateMonth = (dir) => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + dir);
      return newDate;
    });
  };

  const handleDateSelect = (date) => {
    setSearchTerm("");
    setSelectedDate(selectedDate?.toDateString() === date.toDateString() ? null : date);
  };

  const displayedAgendas = useMemo(() => {
    if (searchTerm) {
      return agendas.filter(
        (agenda) =>
          (agenda.agenda || agenda.judul || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (agenda.deskripsi || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      return agendas.filter((a) => a.tanggal && a.tanggal.startsWith(dateStr));
    }
    const yearStr = currentMonth.getFullYear();
    const monthStr = String(currentMonth.getMonth() + 1).padStart(2, "0");
    return agendas.filter((a) => a.tanggal && a.tanggal.startsWith(`${yearStr}-${monthStr}`));
  }, [agendas, searchTerm, selectedDate, currentMonth]);

  const sidebarTitle = useMemo(() => {
    if (searchTerm) return `Hasil Pencarian`;
    if (selectedDate) return `Agenda ${selectedDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`;
    return `Agenda Bulan ${monthNames[currentMonth.getMonth()]}`;
  }, [searchTerm, selectedDate, currentMonth]);

  const handleAccordionClick = (agendaId) => {
    setOpenAgendaId(openAgendaId === agendaId ? null : agendaId);
  };

  return (
    <SecondaryPageTemplate
      title="Agenda Diskominfo Kota Bogor"
      breadcrumb={breadcrumb}
    >
      <div className="flex flex-col items-start justify-between gap-4 mb-8 md:flex-row md:items-center">
        <div className="relative w-full md:w-1/2">
          <Search className="absolute text-gray-400 -translate-y-1/2 left-4 top-1/2" size={20} />
          <input
            type="text"
            placeholder="Cari agenda..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSelectedDate(null);
            }}
            className="w-full py-3 pl-12 pr-4 transition border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>
      </div>

      {error && (
        <div className="flex flex-col items-center justify-center py-20 text-center text-red-700 rounded-2xl bg-red-50">
          <AlertCircle className="w-12 h-12 mb-4 text-red-400" />
          <p className="text-lg font-semibold">{error}</p>
        </div>
      )}

      {!error && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="order-2 lg:col-span-7 lg:order-1">
            {isLoading ? (
              <div className="w-full bg-gray-200 h-96 rounded-2xl animate-pulse"></div>
            ) : (
              <Calendar
                currentMonth={currentMonth}
                monthNames={monthNames}
                dayNames={dayNames}
                agendaData={agendas}
                selectedDate={selectedDate}
                onSelectDate={handleDateSelect}
                navigateMonth={navigateMonth}
              />
            )}
          </div>

          <div className="flex flex-col order-1 lg:col-span-5 lg:order-2">
            <div className="p-5 bg-white border border-gray-200 shadow-sm rounded-2xl">
              <h3 className="mb-4 text-lg font-semibold text-gray-800">
                {sidebarTitle}
              </h3>
              <div className="space-y-4 max-h-[70vh] lg:max-h-[600px] overflow-y-auto pr-2">
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-full h-24 bg-gray-100 rounded-xl animate-pulse"></div>
                    ))}
                  </div>
                ) : displayedAgendas.length > 0 ? (
                  displayedAgendas.map((a) => (
                    <AgendaAccordionItem 
                      key={a.id}
                      agenda={a}
                      isOpen={openAgendaId === a.id}
                      onClick={() => handleAccordionClick(a.id)}
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="p-3 mb-4 rounded-full bg-cyan-50">
                      <CalendarIcon size={28} className="text-cyan-600" />
                    </div>
                    <p className="font-medium text-gray-700">Tidak Ada Agenda</p>
                    <p className="max-w-xs mt-1 text-sm text-gray-500">
                      {searchTerm 
                        ? `Tidak ada hasil untuk "${searchTerm}".`
                        : "Belum ada jadwal untuk periode ini."
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </SecondaryPageTemplate>
  );
};

export default AgendaPage;