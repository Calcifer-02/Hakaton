document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const messageDiv = document.getElementById('message');

    // Проверяем совпадение паролей
    if (password !== confirmPassword) {
        messageDiv.innerHTML = 'Пароли не совпадают';
        messageDiv.className = 'message error';
        return;
    }

    try {
        const response = await fetch('/auth/registration', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            messageDiv.innerHTML = 'Регистрация успешна! Перенаправление на страницу входа...';
            messageDiv.className = 'message success';

            // Перенаправляем на страницу входа через 2 секунды
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        } else {
            messageDiv.innerHTML = data.message || 'Ошибка регистрации';
            messageDiv.className = 'message error';
        }
    } catch (error) {
        messageDiv.innerHTML = 'Ошибка соединения с сервером';
        messageDiv.className = 'message error';
    }
});

