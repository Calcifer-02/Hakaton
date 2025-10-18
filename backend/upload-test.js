const fs = require('fs');
const FormData = require('form-data');
const http = require('http');

const filePath = './sample_data.csv';
const form = new FormData();

form.append('file', fs.createReadStream(filePath));

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/upload',
  method: 'POST',
  headers: form.getHeaders()
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('\n✅ Результат загрузки:');
    console.log(JSON.stringify(JSON.parse(data), null, 2));
  });
});

req.on('error', (error) => {
  console.error('❌ Ошибка:', error.message);
});

form.pipe(req);

