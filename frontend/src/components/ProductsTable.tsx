import React, { useEffect, useState } from 'react';
import { useApiWithWbLks } from '../hooks/useApiWithWbLks';

interface Product {
  nmid: number;
  vendorcode: string;
  brand: string;
  title: string;
  subjectname: string;
  orders: number;
  quantity: number;
  orders_per_day_7d: number;
}

interface ProductsTableProps {
  dateFrom: string;
  dateTo: string;
}

const ProductsTable: React.FC<ProductsTableProps> = ({ dateFrom, dateTo }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { fetchWithWbLks, selectedWbLks } = useApiWithWbLks();

  useEffect(() => {
    const fetchProducts = async () => {
      if (!dateFrom || !dateTo) return;
      
      try {
        setLoading(true);
        const data = await fetchWithWbLks('/analytics/products', {
          method: 'GET',
        }, {
          date_from: dateFrom,
          date_to: dateTo
        });
        
        setProducts(data.products);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
        console.error('Ошибка загрузки товаров:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [dateFrom, dateTo, selectedWbLks]);

  if (loading) {
    return (
      <div className="analytics-table-section">
        <div className="table-card">
          <h3>Анализ товаров</h3>
          <div className="table-container">
            <div className="loading-placeholder">📊 Загрузка данных...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-table-section">
        <div className="table-card">
          <h3>Анализ товаров</h3>
          <div className="table-container">
            <div className="error-placeholder">❌ Ошибка: {error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
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
              {products.map((product) => (
                <tr key={product.nmid}>
                  <td>{product.nmid}</td>
                  <td>---</td>
                  <td>₽ ---</td>
                  <td>₽ ---</td>
                  <td>---%</td>
                  <td>{product.orders}</td>
                  <td>{product.quantity}</td>
                  <td>{product.orders_per_day_7d} дней</td>
                  <td>₽ ---</td>
                  <td style={{ color: '#00ff41' }}>---%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductsTable;
