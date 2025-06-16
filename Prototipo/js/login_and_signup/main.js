document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault(); 
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            if (email && password ) {
                // Simular login bem-sucedido
                alert('você está logado com sucesso!');
                
                
                localStorage.setItem('userLoggedIn', 'true');
                localStorage.setItem('userName', 'Fulano'); 
                // Redirecionar para a página principal
                window.location.href = 'html/home.html';
            } else {
                alert('Por favor, verifique seu email e senha.');
            }
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (email && password && confirmPassword) {
                if (password === confirmPassword) {
                    console.log('senha confirmada');
                    // Simular cadastro e redirecionar para login
                    
                    alert('Cadastro realizado com sucesso! Você será redirecionado para o login.');
                    window.location.href = '../index.html';
                } else {
                    alert('As senhas não coincidem.');
                }
            } else {
                alert('Por favor, preencha todos os campos.');
            }
        });
    }

    
});

