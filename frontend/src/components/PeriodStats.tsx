import React, { useEffect, useState } from 'react';

interface OrdersChartData {
  date: string;
  count: number;
}

interface OrdersChartResponse {
  data: OrdersChartData[];
  total_orders: number;
  total_sales: number;
}

interface PeriodStatsProps {
  dateFrom: string;
  dateTo: string;
}

const PeriodStats: React.FC<PeriodStatsProps> = ({ dateFrom, dateTo }) => {
  const [currentPeriodData, setCurrentPeriodData] = useState<OrdersChartResponse | null>(null);
  const [pastPeriodData, setPastPeriodData] = useState<OrdersChartResponse | null>(null);
  const [stocksData, setStocksData] = useState<{ total_stocks: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPeriodData = async () => {
      if (!dateFrom || !dateTo) return;
      
      try {
        setLoading(true);
        const apiUrl = process.env.REACT_APP_API_URL || '/api';
        
        // Вычисляем длительность текущего периода
        const startDate = new Date(dateFrom);
        const endDate = new Date(dateTo);
        const periodDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) + 1;
        
        // Вычисляем прошлый период (такой же длительности)
        const pastStartDate = new Date(startDate);
        pastStartDate.setDate(startDate.getDate() - periodDays);
        const pastEndDate = new Date(startDate);
        pastEndDate.setDate(startDate.getDate() - 1);
        
        const pastFrom = pastStartDate.toISOString().split('T')[0];
        const pastTo = pastEndDate.toISOString().split('T')[0];
        
        // Загружаем данные для текущего периода
        const currentParams = new URLSearchParams();
        currentParams.append('date_from', dateFrom);
        currentParams.append('date_to', dateTo);
        
        const currentResponse = await fetch(`${apiUrl}/analytics/orders-chart?${currentParams.toString()}`);
        if (!currentResponse.ok) throw new Error(`HTTP error! status: ${currentResponse.status}`);
        const currentData: OrdersChartResponse = await currentResponse.json();
        
        // Загружаем данные для прошлого периода
        const pastParams = new URLSearchParams();
        pastParams.append('date_from', pastFrom);
        pastParams.append('date_to', pastTo);
        
        const pastResponse = await fetch(`${apiUrl}/analytics/orders-chart?${pastParams.toString()}`);
        if (!pastResponse.ok) throw new Error(`HTTP error! status: ${currentResponse.status}`);
        const pastData: OrdersChartResponse = await pastResponse.json();
        
        // Загружаем данные об остатках
        const stocksResponse = await fetch(`${apiUrl}/analytics/stocks`);
        if (!stocksResponse.ok) throw new Error(`HTTP error! status: ${stocksResponse.status}`);
        const stocksData = await stocksResponse.json();
        
        setCurrentPeriodData(currentData);
        setPastPeriodData(pastData);
        setStocksData(stocksData);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки статистики');
        console.error('Ошибка загрузки статистики:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPeriodData();
  }, [dateFrom, dateTo]);

  if (loading) {
    return (
      <div className="stats-grid-compact">
        <div className="stat-card-compact">
          <h3>Общие продажи</h3>
          <div className="stat-value">Загрузка...</div>
          <div className="stat-change">...</div>
        </div>
        <div className="stat-card-compact">
          <h3>Заказы</h3>
          <div className="stat-value">Загрузка...</div>
          <div className="stat-change">...</div>
        </div>
        <div className="stat-card-compact">
          <h3>Конверсия</h3>
          <div className="stat-value">12.4%</div>
          <div className="stat-change positive">+1.2%</div>
        </div>
        <div className="stat-card-compact">
          <h3>Товары в наличии</h3>
        </div>
      </div>
    );
  }

  if (error || !currentPeriodData || !pastPeriodData) {
    return (
      <div className="stats-grid-compact">
        <div className="stat-card-compact">
          <h3>Общие продажи</h3>
          <div className="stat-value">Ошибка</div>
          <div className="stat-change">-</div>
        </div>
        <div className="stat-card-compact">
          <h3>Заказы</h3>
          <div className="stat-value">Ошибка</div>
          <div className="stat-change">-</div>
        </div>
        <div className="stat-card-compact">
          <h3>Конверсия</h3>
          <div className="stat-value">12.4%</div>
          <div className="stat-change positive">+1.2%</div>
        </div>
        <div className="stat-card-compact">
          <h3>Товары в наличии</h3>
          <div className="stat-value"></div>
        </div>
      </div>
    );
  }

  // Вычисляем изменения
  const currentOrders = currentPeriodData.total_orders;
  const pastOrders = pastPeriodData.total_orders;
  const ordersChange = currentOrders - pastOrders;

  // Используем реальные данные о продажах из API
  const currentSales = currentPeriodData.total_sales;
  const pastSales = pastPeriodData.total_sales;
  const salesChange = currentSales - pastSales;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatChange = (change: number) => {
    if (change === 0) return '0';
    const sign = change > 0 ? '+' : '';
    return `${sign}${formatCurrency(Math.abs(change))}`;
  };

  const getChangeClass = (change: number) => {
    if (change > 0) return 'positive';
    if (change < 0) return 'negative';
    return '';
  };

  return (
    <div className="stats-grid-compact">
      <div className="stat-card-compact">
        <h3>Общие продажи</h3>
        <div className="stat-value">{formatCurrency(currentSales)}</div>
        <div className={`stat-change ${getChangeClass(salesChange)}`}>
          {formatChange(salesChange)}
        </div>
      </div>
      <div className="stat-card-compact">
        <h3>Заказы</h3>
        <div className="stat-value">{currentOrders}</div>
        <div className={`stat-change ${getChangeClass(ordersChange)}`}>
          {ordersChange > 0 ? '+' : ''}{ordersChange}
        </div>
      </div>
      <div className="stat-card-compact">
        <h3>Конверсия</h3>
        <div className="stat-value">12.4%</div>
        <div className="stat-change positive">+1.2%</div>
      </div>
      <div className="stat-card-compact">
        <h3>Товары в наличии</h3>
        <div className="stat-value">{loading ? 'Загрузка...' : (stocksData?.total_stocks || 0)}</div>
        <div className="stat-change">-</div>
      </div>
    </div>
  );
};

export default PeriodStats;
