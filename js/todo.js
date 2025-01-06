const API_BASE_URL = 'http://192.168.56.104:8000';

// Axios 기본 설정
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


// Todo 목록 조회
async function fetchTodos() {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/todos/`);
        const todoList = document.getElementById('todoList');
        todoList.innerHTML = response.data.map(todo => `
            <div class="flex items-center justify-between bg-blue-50 p-4 rounded-lg shadow-sm" onclick="showTodoDetail(${todo.id})">
                        <div class="flex items-center space-x-4">
                            <input type="checkbox"
                                   class="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-400"
                                   ${todo.is_completed ? 'checked' : ''}
                                   onchange="toggleTodo(${todo.id}, this.checked)">
                            <div>
                                <p class="${todo.is_completed ? 'line-through text-blue-400' : 'text-blue-800'}">${todo.title}</p>
                                <p class="text-sm text-blue-600">${todo.content}</p>
                            </div>
                        </div>
                        <button onclick="deleteTodo(${todo.id})" class="text-red-400 hover:text-red-600">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                            </svg>
                        </button>
                    </div>
        `).join('');
    } catch (error) {
        console.error('Error:', error);
        if (error.response?.status === 401) {
            // 토큰이 만료된 경우
            window.location.href = 'login.html';
        }
    }
}

//폼 제출 이벤트 리스너 추가
//문서에서 id가 createTodoForm인 form에서 title과 content를 받아서
// /api/todos/로 post방식으로 담아서 보내면 생성
document.getElementById("createTodoForm").addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const titleInput = document.getElementById("newTodoTitle");
    const title = titleInput.value;
    const contentInput = document.getElementById("newTodoContent");
    const content = contentInput.value;

    try{
        await axios.post(`${API_BASE_URL}/api/todos/`,{
            "title":title,
            "content":content
        });
        // 입력 필드 초기화
        titleInput.value='';
        contentInput.value='';
        //목록 새로고침
        fetchTodos();
    }catch(error){
        console.error('Error : ', error);
        alert('Todo 생성 실패 : ' + error.message);
    }
});

// 페이지 로드 시 Todo 목록 조회
document.addEventListener('DOMContentLoaded', fetchTodos); 

let currentTodoId=null;

// Todo 항목 클릭 이벤트 처리
async function showTodoDetail(id) {
    try {
        currentTodoId=id;
        const response = await axios.get(`${API_BASE_URL}/api/todos/${id}/`);
        const todo = response.data;

        document.getElementById('modalTitle').textContent = todo.title;
        document.getElementById('modalContent').textContent = todo.content || '내용 없음';

        document.getElementById('todoModal').classList.remove('hidden');
    } catch (error) {
        console.error('Error:', error);
        alert('상세 정보 조회 실패: ' + error.message);
    }
}

// 모달 닫기
function closeTodoModal() {
    document.getElementById('todoModal').classList.add('hidden');
}

// Todo 삭제
async function deleteTodo(id) {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
        await axios.delete(`${API_BASE_URL}/api/todos/${id}/`);
        closeTodoModal();
        fetchTodos();
    } catch (error) {
        console.error('Error:', error);
        alert('삭제 실패: ' + error.message);
    }
}

// Todo 수정
async function editTodo() {
    const newTitle = prompt('새 제목을 입력하세요:', document.getElementById('modalTitle').textContent);
    if (!newTitle) return;

    try {
        await axios.put(`${API_BASE_URL}/api/todos/${currentTodoId}/`, {
            title: newTitle,
            content: document.getElementById('modalContent').textContent
        });

        closeTodoModal();
        fetchTodos();
    } catch (error) {
        console.error('Error:', error);
        alert('수정 실패: ' + error.message);
    }
}