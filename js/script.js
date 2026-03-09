const products = [
    { id: 1, name: "Nike Air Max 270", price: 3500000, brand: "Nike", img: "1.png" },
    { id: 2, name: "Adidas Ultraboost", price: 4200000, brand: "Adidas", img: "https://assets.adidas.com/images/w_600,f_auto,q_auto/4e51536130554cf3a099ae1301046401_9366/Giay_Ultraboost_1.0_trang_HQ4202_01_standard.jpg" },
    { id: 3, name: "Nike Jordan 1 Low", price: 5000000, brand: "Nike", img: "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/4f37fca8-645b-457d-b098-3f71f7d5477b/air-jordan-1-low-shoes-699s9k.png" },
    { id: 4, name: "Adidas Forum Low", price: 2800000, brand: "Adidas", img: "https://assets.adidas.com/images/w_600,f_auto,q_auto/63c77c04dc6448218d32ae8e00b20439_9366/Giay_Forum_Low_trang_FY7756_01_standard.jpg"}
];

let cart = JSON.parse(localStorage.getItem('cart')) || [];

// 1. Hiển thị sản phẩm ra Grid
function displayProducts(items) {
    const grid = document.getElementById('productGrid');
    if (items.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; padding: 50px;">Không tìm thấy sản phẩm nào.</p>`;
        return;
    }
    grid.innerHTML = items.map(p => `
        <div class="product-card">
            <img src="${p.img}" alt="${p.name}">
            <div class="product-info">
                <h3>${p.name}</h3>
                <p class="price">${p.price.toLocaleString()}đ</p>
                <button class="add-btn" onclick="addToCart(${p.id})">
                    <i class='bx bx-cart-add'></i> Thêm vào giỏ
                </button>
            </div>
        </div>
    `).join('');
}

// 2. Thêm vào giỏ hàng (Chống trùng lặp hoặc tăng số lượng nếu cần, ở đây làm đơn giản là thêm mới)
function addToCart(id) {
    const product = products.find(p => p.id === id);
    cart.push({ ...product, cartId: Date.now() });
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
    
    // Gọi hàm hiển thị thông báo
    showToast(`Đã thêm <strong>${product.name}</strong> vào giỏ hàng!`);
}

// Hàm bổ trợ hiển thị thông báo (Toast)
function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    
    // Thêm icon và nội dung
    toast.innerHTML = `
        <i class='bx bx-check-circle' style="font-size: 1.2rem;"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);

    // Tự động xóa thông báo sau 3 giây
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// 3. Cập nhật giao diện giỏ hàng (Sidebar)
function updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    const cartCountInner = document.getElementById('cart-count-inner');
    const cartItems = document.getElementById('cartItems');
    const totalPrice = document.getElementById('totalPrice');

    cartCount.innerText = cart.length;
    cartCountInner.innerText = cart.length;

    const total = cart.reduce((sum, item) => sum + item.price, 0);
    
    cartItems.innerHTML = cart.map((item, index) => `
        <div class="cart-item" style="display:flex; align-items:center; gap:15px; margin-bottom:20px; border-bottom:1px solid #eee; padding-bottom:10px;">
            <img src="${item.img}" style="width:60px; height:60px; object-fit:cover; border-radius:8px;">
            <div style="flex:1">
                <h4 style="font-size:0.9rem; margin:0">${item.name}</h4>
                <p style="color:var(--accent); font-weight:bold; margin:5px 0">${item.price.toLocaleString()}đ</p>
            </div>
            <i class='bx bx-trash' onclick="removeItem(${index})" style="cursor:pointer; color:#ff4d4d; font-size:1.2rem;"></i>
        </div>
    `).join('');

    totalPrice.innerText = total.toLocaleString() + "đ";
}

// 4. Tìm kiếm sản phẩm
function searchProduct() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filtered = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm) || 
        p.brand.toLowerCase().includes(searchTerm)
    );
    displayProducts(filtered);
}

// 5. Lọc theo hãng (Nike/Adidas)
function filterProducts(brand) {
    // Cập nhật trạng thái active cho menu
    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
    event.target.classList.add('active');

    if(brand === 'all') displayProducts(products);
    else displayProducts(products.filter(p => p.brand === brand));
}

// 6. Xóa item khỏi giỏ
function removeItem(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
}

// 7. Đóng/Mở Giỏ hàng (Sửa lỗi CSS Class)
function toggleCart() {
    const sidebar = document.getElementById('cartModal');
    const overlay = document.getElementById('overlay');
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

document.addEventListener("DOMContentLoaded", function() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productGrid = document.getElementById('productGrid');

    function filterProducts(category) {
        // Lấy tất cả các thẻ sản phẩm đang có trong Grid
        const products = document.querySelectorAll('.product-card');
        
        products.forEach(product => {
            const productCat = product.getAttribute('data-category');
            if (category === 'all' || productCat === category) {
                product.style.display = 'block';
            } else {
                product.style.display = 'none';
            }
        });
    }

    filterButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();

            // 1. Xử lý gạch chân cho Menu (chỉ áp dụng cho thẻ <a> trong .nav-links)
            if (this.tagName === 'A') {
                document.querySelectorAll('.nav-links .filter-btn').forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
            }

            // 2. Lấy category và lọc
            const category = this.getAttribute('data-category');
            filterProducts(category);

            // 3. Nếu click ở phần Categories giữa trang, tự động cuộn xuống xem sản phẩm
            if (this.classList.contains('cat-item')) {
                productGrid.scrollIntoView({ behavior: 'smooth' });
                
                // Đồng bộ gạch chân lên menu tương ứng
                document.querySelectorAll('.nav-links .filter-btn').forEach(btn => {
                    btn.classList.remove('active');
                    if(btn.getAttribute('data-category') === category) btn.classList.add('active');
                });
            }
        });
    });
});