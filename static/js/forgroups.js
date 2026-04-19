//логика подключений к группу


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
    const regForm = document.getElementById("regForm");
    if (regForm) {
        regForm.addEventListener("submit", function(event) {
            event.preventDefault();
            const groupname = document.getElementById("regUsername").value;
            const password = document.getElementById("regPassword").value;

            if (!groupname || !password) {
                alert("Заполните все поля")
                return
            }
            const userId = localStorage.getItem('userId')
            sendData('/groups/registration',
                { groupname, password, userId, Admins:[], Users:[] },
                function(response) {
                    console.log('Ответ сервера:', response)
                    alert(response.message || "Регистрация успешна");
                    if(response.message==="ALL OK"){


                        window.location.href = "/static/aflr1/aflr2/settingsgroup.html?groupId=" + response.groupId

                    }
                },
                function(error) {
                    alert(error);
                }
            )

        })
    }

    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", function(event) {
            event.preventDefault();
            const groupname = document.getElementById("loginUsername").value;
            const password = document.getElementById("loginPassword").value;

            if (!groupname || !password) {
                alert("Заполните все поля");
                return;
            }
            sendData('/groups/login',
                { groupname, password },
                function(response) {
                    if (response.token) {
                        localStorage.setItem("token", response.token);
                        alert("Вход выполнен");
                        window.location.href = "/static/aflr1/aflr2/addUsers.html?groupId="+response.groupId;
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
})