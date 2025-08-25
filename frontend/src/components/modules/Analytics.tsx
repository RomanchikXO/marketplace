// frontend/src/components/modules/Analytics.tsx
import React, { useState } from 'react';
import OrdersChart from '../OrdersChart';
import DateRangeFilter from '../DateRangeFilter';
import PeriodStats from '../PeriodStats';
import ProductsTable from '../ProductsTable'; // Added import for ProductsTable

const Analytics: React.FC = () => {
  const [dateFrom, setDateFrom] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toLocaleDateString('en-CA');
  });
  const [dateTo, setDateTo] = useState(() => {
    const date = new Date();
    return date.toLocaleDateString('en-CA');
  });

  const handleDateRangeChange = (from: string, to: string) => {
    setDateFrom(from);
    setDateTo(to);
  };

  return (
    <div className="module-content">
      <h2>📊 Дашборд</h2>
      
      {/* Динамическая статистика по периодам */}
      <PeriodStats dateFrom={dateFrom} dateTo={dateTo} />

      <div className="charts-section-full">
        <div className="chart-card-full">
          <h3>График заказов</h3>
          <OrdersChart dateFrom={dateFrom} dateTo={dateTo} />
        </div>
      </div>

      {/* Блок фильтров над таблицей */}
      <DateRangeFilter 
        onDateRangeChange={handleDateRangeChange}
        currentDateFrom={dateFrom}
        currentDateTo={dateTo}
      />

      {/* Таблица с реальными данными */}
      <ProductsTable dateFrom={dateFrom} dateTo={dateTo} />
    </div>
  );
};

export default Analytics;