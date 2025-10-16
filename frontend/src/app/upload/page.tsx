'use client';

import { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import { parseCSV, parseExcel } from '../lib/data-utils';
import { UploadResult } from '../types/enterprise';

export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadResult(null);

    try {
      let result: UploadResult;

      if (file.name.endsWith('.csv')) {
        result = await parseCSV(file);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        result = await parseExcel(file);
      } else {
        result = {
          success: false,
          message: 'Неподдерживаемый формат файла. Поддерживаются только CSV и Excel файлы.',
          processedCount: 0,
          errorCount: 1,
          errors: ['Неподдерживаемый формат файла']
        };
      }

      setUploadResult(result);
    } catch (error) {
      setUploadResult({
        success: false,
        message: `Ошибка при обработке файла: ${(error as Error).message}`,
        processedCount: 0,
        errorCount: 1,
        errors: [(error as Error).message]
      });
    } finally {
      setIsUploading(false);
    }
  };

  const clearResults = () => {
    setUploadResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Заголовок */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Загрузка данных предприятий</h1>
        <p className="text-gray-600 mt-2">
          Загрузите файл CSV или Excel с данными о предприятиях Москвы для анализа
        </p>
      </div>

      {/* Зона загрузки */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div
          className={`
            border-2 border-dashed rounded-lg p-12 text-center transition-colors
            ${isDragging 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
            }
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-gray-100 rounded-full">
              <Upload className="w-8 h-8 text-gray-600" />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Перетащите файл сюда или выберите файл
              </h3>
              <p className="text-gray-500 mt-1">
                Поддерживаются форматы: CSV, Excel (XLSX, XLS)
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <label className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                Выбрать файл
              </label>

              <button
                onClick={() => {
                  // Загружаем демонстрационные данные
                  const demoResult: UploadResult = {
                    success: true,
                    message: 'Загружены демонстрационные данные',
                    processedCount: 100,
                    errorCount: 5,
                    errors: [
                      'Строка 15: Некорректная отрасль',
                      'Строка 23: Отсутствует адрес',
                      'Строка 34: Некорректное количество сотрудников',
                      'Строка 67: Некорректный регион',
                      'Строка 89: Некорректная выручка'
                    ]
                  };
                  setUploadResult(demoResult);
                }}
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Загрузить демо-данные
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Индикатор загрузки */}
      {isUploading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <div>
              <p className="font-medium text-blue-900">Обработка файла...</p>
              <p className="text-blue-700 text-sm">Пожалуйста, подождите</p>
            </div>
          </div>
        </div>
      )}

      {/* Результат загрузки */}
      {uploadResult && (
        <div className={`
          rounded-lg p-6 border
          ${uploadResult.success 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
          }
        `}>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              {uploadResult.success ? (
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
              )}
              <div>
                <h3 className={`font-semibold ${
                  uploadResult.success ? 'text-green-900' : 'text-red-900'
                }`}>
                  {uploadResult.success ? 'Загрузка завершена' : 'Ошибка загрузки'}
                </h3>
                <p className={`mt-1 ${
                  uploadResult.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {uploadResult.message}
                </p>
              </div>
            </div>
            <button
              onClick={clearResults}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Статистика */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{uploadResult.processedCount}</p>
                <p className="text-sm text-gray-600">Обработано записей</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{uploadResult.errorCount}</p>
                <p className="text-sm text-gray-600">Ошибок</p>
              </div>
            </div>
          </div>

          {/* Ошибки */}
          {uploadResult.errors.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-gray-900 mb-2">Найденные ошибки:</h4>
              <div className="bg-white rounded-lg border max-h-40 overflow-y-auto">
                <div className="p-4 space-y-2">
                  {uploadResult.errors.slice(0, 10).map((error, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-gray-700">{error}</p>
                    </div>
                  ))}
                  {uploadResult.errors.length > 10 && (
                    <p className="text-sm text-gray-500 italic">
                      И ещё {uploadResult.errors.length - 10} ошибок...
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Инструкции */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Формат данных</h3>
        <div className="space-y-4">
          <p className="text-gray-700">
            Файл должен содержать следующие столбцы:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="font-medium">name</span> - Название предприятия
              </div>
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="font-medium">industry</span> - Отрасль
              </div>
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="font-medium">region</span> - Регион Москвы
              </div>
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="font-medium">employees</span> - Количество сотрудников
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="font-medium">revenue</span> - Выручка (руб.)
              </div>
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="font-medium">address</span> - Адрес
              </div>
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="font-medium">phone</span> - Телефон (опционально)
              </div>
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="font-medium">email</span> - Email (опционально)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
