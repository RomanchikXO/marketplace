// frontend/src/components/modules/Analytics.tsx
import React from 'react';

const Analytics: React.FC = () => {
  return (
    <div className="module-content">
      <h2>📊 Дашборд</h2>
      <div className="stats-grid-compact">
        <div className="stat-card-compact">
          <h3>Общие продажи</h3>
          <div className="stat-value">₽ 1,234,567</div>
          <div className="stat-change positive">+12.5%</div>
        </div>
        <div className="stat-card-compact">
          <h3>Активные заказы</h3>
          <div className="stat-value">156</div>
          <div className="stat-change positive">+8</div>
        </div>
        <div className="stat-card-compact">
          <h3>Конверсия</h3>
          <div className="stat-value">12.4%</div>
          <div className="stat-change positive">+1.2%</div>
        </div>
        <div className="stat-card-compact">
          <h3>Товары в наличии</h3>
          <div className="stat-value">2,439</div>
          <div className="stat-change negative">-23</div>
        </div>
      </div>

      <div className="charts-section-full">
        <div className="chart-card-full">
          <h3>График продаж</h3>
          <div className="chart-placeholder">
            📈 Здесь будет график продаж за последние 30 дней
          </div>
        </div>
      </div>

      <div className="analytics-table-section">
        <div className="table-card">
          <h3>Анализ товаров</h3>
          <div className="table-container">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Артикул</th>
                  <th>Маржа</th>
                  <th>ЧП</th>
                  <th>Расход на рекламу</th>
                  <th>ДРР</th>
                  <th>Заказы</th>
                  <th>Остатки</th>
                  <th>До аут оф стока</th>
                  <th>СПП</th>
                  <th>Изменение цены</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>WB001234567</td>
                  <td>35%</td>
                  <td>₽ 2,450</td>
                  <td>₽ 890</td>
                  <td>12.5%</td>
                  <td>43</td>
                  <td>156</td>
                  <td>8 дней</td>
                  <td>₽ 1,290</td>
                  <td style={{ color: '#00ff41' }}>+5%</td>
                </tr>
                <tr>
                  <td>WB987654321</td>
                  <td>28%</td>
                  <td>₽ 1,890</td>
                  <td>₽ 650</td>
                  <td>18.2%</td>
                  <td>67</td>
                  <td>89</td>
                  <td>5 дней</td>
                  <td>₽ 980</td>
                  <td style={{ color: '#ff4444' }}>-2%</td>
                </tr>
                <tr>
                  <td>WB456789012</td>
                  <td>42%</td>
                  <td>₽ 3,210</td>
                  <td>₽ 1,120</td>
                  <td>9.8%</td>
                  <td>89</td>
                  <td>234</td>
                  <td>12 дней</td>
                  <td>₽ 1,850</td>
                  <td style={{ color: '#00ff41aa' }}>0%</td>
                </tr>
                <tr>
                  <td>WB789012345</td>
                  <td>31%</td>
                  <td>₽ 2,150</td>
                  <td>₽ 780</td>
                  <td>15.4%</td>
                  <td>52</td>
                  <td>67</td>
                  <td>3 дня</td>
                  <td>₽ 1,150</td>
                  <td style={{ color: '#00ff41' }}>+8%</td>
                </tr>
                <tr>
                  <td>WB234567890</td>
                  <td>39%</td>
                  <td>₽ 2,780</td>
                  <td>₽ 950</td>
                  <td>11.2%</td>
                  <td>71</td>
                  <td>189</td>
                  <td>15 дней</td>
                  <td>₽ 1,450</td>
                  <td style={{ color: '#ff4444' }}>-1%</td>
                </tr>
                <tr>
                  <td>WB567890123</td>
                  <td>26%</td>
                  <td>₽ 1,650</td>
                  <td>₽ 590</td>
                  <td>21.7%</td>
                  <td>38</td>
                  <td>45</td>
                  <td>2 дня</td>
                  <td>₽ 890</td>
                  <td style={{ color: '#00ff41' }}>+12%</td>
                </tr>
                <tr>
                  <td>WB890123456</td>
                  <td>45%</td>
                  <td>₽ 3,890</td>
                  <td>₽ 1,340</td>
                  <td>8.1%</td>
                  <td>95</td>
                  <td>312</td>
                  <td>18 дней</td>
                  <td>₽ 2,120</td>
                  <td style={{ color: '#00ff41' }}>+3%</td>
                </tr>
                <tr>
                  <td>WB123456789</td>
                  <td>33%</td>
                  <td>₽ 2,340</td>
                  <td>₽ 820</td>
                  <td>14.6%</td>
                  <td>58</td>
                  <td>123</td>
                  <td>7 дней</td>
                  <td>₽ 1,340</td>
                  <td style={{ color: '#ff4444' }}>-4%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;