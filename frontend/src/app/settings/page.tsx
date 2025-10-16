'use client';

import { useState } from 'react';
import { Database, Bell, Shield, Download, Upload, Trash2, Eye, Save } from 'lucide-react';

interface SystemSettings {
  dataRetention: number; // в месяцах
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  notifications: {
    email: boolean;
    dataQuality: boolean;
    reports: boolean;
    uploads: boolean;
  };
  security: {
    requireAuth: boolean;
    sessionTimeout: number; // в минутах
    allowFileTypes: string[];
  };
  display: {
    theme: 'light' | 'dark' | 'auto';
    language: 'ru' | 'en';
    dateFormat: 'dd.mm.yyyy' | 'mm/dd/yyyy' | 'yyyy-mm-dd';
    currency: 'RUB' | 'USD' | 'EUR';
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    dataRetention: 24,
    autoBackup: true,
    backupFrequency: 'weekly',
    notifications: {
      email: true,
      dataQuality: true,
      reports: false,
      uploads: true
    },
    security: {
      requireAuth: false,
      sessionTimeout: 60,
      allowFileTypes: ['.csv', '.xlsx', '.xls']
    },
    display: {
      theme: 'light',
      language: 'ru',
      dateFormat: 'dd.mm.yyyy',
      currency: 'RUB'
    }
  });

  const [uploadedFiles, setUploadedFiles] = useState([
    { id: '1', name: 'enterprises_2024_01.csv', size: '2.3 MB', uploadDate: '2024-01-15', status: 'processed' },
    { id: '2', name: 'enterprises_2024_02.xlsx', size: '1.8 MB', uploadDate: '2024-02-15', status: 'processed' },
    { id: '3', name: 'enterprises_2024_03.csv', size: '2.1 MB', uploadDate: '2024-03-15', status: 'error' },
  ]);

  const [saved, setSaved] = useState(false);

  const updateSettings = (section: keyof SystemSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [key]: value
      }
    }));
  };

  const updateTopLevelSetting = (key: keyof SystemSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = () => {
    // Имитация сохранения настроек
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDeleteFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const handleExportData = () => {
    // Имитация экспорта данных
    const dataToExport = {
      settings,
      files: uploadedFiles,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `settings_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Настройки системы</h1>
          <p className="text-gray-600 mt-2">
            Управление конфигурацией системы анализа данных предприятий
          </p>
        </div>
        <button
          onClick={handleSaveSettings}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
            saved 
              ? 'bg-green-600 text-white' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <Save className="w-5 h-5" />
          <span>{saved ? 'Сохранено!' : 'Сохранить'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Основные настройки */}
        <div className="lg:col-span-2 space-y-6">
          {/* Хранение данных */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center space-x-3 mb-4">
              <Database className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Хранение данных</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Период хранения данных (месяцев)
                </label>
                <select
                  value={settings.dataRetention}
                  onChange={(e) => updateTopLevelSetting('dataRetention', parseInt(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value={12}>12 месяцев</option>
                  <option value={24}>24 месяца</option>
                  <option value={36}>36 месяцев</option>
                  <option value={60}>5 лет</option>
                </select>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="autoBackup"
                  checked={settings.autoBackup}
                  onChange={(e) => updateTopLevelSetting('autoBackup', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="autoBackup" className="text-gray-700">
                  Автоматическое резервное копирование
                </label>
              </div>

              {settings.autoBackup && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Частота резервного копирования
                  </label>
                  <select
                    value={settings.backupFrequency}
                    onChange={(e) => updateTopLevelSetting('backupFrequency', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="daily">Ежедневно</option>
                    <option value="weekly">Еженедельно</option>
                    <option value="monthly">Ежемесячно</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Уведомления */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center space-x-3 mb-4">
              <Bell className="w-6 h-6 text-yellow-600" />
              <h3 className="text-lg font-semibold text-gray-900">Уведомления</h3>
            </div>

            <div className="space-y-4">
              {Object.entries(settings.notifications).map(([key, value]) => {
                const notificationNames = {
                  email: 'Email уведомления',
                  dataQuality: 'Проблемы с качеством данных',
                  reports: 'Готовность отчётов',
                  uploads: 'Статус загрузки файлов'
                };

                return (
                  <div key={key} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id={key}
                      checked={value}
                      onChange={(e) => updateSettings('notifications', key, e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor={key} className="text-gray-700">
                      {notificationNames[key as keyof typeof notificationNames]}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Безопасность */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">Безопасность</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="requireAuth"
                  checked={settings.security.requireAuth}
                  onChange={(e) => updateSettings('security', 'requireAuth', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="requireAuth" className="text-gray-700">
                  Требовать авторизацию
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Таймаут сессии (минут)
                </label>
                <input
                  type="number"
                  min="15"
                  max="480"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => updateSettings('security', 'sessionTimeout', parseInt(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Разрешённые типы файлов
                </label>
                <div className="flex flex-wrap gap-2">
                  {['.csv', '.xlsx', '.xls', '.json'].map(type => (
                    <button
                      key={type}
                      onClick={() => {
                        const currentTypes = settings.security.allowFileTypes;
                        const newTypes = currentTypes.includes(type)
                          ? currentTypes.filter(t => t !== type)
                          : [...currentTypes, type];
                        updateSettings('security', 'allowFileTypes', newTypes);
                      }}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        settings.security.allowFileTypes.includes(type)
                          ? 'bg-blue-100 border-blue-300 text-blue-800'
                          : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Отображение */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center space-x-3 mb-4">
              <Eye className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Интерфейс</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Тема оформления
                </label>
                <select
                  value={settings.display.theme}
                  onChange={(e) => updateSettings('display', 'theme', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="light">Светлая</option>
                  <option value="dark">Тёмная</option>
                  <option value="auto">Автоматически</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Язык
                </label>
                <select
                  value={settings.display.language}
                  onChange={(e) => updateSettings('display', 'language', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ru">Русский</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Формат даты
                </label>
                <select
                  value={settings.display.dateFormat}
                  onChange={(e) => updateSettings('display', 'dateFormat', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="dd.mm.yyyy">ДД.ММ.ГГГГ</option>
                  <option value="mm/dd/yyyy">ММ/ДД/ГГГГ</option>
                  <option value="yyyy-mm-dd">ГГГГ-ММ-ДД</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Валюта
                </label>
                <select
                  value={settings.display.currency}
                  onChange={(e) => updateSettings('display', 'currency', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="RUB">Рубли (₽)</option>
                  <option value="USD">Доллары ($)</option>
                  <option value="EUR">Евро (€)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Боковая панель */}
        <div className="space-y-6">
          {/* Статистика системы */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Статистика системы</h3>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Загруженных файлов:</span>
                <span className="font-semibold">{uploadedFiles.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Размер данных:</span>
                <span className="font-semibold">6.2 MB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Последнее обновление:</span>
                <span className="font-semibold">Сегодня</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Статус системы:</span>
                <span className="text-green-600 font-semibold">Работает</span>
              </div>
            </div>
          </div>

          {/* Действия */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Действия</h3>

            <div className="space-y-3">
              <button
                onClick={handleExportData}
                className="w-full flex items-center space-x-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Экспорт настроек</span>
              </button>

              <button className="w-full flex items-center space-x-2 p-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <Upload className="w-4 h-4" />
                <span>Импорт настроек</span>
              </button>

              <button className="w-full flex items-center space-x-2 p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                <Trash2 className="w-4 h-4" />
                <span>Очистить данные</span>
              </button>
            </div>
          </div>

          {/* Управление файлами */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Загруженные файлы</h3>

            <div className="space-y-3">
              {uploadedFiles.map(file => (
                <div key={file.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{file.size} • {file.uploadDate}</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      file.status === 'processed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {file.status === 'processed' ? 'Обработан' : 'Ошибка'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteFile(file.id)}
                    className="ml-2 text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
