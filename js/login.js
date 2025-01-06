const API_BASE_URL = 'http://192.168.56.104:8000';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await axios.post(`${API_BASE_URL}/api/token/`, {
            username,
            password
        });

        // JWT 토큰 저장
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);

        // 메인 페이지로 이동
        window.location.href = 'index.html';
    } catch (error) {
        // 여기서 CORS 에러가 발생할 것입니다!
        console.error('Error:', error);
        alert('로그인 실패: ' + error.message);
    }
});
