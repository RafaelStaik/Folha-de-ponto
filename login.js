(function initializeDatabase() {
    // Usuários padrão/iniciais
    const defaultUsers = [
      {
        "id": "enzo_ferreira",
        "username": "enzo",
        "password": "123",
        "fullName": "Enzo Rafael Gomes Ferreira"
      },
      {
        "id": "outro_usuario",
        "username": "outro",
        "password": "456",
        "fullName": "Outro Funcionário de Teste"
      }
    ];

    // Verifica se a "base de dados" de usuários já existe no localStorage
    if (!localStorage.getItem('timesheet_users')) {
        // Se não existir, cria a base com os usuários padrão
        localStorage.setItem('timesheet_users', JSON.stringify(defaultUsers));
    }
})();

document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); 

    // Carrega a lista de usuários a partir do localStorage
    const users = JSON.parse(localStorage.getItem('timesheet_users')) || [];

    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');

    // Procura pelo usuário na lista carregada do localStorage
    const foundUser = users.find(user => user.username === usernameInput && user.password === passwordInput);

    if (foundUser) {
        // Sucesso!
        sessionStorage.setItem('loggedInUserID', foundUser.id);
        sessionStorage.setItem('loggedInUserName', foundUser.fullName);
   
 //".." : Significa "voltar uma pasta". Ou seja, do diretório Arquivos login, ele volta para a pasta Folha de ponto - Target.
 //"/Arquivos folha de ponto": Depois, ele entra na pasta Arquivos folha de ponto.
 //"/Folha de ponto.html": Por fim, ele encontra o arquivo.

    // Quando copiar o caminho ele vai vir com "\" e precisar substituir por "/"     
        window.location.href = "folha_de_ponto.html";
    } else {
        // Credenciais incorretas
        errorMessage.textContent = 'Usuário ou senha inválidos.';
    }
});