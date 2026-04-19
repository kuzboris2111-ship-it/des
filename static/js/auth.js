function sendData(url, data, successCallback, errorCallback) {
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", function(event) {
        try {
            const response = JSON.parse(event.target.responseText);
            successCallback(response);
        } catch(e) {
            errorCallback("Ошибка обработки ответа");
        }
    });
    XHR.addEventListener("error", function(event) {
        errorCallback("Ошибка соединения с сервером");
    });
    XHR.open("POST", url);
    XHR.setRequestHeader("Content-Type", "application/json");
    XHR.send(JSON.stringify(data));
}

window.addEventListener("load", function() {
//регистрация уже на прямую берем
    const regForm = document.getElementById("registerForm");
    if (regForm) {
        regForm.addEventListener("submit", function(event) {
            event.preventDefault();
            const username = document.getElementById("regUsername").value;
            const password = document.getElementById("regPassword").value;

            if (!username || !password) {
                alert("Заполните все поля");
                return;
            }
            sendData('/auth/registration', 
                { username, password },
                function(response) {

                    alert(response.message || "Регистрация успешна");
                    if(response.message==="ALL OK"){
                        localStorage.setItem('username', username)
                        window.location.href = "/static/mainpage.html";
                    }
                },
                function(error) {
                    alert(error);
                }
            );
        });
    }
//вход в аккаунт
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", function(event) {
            event.preventDefault();
            const username = document.getElementById("loginUsername").value
            const password = document.getElementById("loginPassword").value
            
            if (!username || !password) {
                alert("Заполните все поля");
                return;
            }
            sendData('/auth/login', 
                { username, password },
                function(response) {
                    if (response.token) {
                        localStorage.setItem("token", response.token)
                        localStorage.setItem("userId", response.userId)
                        localStorage.setItem('username', response.username)
                        alert("Вход выполнен");
                        window.location.href = "/static/mainpage.html";
                    } else {
                        alert(response.message || "Ошибка входа");
                    }
                },
                function(error) {
                    alert(error);
                }
            );
        });
    }
});