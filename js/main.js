// 1. KHAI BÁO BIẾN GIỎ HÀNG
let cart = JSON.parse(localStorage.getItem('cart')) || []; 

document.addEventListener('DOMContentLoaded', () => {
    const productGrid = document.getElementById('productGrid');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    // Các phần tử giao diện cần thay đổi để "biến hình" trang
    const bannerSection = document.querySelector('.hero') || document.querySelector('.banner'); 
    const pageTitle = document.querySelector('.section-title h2'); 

    // --- HÀM BIẾN ĐỔI TRANG RIÊNG ---
    function transformPage(category) {
        if (!productGrid) return;

        // 1. Xóa sạch sản phẩm cũ
        productGrid.innerHTML = ''; 

        // 2. Cập nhật giao diện theo từng "trang riêng"
        if (category === 'all') {
            if (pageTitle) pageTitle.innerText = "SẢN PHẨM MỚI NHẤT";
            // Hiện lại banner trang chủ nếu có
            if (bannerSection) bannerSection.style.display = 'block'; 
        } else {
            if (pageTitle) pageTitle.innerText = "BỘ SƯU TẬP " + category.toUpperCase();
            // Ẩn banner trang chủ để tạo cảm giác sang trang mới
            if (bannerSection) bannerSection.style.display = 'none'; 
        }

        // 3. Lọc và hiển thị sản phẩm
        const filtered = (category === 'all') 
            ? products 
            : products.filter(p => p.category.toLowerCase() === category.toLowerCase());

        productGrid.innerHTML = filtered.map(product => `
            <div class="product-card">
                <div class="product-img">
                    <img src="${product.image}" alt="${product.name}">
                    <button class="quick-add" onclick="addToCart(${product.id})">THÊM VÀO GIỎ +</button>
                </div>
                <div class="product-info">
                    <p class="category-name">${product.category.toUpperCase()}</p>
                    <h3>${product.name}</h3>
                    <p class="price">${product.price.toLocaleString('vi-VN')}₫</p>
                </div>
            </div>`).join('');
            
        // Tự động cuộn lên đầu trang khi "chuyển trang"
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // --- XỬ LÝ CLICK ĐỂ CHUYỂN TRANG RIÊNG ---
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();

            // Đổi gạch chân menu
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const category = this.getAttribute('data-category');
            transformPage(category);
        });
    });

    // Khởi tạo trang chủ ban đầu
    if (typeof products !== 'undefined') transformPage('all');
    updateCartUI();
});

/* --- GIỮ NGUYÊN CÁC HÀM GIỎ HÀNG VÀ DOANH THU BÊN DƯỚI CỦA BẠN --- */
function saveCart() { localStorage.setItem('cart', JSON.stringify(cart)); }
function addToCart(id) {
    const product = products.find(p => p.id === id);
    if (product) {
        const item = cart.find(i => i.id === id);
        item ? item.quantity++ : cart.push({ ...product, quantity: 1 });
        saveCart(); updateCartUI(); openCart();
    }
}
function updateCartUI() {
    const countNav = document.getElementById('cart-count');
    const itemsContainer = document.getElementById('cartItems');
    if (countNav) countNav.innerText = cart.reduce((t, i) => t + i.quantity, 0);
    if (itemsContainer) {
        if (cart.length === 0) {
            itemsContainer.innerHTML = '<p style="text-align:center; padding:20px;">TRỐNG</p>';
        } else {
            itemsContainer.innerHTML = cart.map((item, index) => `
                <div style="display:flex; gap:10px; padding:10px; border-bottom:1px solid #eee;">
                    <img src="${item.image}" width="50">
                    <div style="flex:1">
                        <p style="margin:0; font-size:12px; font-weight:bold;">${item.name}</p>
                        <p style="margin:0; color:red; font-size:12px;">${item.price.toLocaleString()}₫</p>
                        <div style="display:flex; align-items:center; gap:5px;">
                            <button onclick="changeQty(${index}, -1)">-</button>
                            <span>${item.quantity}</span>
                            <button onclick="changeQty(${index}, 1)">+</button>
                        </div>
                    </div>
                    <button onclick="removeFromCart(${index})" style="background:none; border:none; color:red; cursor:pointer;">&times;</button>
                </div>`).join('');
        }
    }
    const totalP = document.getElementById('totalPrice');
    if (totalP) totalP.innerText = cart.reduce((s, i) => s + (i.price * i.quantity), 0).toLocaleString() + '₫';
}
function changeQty(index, delta) {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) cart.splice(index, 1);
    saveCart(); updateCartUI();
}
function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart(); updateCartUI();
}
function openCart() { 
    document.getElementById('cart-sidebar').classList.add('active'); 
    document.getElementById('overlay').classList.add('active'); 
}
function closeAllModals() {
    ['cart-sidebar', 'checkoutModal', 'historyModal', 'invoiceModal', 'overlay'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('active');
    });
}
    // THANH TOÁN & LƯU DOANH THU THEO CA
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const now = new Date();
            const h = now.getHours();
            let ca = (h >= 6 && h < 12) ? "SÁNG" : (h >= 12 && h < 18) ? "CHIỀU" : "TỐI";

            const newOrder = {
                id: Math.floor(100000 + Math.random() * 900000),
                customer: document.getElementById('cusName').value || "KHÁCH LẺ",
                phone: document.getElementById('cusPhone').value || "N/A",
                items: [...cart],
                totalAmount: document.getElementById('checkoutTotal').innerText,
                date: now.toLocaleDateString('vi-VN'),
                time: now.toLocaleTimeString('vi-VN'),
                shift: ca 
            };
            
            let orderHistory = JSON.parse(localStorage.getItem('orderHistory')) || [];
            orderHistory.push(newOrder);
            localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
            
            showHuyStoreInvoice(newOrder); 
            cart = [];
            saveCart();
            updateCartUI(); 
            checkoutForm.reset();
        });
    }

    if (typeof products !== 'undefined') displayProducts(products);
    updateCartUI();
;

// --- QUẢN LÝ GIỎ HÀNG ---
function saveCart() { 
    localStorage.setItem('cart', JSON.stringify(cart)); 
}

function openCart() {
    closeAllModals();
    const cartSidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('overla');
    if (cartSidebar && overlay) {
        cartSidebar.classList.add('active');
        overlay.classList.add('active');
        updateCartUI();
    }
}

function addToCart(id) {
    const product = products.find(p => p.id === id);
    if (product) {
        const itemInCart = cart.find(item => item.id === id);
        itemInCart ? itemInCart.quantity++ : cart.push({ ...product, quantity: 1 });
        saveCart();
        updateCartUI();
        openCart();
    }
}

function changeQty(index, delta) {
    if (cart[index]) {
        cart[index].quantity += delta;
        if (cart[index].quantity <= 0) cart.splice(index, 1);
        saveCart();
        updateCartUI();
    }
}

function removeFromCart(index) {
    if (confirm("Xóa sản phẩm này khỏi giỏ?")) {
        cart.splice(index, 1);
        saveCart();
        updateCartUI();
    }
}

function updateCartUI() {
    const itemsContainer = document.getElementById('cartItems');
    const countNav = document.getElementById('cart-count'); 
    const totalPriceElement = document.getElementById('totalPrice');
    
    if (countNav) countNav.innerText = cart.reduce((total, item) => total + item.quantity, 0);
    if (!itemsContainer) return;

    if (cart.length === 0) {
        itemsContainer.innerHTML = '<p style="text-align:center; padding:20px; color:#888;">TRỐNG</p>';
        if(totalPriceElement) totalPriceElement.innerText = '0₫';
        return;
    }

    let total = 0;
    itemsContainer.innerHTML = cart.map((item, index) => {
        total += (item.price * item.quantity);
        return `
            <div class="cart-item" style="display: flex; align-items: center; padding: 10px; border-bottom: 1px solid #eee; gap: 10px;">
                <img src="${item.image}" style="width: 50px; height: 50px; object-fit: cover; border-radius:4px;">
                <div style="flex: 1;">
                    <h4 style="margin: 0; font-size: 13px;">${item.name}</h4>
                    <p style="margin: 3px 0; color: #e44d26; font-size:12px;">${item.price.toLocaleString('vi-VN')}₫</p>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <button onclick="changeQty(${index}, -1)" style="width:25px; height:25px; cursor:pointer;">-</button>
                        <span style="font-weight:bold;">${item.quantity}</span>
                        <button onclick="changeQty(${index}, 1)" style="width:25px; height:25px; cursor:pointer;">+</button>
                    </div>
                </div>
                <button onclick="removeFromCart(${index})" style="border:none; background:none; color:red; cursor:pointer; font-size:20px;">&times;</button>
            </div>`;
    }).join('');
    if(totalPriceElement) totalPriceElement.innerText = total.toLocaleString('vi-VN') + '₫';
}

// --- QUẢN LÝ DOANH THU (BẢN POS QUẦY THANH TOÁN) ---
function displayOrderHistory() {
    const historyList = document.getElementById('historyList');
    const orders = JSON.parse(localStorage.getItem('orderHistory')) || [];
    if (!historyList) return;

    if (orders.length === 0) {
        historyList.innerHTML = '<div style="text-align:center; padding:50px; color:#999;"><h3>CHƯA CÓ ĐƠN HÀNG NÀO</h3><p>Hãy thực hiện thanh toán để xem dữ liệu.</p></div>';
        return;
    }

    // Tính tổng tất cả doanh thu
    let grandTotal = orders.reduce((sum, o) => sum + parseInt(o.totalAmount.replace(/[.\₫]/g, '')), 0);

    const groups = orders.reduce((groups, order) => {
        const date = order.date;
        if (!groups[date]) groups[date] = [];
        groups[date].push(order);
        return groups;
    }, {});

    const sortedDates = Object.keys(groups).sort((a, b) => new Date(b.split('/').reverse().join('-')) - new Date(a.split('/').reverse().join('-')));

    // HEADER TỔNG DOANH THU NHƯ MÁY TÍNH TIỀN
    let fullHTML = `
        <div style="background: #1a1a1a; color: #fff; padding: 20px; border-radius: 10px; margin-bottom: 20px; text-align: center; border-bottom: 5px solid #ffeb3b;">
            <p style="margin:0; font-size:12px; letter-spacing: 2px;">TỔNG DOANH THU HỆ THỐNG</p>
            <h2 style="margin:10px 0; color:#ffeb3b; font-size:32px;">${grandTotal.toLocaleString()}₫</h2>
            <button onclick="clearAllOrders()" style="background: red; color: white; border: none; padding: 5px 15px; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 11px;">XÓA TẤT CẢ DỮ LIỆU</button>
        </div>
    `;

    sortedDates.forEach(date => {
        const dayOrders = groups[date];
        let dayTotal = 0;
        let dayStats = { SÁNG: 0, CHIỀU: 0, TỐI: 0 };

        const dayHTML = dayOrders.slice().reverse().map(order => {
            let priceNum = parseInt(order.totalAmount.replace(/[.\₫]/g, ''));
            dayTotal += priceNum;
            if(order.shift) dayStats[order.shift] += priceNum;

            return `
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 10px; font-size:12px;">${order.time}</td>
                    <td style="padding: 10px;">
                        <div style="font-weight:bold; font-size:13px;">${order.customer.toUpperCase()}</div>
                        <small style="color:#888;">#${order.id}</small>
                    </td>
                    <td style="padding: 10px; color:red; font-weight:bold; text-align:right;">${order.totalAmount}</td>
                    <td style="padding: 10px; text-align:right;">
                        <button onclick="deleteSingleOrder(${order.id})" style="background:none; border:none; color:#ccc; cursor:pointer; font-size:18px;">&times;</button>
                    </td>
                </tr>`;
        }).join('');

        fullHTML += `
            <div style="background: #fff; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 25px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <div style="background: #f8f9fa; padding: 12px; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #333;">
                    <span style="font-weight: bold; color: #333;">📅 ${date}</span>
                    <span style="color: #27ae60; font-weight: bold; font-size: 16px;">${dayTotal.toLocaleString()}₫</span>
                </div>
                <div style="padding: 0;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead style="background:#f0f0f0; font-size:11px; color:#666;">
                            <tr>
                                <th style="padding:8px; text-align:left;">GIỜ</th>
                                <th style="padding:8px; text-align:left;">KHÁCH</th>
                                <th style="padding:8px; text-align:right;">SỐ TIỀN</th>
                                <th style="padding:8px; text-align:right;">XÓA</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${dayHTML}
                        </tbody>
                    </table>
                    <div style="display: flex; justify-content: space-around; font-size: 10px; background: #fafafa; padding: 8px; border-top: 1px solid #eee;">
                        <span>SÁNG: ${dayStats.SÁNG.toLocaleString()}₫</span>
                        <span>CHIỀU: ${dayStats.CHIỀU.toLocaleString()}₫</span>
                        <span>TỐI: ${dayStats.TỐI.toLocaleString()}₫</span>
                    </div>
                </div>
            </div>`;
    });
    historyList.innerHTML = fullHTML;
}

// --- HÀM XÓA CỦA HUY ---
function deleteSingleOrder(id) {
    if (confirm("Xóa đơn hàng này khỏi lịch sử?")) {
        let orders = JSON.parse(localStorage.getItem('orderHistory')) || [];
        orders = orders.filter(o => o.id !== id);
        localStorage.setItem('orderHistory', JSON.stringify(orders));
        displayOrderHistory();
    }
}

function clearAllOrders() {
    if (confirm("CẢNH BÁO: Huy có chắc muốn xóa SẠCH TOÀN BỘ doanh thu không?")) {
        localStorage.removeItem('orderHistory');
        displayOrderHistory();
    }
}

function getShiftColor(shift) {
    if (shift === "SÁNG") return "#ffa000";
    if (shift === "CHIỀU") return "#1976d2";
    return "#4527a0";
}

// --- ĐÓNG MỞ MODAL ---
function toggleHistory() {
    closeAllModals();
    document.getElementById('historyModal').classList.add('active');
    document.getElementById('overlay').classList.add('active');
    displayOrderHistory();
}

function toggleCheckout() {
    if (cart.length === 0) return alert("Giỏ hàng trống!");
    closeAllModals();
    document.getElementById('checkoutModal').classList.add('active');
    document.getElementById('overlay').classList.add('active');
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('checkoutTotal').innerText = total.toLocaleString('vi-VN') + '₫';
}

function closeAllModals() {
    ['cart-sidebar', 'checkoutModal', 'historyModal', 'invoiceModal', 'overlay'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('active');
    });
}

window.onclick = (e) => {
    if (e.target.id === 'overlay') closeAllModals();
}

function showHuyStoreInvoice(order) {
    const details = document.getElementById('invoiceDetails');
    if (details) {
        details.innerHTML = `
            <div style="background: #fff; padding: 20px; border: 2px dashed #000; font-family: monospace;">
                <h2 style="text-align: center; margin: 0;">HUY STORE</h2>
                <p style="text-align: center; font-size: 12px;">HÓA ĐƠN THANH TOÁN</p>
                <hr>
                <p><strong>Khách:</strong> ${order.customer.toUpperCase()}</p>
                <p><strong>Ngày:</strong> ${order.date} | ${order.time} (${order.shift})</p>
                <hr>
                ${order.items.map(i => `<div style="display:flex; justify-content:space-between; font-size:12px;"><span>${i.name} x${i.quantity}</span><span>${(i.price * i.quantity).toLocaleString()}₫</span></div>`).join('')}
                <hr>
                <h3 style="text-align: right; color: #e44d26; margin: 10px 0 0 0;">TỔNG: ${order.totalAmount}</h3>
            </div>`;
        closeAllModals();
        document.getElementById('invoiceModal').classList.add('active');
        document.getElementById('overlay').classList.add('active');
    }
}
// Tìm đoạn cuối cùng trong file main.js của bạn và thay thế bằng đoạn này:

document.addEventListener('DOMContentLoaded', () => {
    // ... các code khác giữ nguyên ...

    // Kiểm tra tên file đang mở để tự chạy sản phẩm tương ứng
    const currentPage = window.location.pathname.split("/").pop();

    if (currentPage === "adidas.html") {
        displayProducts("adidas"); // Chỉ hiện adidas
    } else if (currentPage === "nike.html") {
        displayProducts("nike");   // Chỉ hiện nike
    } else if (currentPage === "phukien.html") {
        displayProducts("phukien"); // Chỉ hiện phụ kiện
    } else {
        displayProducts("all");     // Trang chủ hiện hết
    }
    
    updateCartUI();
});