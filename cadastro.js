// Função auxiliar para pegar os usuários do localStorage
function getUsersFromStorage() {
    const users = localStorage.getItem('timesheet_users');
    return users ? JSON.parse(users) : [];
}

// Função auxiliar para salvar os usuários no localStorage
function saveUsersToStorage(users) {
    localStorage.setItem('timesheet_users', JSON.stringify(users));
}

document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const fullName = document.getElementById('fullName').value;
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const messageEl = document.getElementById('message');

    // Validações
    if (!fullName || !username || !password) {
        messageEl.textContent = 'Todos os campos são obrigatórios.';
        messageEl.className = 'error';
        return;
    }

    if (password !== confirmPassword) {
        messageEl.textContent = 'As senhas não coincidem.';
        messageEl.className = 'error';
        return;
    }

    const users = getUsersFromStorage();

    // Verifica se o nome de usuário já existe
    const userExists = users.some(user => user.username === username);
    if (userExists) {
        messageEl.textContent = 'Este nome de usuário já está em uso.';
        messageEl.className = 'error';
        return;
    }

    // Cria o novo usuário
    const newUser = {
        id: username + '_' + Date.now(), // ID único simples
        username: username,
        password: password,
        fullName: fullName
    };

    // Adiciona o novo usuário à lista e salva
    users.push(newUser);
    saveUsersToStorage(users);

    // Exibe mensagem de sucesso e limpa o formulário
    messageEl.textContent = 'Usuário cadastrado com sucesso! Redirecionando...';
    messageEl.className = 'success';
    document.getElementById('registerForm').reset();

    // Redireciona para o login após 2 segundos
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);
});