// frontend/src/components/OrdersChart.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface OrdersChartData {
  date: string;
  count: number;
}

interface OrdersChartResponse {
  data: OrdersChartData[];
  total_orders: number;
}

const OrdersChart: React.FC = () => {
  const [chartData, setChartData] = useState<OrdersChartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrdersData = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL || '/api';
        const response = await fetch(`${apiUrl}/analytics/orders-chart`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: OrdersChartResponse = await response.json();
        setChartData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
        console.error('Ошибка загрузки данных заказов:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrdersData();
  }, []);

  if (loading) {
    return (
      <div className="chart-placeholder">
        📈 Загрузка данных заказов...
      </div>
    );
  }

  if (error) {
    return (
      <div className="chart-placeholder">
        ❌ Ошибка загрузки: {error}
      </div>
    );
  }

  if (!chartData || chartData.data.length === 0) {
    return (
      <div className="chart-placeholder">
        📊 Нет данных за последние 30 дней
      </div>
    );
  }

  const data = {
    labels: chartData.data.map(item => item.date),
    datasets: [
      {
        label: 'Заказы',
        data: chartData.data.map(item => item.count),
        borderColor: '#00ff41',
        backgroundColor: 'rgba(0, 255, 65, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#00ff41',
        pointBorderColor: '#00ff41',
        pointHoverBackgroundColor: '#00cc33',
        pointHoverBorderColor: '#00cc33',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#00ff41',
          font: {
            family: "'Courier New', monospace",
          },
        },
      },
      title: {
        display: true,
        text: `Общее количество заказов: ${chartData.total_orders}`,
        color: '#00ff41aa',
        font: {
          family: "'Courier New', monospace",
          size: 14,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#00ff41',
        bodyColor: '#00ff41aa',
        borderColor: '#00ff41',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: 'day' as const,
          displayFormats: {
            day: 'MMM d',
          },
        },
        grid: {
          color: '#00ff4125',
        },
        ticks: {
          color: '#00ff41aa',
          font: {
            family: "'Courier New', monospace",
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#00ff4125',
        },
        ticks: {
          color: '#00ff41aa',
          font: {
            family: "'Courier New', monospace",
          },
        },
      },
    },
  };

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default OrdersChart;
