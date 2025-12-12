import React, { useState } from 'react';

const DatePicker = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getMonthName = (date) => {
    const months = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
                    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
    return months[date.getMonth()];
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const changeMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const selectDate = (date) => {
    setSelectedDate(date);
    setIsOpen(false);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isSelected = (date) => {
    return date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear();
  };

  const days = getDaysInMonth(currentMonth);
  const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  return (
    <div style={styles.container}>
      {/* Date Input Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={styles.dateButton}
      >
        <span style={styles.calendarIcon}>📅</span>
        <span style={styles.dateText}>{formatDate(selectedDate)}</span>
        <span style={styles.arrow}>{isOpen ? '▲' : '▼'}</span>
      </button>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div style={styles.calendarDropdown}>
          {/* Month Navigation */}
          <div style={styles.calendarHeader}>
            <button 
              onClick={() => changeMonth(-1)}
              style={styles.navButton}
            >
              ◀
            </button>
            <div style={styles.monthYear}>
              {getMonthName(currentMonth)} {currentMonth.getFullYear()}
            </div>
            <button 
              onClick={() => changeMonth(1)}
              style={styles.navButton}
            >
              ▶
            </button>
          </div>

          {/* Week Days Header */}
          <div style={styles.weekDaysContainer}>
            {weekDays.map((day, index) => (
              <div key={index} style={styles.weekDay}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div style={styles.daysContainer}>
            {days.map((date, index) => {
              if (!date) {
                return <div key={index} style={styles.emptyDay}></div>;
              }

              const today = isToday(date);
              const selected = isSelected(date);

              return (
                <button
                  key={index}
                  onClick={() => selectDate(date)}
                  style={{
                    ...styles.dayButton,
                    ...(today && styles.todayButton),
                    ...(selected && styles.selectedButton)
                  }}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div style={styles.footer}>
            <button 
              onClick={() => selectDate(new Date())}
              style={styles.todayBtn}
            >
              Hôm nay
            </button>
            <button 
              onClick={() => setIsOpen(false)}
              style={styles.closeBtn}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    position: 'relative',
    display: 'inline-block'
  },
  dateButton: {
    padding: '0.6rem 1.2rem',
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    fontSize: '0.95rem',
    fontWeight: '600',
    boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
    transition: 'all 0.2s'
  },
  calendarIcon: {
    fontSize: '1.2rem'
  },
  dateText: {
    color: '#374151'
  },
  arrow: {
    fontSize: '0.7rem',
    color: '#9ca3af'
  },
  calendarDropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '0.5rem',
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
    padding: '1rem',
    minWidth: '320px',
    zIndex: 1000
  },
  calendarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    padding: '0.5rem'
  },
  navButton: {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1.2rem',
    padding: '0.3rem 0.6rem',
    borderRadius: '6px',
    color: '#374151',
    transition: 'background-color 0.2s'
  },
  monthYear: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#1f2937'
  },
  weekDaysContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '0.25rem',
    marginBottom: '0.5rem'
  },
  weekDay: {
    textAlign: 'center',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#6b7280',
    padding: '0.5rem'
  },
  daysContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '0.25rem',
    marginBottom: '1rem'
  },
  emptyDay: {
    padding: '0.5rem'
  },
  dayButton: {
    padding: '0.6rem',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    color: '#374151',
    transition: 'all 0.2s',
    fontWeight: '500'
  },
  todayButton: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    fontWeight: '700'
  },
  selectedButton: {
    backgroundColor: '#3b82f6',
    color: 'white',
    fontWeight: '700'
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '0.5rem',
    paddingTop: '0.5rem',
    borderTop: '1px solid #e5e7eb'
  },
  todayBtn: {
    flex: 1,
    padding: '0.5rem',
    backgroundColor: '#f3f4f6',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#374151'
  },
  closeBtn: {
    flex: 1,
    padding: '0.5rem',
    backgroundColor: '#3b82f6',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'white'
  }
};

export default DatePicker;