document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('message');

    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            messageDiv.innerHTML = 'Вход выполнен успешно! Перенаправление...';
            messageDiv.className = 'message success';

            // Сохраняем токен в localStorage
            localStorage.setItem('authToken', data.token);

            // Редирект на localhost:3000 через 1 секунду
            setTimeout(() => {
                window.location.href = 'http://localhost:3000';
            }, 1000);
        } else {
            messageDiv.innerHTML = data.message || 'Ошибка входа';
            messageDiv.className = 'message error';
        }
    } catch (error) {
        messageDiv.innerHTML = 'Ошибка соединения с сервером';
        messageDiv.className = 'message error';
    }
});

