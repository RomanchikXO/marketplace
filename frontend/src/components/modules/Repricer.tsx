// frontend/src/components/modules/Repricer.tsx
import React from 'react';

const Repricer: React.FC = () => {
  return (
    <div className="module-content">
      <h2>💰 Репрайсер</h2>
      <div className="feature-grid">
        <div className="feature-card">
          <h3>Настройки цен</h3>
          <p>Управление стратегиями ценообразования для различных товарных групп</p>
          <button className="feature-btn">Настроить</button>
        </div>
        <div className="feature-card">
          <h3>Мониторинг конкурентов</h3>
          <p>Отслеживание изменений цен конкурентов в режиме реального времени</p>
          <button className="feature-btn">Просмотреть</button>
        </div>
        <div className="feature-card">
          <h3>Автоматизация</h3>
          <p>Автоматическое обновление цен по заданным правилам</p>
          <button className="feature-btn">Запустить</button>
        </div>
        <div className="feature-card">
          <h3>История изменений</h3>
          <p>Анализ эффективности изменений цен и их влияния на продажи</p>
          <button className="feature-btn">Анализ</button>
        </div>
      </div>
    </div>
  );
};

export default Repricer;