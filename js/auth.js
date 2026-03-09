// ================================
// KIỂM TRA ĐĂNG NHẬP TRANG CHỦ
// ================================
if (window.location.pathname.includes("index.html")) {
    const user = localStorage.getItem("user");

    if (!user) {
        window.location.href = "login.html";
    } else {
        const welcome = document.getElementById("welcome");
        if (welcome) {
            welcome.innerText = "Xin chào, " + user;
        }
    }
}

// ================================
// ĐĂNG NHẬP
// ================================
function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (username === "admin" && password === "0825181835") {
        localStorage.setItem("user", username);
        window.location.href = "index.html";
    } else {
        document.getElementById("error").innerText =
            "Sai tài khoản hoặc mật khẩu";
    }
}

// ================================
// ĐĂNG XUẤT
// ================================
function logout() {
    localStorage.removeItem("user");
    window.location.href = "login.html";
}
