const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Создаем базу данных
const dbPath = path.join(__dirname, 'enterprises.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Ошибка подключения к базе данных:', err);
  } else {
    console.log('✓ Подключение к базе данных успешно');
  }
});

// Создаем таблицу для предприятий
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS enterprises (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      industry TEXT NOT NULL,
      region TEXT NOT NULL,
      employees INTEGER NOT NULL,
      revenue REAL NOT NULL,
      taxesPaid REAL NOT NULL,
      registrationDate TEXT NOT NULL,
      lastUpdated TEXT NOT NULL,
      status TEXT NOT NULL,
      address TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      latitude REAL,
      longitude REAL
    )
  `, (err) => {
    if (err) {
      console.error('Ошибка создания таблицы:', err);
    } else {
      console.log('✓ Таблица enterprises готова');
    }
  });
});

// Функция для добавления предприятия
const addEnterprise = (enterprise) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO enterprises (
        id, name, industry, region, employees, revenue, taxesPaid,
        registrationDate, lastUpdated, status, address, phone, email, latitude, longitude
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [
      enterprise.id,
      enterprise.name,
      enterprise.industry,
      enterprise.region,
      enterprise.employees,
      enterprise.revenue,
      enterprise.taxesPaid,
      enterprise.registrationDate,
      enterprise.lastUpdated,
      enterprise.status,
      enterprise.contactInfo.address,
      enterprise.contactInfo.phone || null,
      enterprise.contactInfo.email || null,
      enterprise.latitude || null,
      enterprise.longitude || null
    ], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID });
      }
    });
  });
};

// Функция для получения всех предприятий
const getAllEnterprises = (filters = {}) => {
  return new Promise((resolve, reject) => {
    let sql = 'SELECT * FROM enterprises WHERE 1=1';
    const params = [];

    // Применяем фильтры
    if (filters.industries && filters.industries.length > 0) {
      const placeholders = filters.industries.map(() => '?').join(',');
      sql += ` AND industry IN (${placeholders})`;
      params.push(...filters.industries);
    }

    if (filters.regions && filters.regions.length > 0) {
      const placeholders = filters.regions.map(() => '?').join(',');
      sql += ` AND region IN (${placeholders})`;
      params.push(...filters.regions);
    }

    if (filters.employeeRange) {
      if (filters.employeeRange.min !== undefined) {
        sql += ' AND employees >= ?';
        params.push(filters.employeeRange.min);
      }
      if (filters.employeeRange.max !== undefined) {
        sql += ' AND employees <= ?';
        params.push(filters.employeeRange.max);
      }
    }

    if (filters.revenueRange) {
      if (filters.revenueRange.min !== undefined) {
        sql += ' AND revenue >= ?';
        params.push(filters.revenueRange.min);
      }
      if (filters.revenueRange.max !== undefined) {
        sql += ' AND revenue <= ?';
        params.push(filters.revenueRange.max);
      }
    }

    if (filters.status) {
      sql += ' AND status = ?';
      params.push(filters.status);
    }

    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        // Преобразуем данные в нужный формат
        const enterprises = rows.map(row => ({
          id: row.id,
          name: row.name,
          industry: row.industry,
          region: row.region,
          employees: row.employees,
          revenue: row.revenue,
          taxesPaid: row.taxesPaid,
          registrationDate: row.registrationDate,
          lastUpdated: row.lastUpdated,
          status: row.status,
          latitude: row.latitude,
          longitude: row.longitude,
          contactInfo: {
            address: row.address,
            phone: row.phone,
            email: row.email
          }
        }));
        resolve(enterprises);
      }
    });
  });
};

// Функция для получения статистики
const getStatistics = () => {
  return new Promise((resolve, reject) => {
    const queries = {
      total: 'SELECT COUNT(*) as total FROM enterprises',
      byIndustry: 'SELECT industry, COUNT(*) as count, SUM(revenue) as totalRevenue, AVG(employees) as avgEmployees FROM enterprises GROUP BY industry',
      byRegion: 'SELECT region, COUNT(*) as count, SUM(revenue) as totalRevenue, AVG(employees) as avgEmployees FROM enterprises GROUP BY region',
      byStatus: 'SELECT status, COUNT(*) as count FROM enterprises GROUP BY status'
    };

    const results = {};

    // Получаем общее количество
    db.get(queries.total, (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      results.total = row.total;

      // Получаем статистику по отраслям
      db.all(queries.byIndustry, (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        results.byIndustry = rows;

        // Получаем статистику по регионам
        db.all(queries.byRegion, (err, rows) => {
          if (err) {
            reject(err);
            return;
          }
          results.byRegion = rows;

          // Получаем статистику по статусам
          db.all(queries.byStatus, (err, rows) => {
            if (err) {
              reject(err);
              return;
            }
            results.byStatus = rows;
            resolve(results);
          });
        });
      });
    });
  });
};

// Функция для удаления всех предприятий
const clearAllEnterprises = () => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM enterprises', (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// Функция для получения предприятия по ID
const getEnterpriseById = (id) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM enterprises WHERE id = ?', [id], (err, row) => {
      if (err) {
        reject(err);
      } else if (!row) {
        resolve(null);
      } else {
        resolve({
          id: row.id,
          name: row.name,
          industry: row.industry,
          region: row.region,
          employees: row.employees,
          revenue: row.revenue,
          taxesPaid: row.taxesPaid,
          registrationDate: row.registrationDate,
          lastUpdated: row.lastUpdated,
          status: row.status,
          latitude: row.latitude,
          longitude: row.longitude,
          contactInfo: {
            address: row.address,
            phone: row.phone,
            email: row.email
          }
        });
      }
    });
  });
};

module.exports = {
  db,
  addEnterprise,
  getAllEnterprises,
  getStatistics,
  clearAllEnterprises,
  getEnterpriseById
};
