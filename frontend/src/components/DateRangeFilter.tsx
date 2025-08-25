import React, { useState, useEffect, useRef } from 'react';
import './DateRangeFilter.css';

interface DateRangeFilterProps {
  onDateRangeChange: (dateFrom: string, dateTo: string) => void;
  currentDateFrom?: string;
  currentDateTo?: string;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ 
  onDateRangeChange, 
  currentDateFrom, 
  currentDateTo 
}) => {
  const [isFromOpen, setIsFromOpen] = useState(false);
  const [isToOpen, setIsToOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentMonthFrom, setCurrentMonthFrom] = useState(new Date());
  const [currentMonthTo, setCurrentMonthTo] = useState(new Date());
  const [selectedFrom, setSelectedFrom] = useState<Date | null>(null);
  const [selectedTo, setSelectedTo] = useState<Date | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const calendarFromRef = useRef<HTMLDivElement>(null);
  const calendarToRef = useRef<HTMLDivElement>(null);

  // Устанавливаем дефолтные даты только один раз при инициализации
  useEffect(() => {
    if (isInitialized) return; // Не выполняем повторно
    
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    // Используем локальный часовой пояс для корректного отображения дат
    const fromStr = thirtyDaysAgo.toLocaleDateString('en-CA'); // формат YYYY-MM-DD
    const toStr = today.toLocaleDateString('en-CA'); // формат YYYY-MM-DD
    
    setDateFrom(fromStr);
    setDateTo(toStr);
    
    setSelectedFrom(thirtyDaysAgo);
    setSelectedTo(today);
    
    // Вызываем callback с дефолтными датами
    onDateRangeChange(fromStr, toStr);
    
    setIsInitialized(true);
  }, []); // Убираем зависимость onDateRangeChange

  // Закрываем календари при клике вне их
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarFromRef.current && !calendarFromRef.current.contains(event.target as Node)) {
        setIsFromOpen(false);
      }
      if (calendarToRef.current && !calendarToRef.current.contains(event.target as Node)) {
        setIsToOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Получаем день недели (0 = воскресенье, 1 = понедельник, ..., 6 = суббота)
    let firstDayOfWeek = firstDay.getDay();
    // Преобразуем в понедельник = 0, воскресенье = 6
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    const days = [];
    
    // Добавляем пустые ячейки для начала месяца
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    // Добавляем дни месяца
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const handleFromDateClick = (date: Date) => {
    // Используем локальный часовой пояс для корректного отображения дат
    const dateStr = date.toLocaleDateString('en-CA'); // формат YYYY-MM-DD
    
    setSelectedFrom(date);
    setDateFrom(dateStr);
    
    // Если конечная дата меньше начальной, обновляем её
    if (selectedTo && date > selectedTo) {
      setSelectedTo(date);
      setDateTo(dateStr);
    }
    
    // Автоматически закрываем календарь
    setIsFromOpen(false);
    
    // Применяем изменения сразу
    const newDateTo = selectedTo && date > selectedTo ? dateStr : dateTo;
    if (newDateTo) {
      onDateRangeChange(dateStr, newDateTo);
    }
  };

  const handleToDateClick = (date: Date) => {
    // Проверяем, что выбранная дата не меньше начальной
    if (selectedFrom && date < selectedFrom) {
      return; // Не позволяем выбрать дату меньше начальной
    }
    
    // Используем локальный часовой пояс для корректного отображения дат
    const dateStr = date.toLocaleDateString('en-CA'); // формат YYYY-MM-DD
    
    setSelectedTo(date);
    setDateTo(dateStr);
    
    // Автоматически закрываем календарь
    setIsToOpen(false);
    
    // Применяем изменения сразу
    if (dateFrom) {
      onDateRangeChange(dateFrom, dateStr);
    }
  };

  const applyDateRange = () => {
    // Проверяем, что у нас есть обе даты
    if (dateFrom && dateTo) {
      
      // Вызываем callback для обновления данных
      onDateRangeChange(dateFrom, dateTo);
    }
  };

  const isDateDisabled = (date: Date, isFromCalendar: boolean) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    if (isFromCalendar) {
      // Для начальной даты: не может быть больше конечной
      return date > today || (selectedTo && date > selectedTo);
    } else {
      // Для конечной даты: не может быть больше сегодня и меньше начальной
      return date > today || (selectedFrom && date < selectedFrom);
    }
  };

  const changeMonth = (direction: 'prev' | 'next', isFromCalendar: boolean) => {
    if (isFromCalendar) {
      setCurrentMonthFrom(prev => {
        const newMonth = new Date(prev);
        if (direction === 'prev') {
          newMonth.setMonth(prev.getMonth() - 1);
        } else {
          newMonth.setMonth(prev.getMonth() + 1);
        }
        return newMonth;
      });
    } else {
      setCurrentMonthTo(prev => {
        const newMonth = new Date(prev);
        if (direction === 'prev') {
          newMonth.setMonth(prev.getMonth() - 1);
        } else {
          newMonth.setMonth(prev.getMonth() + 1);
        }
        return newMonth;
      });
    }
  };

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  // Устанавливаем текущий месяц календаря на месяц выбранной даты при открытии
  useEffect(() => {
    if (isFromOpen && selectedFrom) {
      setCurrentMonthFrom(selectedFrom);
    }
  }, [isFromOpen, selectedFrom]);

  useEffect(() => {
    if (isToOpen && selectedTo) {
      setCurrentMonthTo(selectedTo);
    }
  }, [isToOpen, selectedTo]);

  const renderCalendar = (isFromCalendar: boolean) => {
    const currentMonth = isFromCalendar ? currentMonthFrom : currentMonthTo;
    const selectedDate = isFromCalendar ? selectedFrom : selectedTo;
    const calendarRef = isFromCalendar ? calendarFromRef : calendarToRef;
    const isOpen = isFromCalendar ? isFromOpen : isToOpen;
    
    return (
      <div className="calendar-popup" ref={calendarRef} style={{ display: isOpen ? 'block' : 'none' }}>
        <div className="calendar-header">
          <button onClick={() => changeMonth('prev', isFromCalendar)}>&lt;</button>
          <span>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
          <button onClick={() => changeMonth('next', isFromCalendar)}>&gt;</button>
        </div>

        <div className="calendar-weekdays">
          {weekDays.map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>

        <div className="calendar-days">
          {getDaysInMonth(currentMonth).map((date, index) => (
            <div
              key={index}
              className={`calendar-day ${
                !date ? 'empty' : ''
              } ${
                date && isDateDisabled(date, isFromCalendar) ? 'disabled' : ''
              } ${
                date && selectedDate && date.getTime() === selectedDate.getTime() ? 'selected' : ''
              }`}
              onClick={() => date && !isDateDisabled(date, isFromCalendar) && 
                (isFromCalendar ? handleFromDateClick(date) : handleToDateClick(date))}
            >
              {date ? date.getDate() : ''}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="date-range-filter">
      <div className="filter-header">
        <h3>Период</h3>
        <div className="date-inputs">
          <div className="date-input-group">
            <label>От:</label>
            <button 
              className="date-input"
              onClick={() => {
                setIsFromOpen(!isFromOpen);
                setIsToOpen(false);
              }}
            >
              {dateFrom || 'Выберите дату'}
            </button>
            {renderCalendar(true)}
          </div>
          
          <div className="date-input-group">
            <label>До:</label>
            <button 
              className="date-input"
              onClick={() => {
                setIsToOpen(!isToOpen);
                setIsFromOpen(false);
              }}
            >
              {dateTo || 'Выберите дату'}
            </button>
            {renderCalendar(false)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateRangeFilter;
