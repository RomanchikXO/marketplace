// frontend/src/components/modules/Analytics.tsx
import React from 'react';

const Analytics: React.FC = () => {
  return (
    <div className="module-content">
      <h2>📊 Дашборд</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Общие продажи</h3>
          <div className="stat-value">₽ 1,234,567</div>
          <div className="stat-change positive">+12.5%</div>
        </div>
        <div className="stat-card">
          <h3>Активные заказы</h3>
          <div className="stat-value">156</div>
          <div className="stat-change positive">+8</div>
        </div>
        <div className="stat-card">
          <h3>Товары в наличии</h3>
          <div className="stat-value">2,439</div>
          <div className="stat-change negative">-23</div>
        </div>
        <div className="stat-card">
          <h3>Конверсия</h3>
          <div className="stat-value">12.4%</div>
          <div className="stat-change positive">+1.2%</div>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-card">
          <h3>График продаж</h3>
          <div className="chart-placeholder">
            📈 Здесь будет график продаж за последние 30 дней
          </div>
        </div>
        <div className="chart-card">
          <h3>Топ товары</h3>
          <div className="chart-placeholder">
            🏆 Здесь будет список самых продаваемых товаров
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;