// Menangkap elemen header
const header = document.querySelector('.header');

// Mendengarkan event scroll pada window
window.addEventListener('scroll', () => {
    // Jika halaman di-scroll lebih dari 50px ke bawah
    if (window.scrollY > 50) {
        header.classList.add('scrolled'); // Tambahkan background putih & shadow
    } else {
        header.classList.remove('scrolled'); // Kembalikan ke transparan
    }
});

// =========================================
// 2. LOGIKA MOBILE MENU (HAMBURGER)
// =========================================

// Menangkap elemen yang dibutuhkan
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const navItems = document.querySelectorAll('.nav-links li a');

// PENGAMAN: Pastikan elemen menuToggle ada di halaman sebelum menambahkan event
if (menuToggle && navLinks) {
    // Event listener untuk membuka/menutup menu saat hamburger diklik
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // Event listener loop untuk setiap link di dalam menu
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });
}

// =========================================
// 3. VALIDASI FORM CONTACT & HANDLE SUBMIT
// =========================================

// Menangkap elemen form yang baru
const formContact = document.getElementById('formContact');

if (formContact) {
    formContact.addEventListener('submit', function(e) {
        e.preventDefault();

        // Mengambil nilai dari input yang baru
        const nama = document.getElementById('nama').value.trim();
        const email = document.getElementById('email').value.trim();
        const whatsapp = document.getElementById('whatsapp').value.trim();
        const pesan = document.getElementById('pesan').value.trim();
        const btnSubmit = formContact.querySelector('button[type="submit"]');

        // UX Enhancement: Ubah state tombol
        const originalText = btnSubmit.innerText;
        btnSubmit.innerText = 'Mengirim...';
        btnSubmit.disabled = true;

        // Siapkan payload data JSON untuk n8n / Supabase
        const payload = {
            nama: nama,
            email: email,
            whatsapp: whatsapp,
            pesan: pesan,
            source: 'Landing Page Contact Form'
        };

        const webhookUrl = 'URL_WEBHOOK_N8N_ANDA_DISINI'; 

        // Kirim request (Fetch API)
        fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(response => {
            if (response.ok) {
                alert('Pesan berhasil terkirim! Tim kami akan segera menghubungi Anda.');
                formContact.reset();
            } else {
                alert('Terjadi kesalahan pada server. Mohon coba beberapa saat lagi.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            // Fallback jika n8n sedang down: Arahkan ke WA manual
            alert('Gagal mengirim pesan otomatis. Anda akan dialihkan ke WhatsApp kami.');
            const waNumber = '6281234567890'; // Nomor WA Anda
            const waText = `Halo, nama saya ${nama}.%0A${pesan}`;
            window.open(`https://wa.me/${waNumber}?text=${waText}`, '_blank');
        })
        .finally(() => {
            btnSubmit.innerText = originalText;
            btnSubmit.disabled = false;
        });
    });
}

// =========================================
// 4. ANIMASI TOOLTIP MEDSOS (INTERSECTION OBSERVER)
// =========================================

const medsosSection = document.querySelector('.store-medsos');
const socialBtns = document.querySelectorAll('.social-btn');

if (medsosSection && socialBtns.length > 0) {
    // Membuat observer untuk memantau scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // Jika section sudah terlihat minimal 50% di layar
            if (entry.isIntersecting) {
                
                // Berikan jeda beruntun (stagger) agar tooltip muncul bergantian 
                socialBtns.forEach((btn, index) => {
                    setTimeout(() => {
                        btn.classList.add('show-hint');
                    }, index * 300); // Jeda 300ms antar icon
                });

                // Hentikan pantauan agar animasi ini hanya terjadi 1 kali saja 
                // saat pertama kali dilihat, agar tidak mengganggu jika di-scroll naik-turun
                observer.unobserve(entry.target);
            }
        });
    }, { 
        threshold: 0.5 // Memicu saat 50% elemen terlihat di layar
    });

    // Mulai pantau section store-medsos
    observer.observe(medsosSection);
}



// =========================================
// 5. LOGIKA HALAMAN STORE (store.html)
// =========================================

// Pastikan skrip ini hanya berjalan jika elemen store ada di halaman
const storeHero = document.querySelector('.store-hero');

if (storeHero) {
    /* --- A. Galeri Produk Interaktif --- */
    const mainImage = document.getElementById('mainImage');
    const thumbnails = document.querySelectorAll('.thumb');

    if (mainImage && thumbnails.length > 0) {
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', function() {
                thumbnails.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                mainImage.style.opacity = 0;
                setTimeout(() => {
                    mainImage.src = this.src;
                    mainImage.style.opacity = 1;
                }, 150);
            });
        });
    }

    /* --- B. Kalkulator Harga & Pemilihan Varian --- */
    const variantRadios = document.querySelectorAll('input[name="ukuran"]');
    const displayPrice = document.getElementById('displayPrice');
    const stickyPrice = document.getElementById('stickyPrice');
    const qtyInput = document.getElementById('qty');
    const btnMinus = document.querySelector('.qty-btn.minus');
    const btnPlus = document.querySelector('.qty-btn.plus');
    
    let currentBasePrice = 15000; 

    function formatRupiah(number) {
        return new Intl.NumberFormat('id-ID', { 
            style: 'currency', currency: 'IDR', minimumFractionDigits: 0 
        }).format(number);
    }

    function updateTotalPrice() {
        if (!qtyInput) return; // Pengaman jika elemen tidak ditemukan
        let qty = parseInt(qtyInput.value) || 1;
        let total = currentBasePrice * qty;
        let formattedTotal = formatRupiah(total);
        
        if (displayPrice) displayPrice.textContent = formattedTotal;
        if (stickyPrice) stickyPrice.textContent = formattedTotal;
    }

    variantRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            currentBasePrice = parseInt(this.getAttribute('data-price'));
            updateTotalPrice();
        });
    });

    /* --- C. Tombol Plus & Minus (Quantity) --- */
    if (btnMinus && btnPlus && qtyInput) {
        btnMinus.addEventListener('click', () => {
            let qty = parseInt(qtyInput.value) || 1;
            if (qty > 1) {
                qtyInput.value = qty - 1;
                updateTotalPrice();
            }
        });

        btnPlus.addEventListener('click', () => {
            let qty = parseInt(qtyInput.value) || 1;
            qtyInput.value = qty + 1;
            updateTotalPrice();
        });

        qtyInput.addEventListener('input', () => {
            if (qtyInput.value < 1 || isNaN(qtyInput.value)) {
                qtyInput.value = 1;
            }
            updateTotalPrice();
        });
    }

    /* --- D. Fungsi Tambah ke Keranjang (LocalStorage) --- */
    const btnOrderDesk = document.querySelector('.add-to-cart-btn');


    function addToCart() {
        const checkedVariant = document.querySelector('input[name="ukuran"]:checked');
        
        // Pengaman jika belum ada varian yang dipilih
        if (!checkedVariant) {
            alert("Silakan pilih ukuran kemasan terlebih dahulu.");
            return;
        }

        const selectedVariant = checkedVariant.value;
        const qty = parseInt(qtyInput.value) || 1;
        const price = currentBasePrice;
        const total = price * qty;

        const cartItem = {
            id: 'krupuk-mie-' + selectedVariant,
            name: 'Krupuk Mie Mentah Premium',
            variant: selectedVariant,
            price: price,
            qty: qty,
            total: total
        };

        // Ambil data dari LocalStorage, jika kosong buat array baru []
        let cart = JSON.parse(localStorage.getItem('krupukCart')) || [];
        const existingItemIndex = cart.findIndex(item => item.id === cartItem.id);
        
        if (existingItemIndex > -1) {
            cart[existingItemIndex].qty += qty;
            cart[existingItemIndex].total = cart[existingItemIndex].qty * price;
        } else {
            cart.push(cartItem);
        }

        localStorage.setItem('krupukCart', JSON.stringify(cart));
        updateCartBadge(); // Panggil fungsi update angka keranjang
        renderMiniCart(); // <--- Tambahkan baris ini
        alert(`Berhasil! ${qty} bungkus (ukuran ${selectedVariant}) ditambahkan ke keranjang.`);
    }

    if (btnOrderDesk) btnOrderDesk.addEventListener('click', addToCart);

    /* --- E. LOGIKA BOTTOM SHEET MINI CART (MOBILE) --- */
    const bottomSheet = document.getElementById('bottomSheetCart');
    const cartOverlay = document.getElementById('cartOverlay');
    const sheetFooterToggle = document.getElementById('sheetFooterToggle');
    const closeSheetBtn = document.getElementById('closeSheetBtn');
    const miniCartItems = document.getElementById('miniCartItems');
    const miniCartTotal = document.getElementById('miniCartTotal');
    const btnCheckoutNav = document.querySelector('.btn-checkout-nav');

    // Mencegah tombol Checkout memicu tutup/buka panel
    if(btnCheckoutNav) {
        btnCheckoutNav.addEventListener('click', (e) => e.stopPropagation()); 
    }

    // Fungsi spesifik BUKA
    function openSheet() {
        bottomSheet.classList.add('expanded');
        cartOverlay.classList.add('active');
    }

    // Fungsi spesifik TUTUP
    function closeSheet(e) {
        if(e) e.stopPropagation();
        bottomSheet.classList.remove('expanded');
        cartOverlay.classList.remove('active');
    }

    // Pasang Event Listener yang benar
    if (sheetFooterToggle && closeSheetBtn && cartOverlay) {
        // Klik area total harga (Toggle)
        sheetFooterToggle.addEventListener('click', () => {
            if (bottomSheet.classList.contains('expanded')) {
                closeSheet();
            } else {
                openSheet();
            }
        });
        
        // Klik tombol X atau Background Gelap untuk Menutup
        closeSheetBtn.addEventListener('click', closeSheet);
        cartOverlay.addEventListener('click', closeSheet);
    }

    // Fungsi Render Keranjang Mini
    function renderMiniCart() {
        if (!bottomSheet) return;
        
        let cart = JSON.parse(localStorage.getItem('krupukCart')) || [];
        
        if (cart.length === 0) {
            // Sembunyikan bottom sheet sepenuhnya jika keranjang kosong
            bottomSheet.classList.remove('peek');
            bottomSheet.classList.remove('expanded');
            cartOverlay.classList.remove('active');
            return;
        }

        // Tampilkan sheet dalam mode mengintip (peek)
        bottomSheet.classList.add('peek');

        let subtotal = 0;
        let cartHtml = '';

        cart.forEach(item => {
            subtotal += item.total;
            cartHtml += `
                <div class="cart-item-row" data-id="${item.id}" style="border-bottom: 1px solid #F3F4F6; padding-bottom: 10px;">
                    <div class="cart-item-info">
                        <span class="cart-item-title" style="font-size: 0.9rem;">${item.name}</span>
                        <div class="cart-item-actions" style="margin-top: 5px;">
                            <span class="cart-item-variant" style="font-size: 0.8rem;">${item.variant}</span>
                            <span style="color: #E5E7EB; margin: 0 5px;">|</span>
                            
                            <button class="qty-btn-small btn-decrease"><i class="fas fa-minus" style="pointer-events: none;"></i></button>
                            <span class="item-qty-text">${item.qty}</span>
                            <button class="qty-btn-small btn-increase"><i class="fas fa-plus" style="pointer-events: none;"></i></button>
                            
                            <button class="btn-remove-item"><i class="fas fa-trash" style="pointer-events: none;"></i></button>
                        </div>
                    </div>
                    <span class="cart-item-price" style="font-size: 0.9rem;">${formatRupiah(item.total)}</span>
                </div>
            `;
        });

        miniCartItems.innerHTML = cartHtml;
        miniCartTotal.textContent = formatRupiah(subtotal);
    }

    // Delegasi Event untuk Edit Keranjang di Mini Cart
    if (miniCartItems) {
        miniCartItems.addEventListener('click', function(e) {
            const row = e.target.closest('.cart-item-row');
            if (!row) return;

            const itemId = row.getAttribute('data-id');
            let cart = JSON.parse(localStorage.getItem('krupukCart')) || [];
            const itemIndex = cart.findIndex(item => item.id === itemId);
            
            if (itemIndex === -1) return;

            if (e.target.classList.contains('btn-increase')) {
                cart[itemIndex].qty += 1;
                cart[itemIndex].total = cart[itemIndex].qty * cart[itemIndex].price;
            } else if (e.target.classList.contains('btn-decrease')) {
                if (cart[itemIndex].qty > 1) {
                    cart[itemIndex].qty -= 1;
                    cart[itemIndex].total = cart[itemIndex].qty * cart[itemIndex].price;
                } else {
                    if (confirm('Hapus produk ini dari keranjang?')) {
                        cart.splice(itemIndex, 1);
                    }
                }
            } else if (e.target.classList.contains('btn-remove-item')) {
                if (confirm('Hapus produk ini dari keranjang?')) {
                    cart.splice(itemIndex, 1);
                }
            } else {
                return;
            }

            localStorage.setItem('krupukCart', JSON.stringify(cart));
            renderMiniCart(); // Update UI Mini Cart
            updateCartBadge(); // Update badge merah di Navbar
        });
    }

    // Jalankan renderMiniCart saat halaman dimuat
    renderMiniCart();
 }

// =========================================
// 6. FUNGSI GLOBAL (Berjalan di Semua Halaman)
// =========================================
function updateCartBadge() {
    const cartBadges = document.querySelectorAll('.cart-badge');
    let cart = JSON.parse(localStorage.getItem('krupukCart')) || [];
    
    let totalItems = 0;
    cart.forEach(item => {
        totalItems += item.qty;
    });

    cartBadges.forEach(badge => {
        if (totalItems > 0) {
            badge.textContent = totalItems;
            badge.classList.add('show');
        } else {
            badge.classList.remove('show');
        }
    });
}

// Jalankan saat HTML selesai dimuat
document.addEventListener('DOMContentLoaded', updateCartBadge);

// =========================================
// 7. LOGIKA HALAMAN CHECKOUT ALA TIKTOK/SHOPEE
// =========================================

const checkoutPage = document.querySelector('.mobile-checkout-page');

if (checkoutPage) {
    // Variabel Kalkulasi Global
    let subtotalAmount = 0;
    let ongkirAmount = 0;
    let adminFee = 2500; // Biaya layanan statis

    // Format Rupiah
    function formatRupiahCheckout(number) {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    }

    // --- A. RENDER KERANJANG & FITUR EDIT ITEM ---
    function renderCheckoutItems() {
        const cartContainer = document.getElementById('checkoutCartItems');
        const subtotalEl = document.getElementById('checkoutSubtotal');
        let cart = JSON.parse(localStorage.getItem('krupukCart')) || [];

        if (cart.length === 0) {
            alert('Keranjang kosong! Mengarahkan kembali ke toko.');
            window.location.href = 'store.html';
            return;
        }

        let cartHtml = '';
        subtotalAmount = 0;

        cart.forEach((item, index) => {
            subtotalAmount += item.total;
            cartHtml += `
                <div class="checkout-item-card" data-index="${index}">
                    <div class="item-info-area">
                        <span class="item-title">${item.name}</span>
                        <span class="item-variant">Varian: ${item.variant}</span>
                        <span class="item-price-checkout">${formatRupiahCheckout(item.total)}</span>
                    </div>
                    
                    <div class="item-action-area">
                        <div class="qty-control">
                            <button class="qty-btn-small btn-decrease-checkout"><i class="fas fa-minus" style="pointer-events: none;"></i></button>
                            <span class="qty-text">${item.qty}</span>
                            <button class="qty-btn-small btn-increase-checkout"><i class="fas fa-plus" style="pointer-events: none;"></i></button>
                        </div>
                        <button class="btn-remove-checkout"><i class="fas fa-trash" style="pointer-events: none;"></i></button>
                    </div>
                </div>
            `;
        });

        cartContainer.innerHTML = cartHtml;
        subtotalEl.textContent = formatRupiahCheckout(subtotalAmount);
        updateGrandTotal(); // Memperbarui total harga di bawah
    }

    // ========================================================
    // Delegasi Event untuk Tombol Edit di Checkout
    // ========================================================
    const checkoutCartContainer = document.getElementById('checkoutCartItems');
    
    if (checkoutCartContainer) {
        checkoutCartContainer.addEventListener('click', function(e) {
            // PERBAIKAN 1: Cari elemen berdasarkan class CSS yang baru (.checkout-item-card)
            const card = e.target.closest('.checkout-item-card');
            if (!card) return; // Jika klik di luar area produk, abaikan

            const itemIndex = card.getAttribute('data-index');
            let cart = JSON.parse(localStorage.getItem('krupukCart')) || [];
            
            if (!cart[itemIndex]) return; // Pengaman data

            // PERBAIKAN 2: Gunakan closest() agar jika ikon yang terklik, tetap dihitung sebagai tombol
            if (e.target.closest('.btn-increase-checkout')) {
                cart[itemIndex].qty += 1;
                cart[itemIndex].total = cart[itemIndex].qty * cart[itemIndex].price;
                
            } else if (e.target.closest('.btn-decrease-checkout')) {
                if (cart[itemIndex].qty > 1) {
                    cart[itemIndex].qty -= 1;
                    cart[itemIndex].total = cart[itemIndex].qty * cart[itemIndex].price;
                } else {
                    if (confirm('Hapus produk ini dari pesanan?')) cart.splice(itemIndex, 1);
                }
                
            } else if (e.target.closest('.btn-remove-checkout')) {
                if (confirm('Hapus produk ini dari pesanan?')) cart.splice(itemIndex, 1);
                
            } else {
                return; // Abaikan jika klik di teks/area kosong
            }

            // Simpan data terbaru dan render ulang layarnya instan
            localStorage.setItem('krupukCart', JSON.stringify(cart));
            renderCheckoutItems(); 
        });
    }

    // --- B. MANAJEMEN MULTI-BOTTOM SHEET ---
    const overlay = document.getElementById('checkoutOverlay');
    
    function openSheet(sheetId) {
        document.getElementById(sheetId).classList.add('expanded');
        overlay.classList.add('active');
    }

    function closeAllSheets() {
        document.querySelectorAll('.bottom-sheet-container').forEach(sheet => {
            sheet.classList.remove('expanded');
        });
        overlay.classList.remove('active');
    }

    // Event Listener untuk Buka Sheet
    document.getElementById('btnOpenAddress').addEventListener('click', () => openSheet('sheetAddress'));
    document.getElementById('btnOpenShipping').addEventListener('click', () => openSheet('sheetShipping'));
    document.getElementById('btnOpenPayment').addEventListener('click', () => openSheet('sheetPayment'));

    // Event Listener untuk Tutup Sheet (Tombol X & Overlay)
    document.querySelectorAll('.close-sheet-btn').forEach(btn => {
        btn.addEventListener('click', closeAllSheets);
    });
    overlay.addEventListener('click', closeAllSheets);


    // --- C. LOGIKA BITESHIP AUTOCOMPLETE (DI DALAM SHEET ALAMAT) ---
    const areaSearch = document.getElementById('areaSearch');
    const areaList = document.getElementById('areaList');
    const biteshipAreaId = document.getElementById('biteshipAreaId');
    const kodeposInput = document.getElementById('kodepos');
    let debounceTimer;

    areaSearch.addEventListener('input', function() {
        const query = this.value.trim();
        clearTimeout(debounceTimer);

        if (query.length < 3) {
            areaList.classList.remove('active');
            biteshipAreaId.value = '';
            kodeposInput.value = '';
            return;
        }

        document.getElementById('searchLoading').style.display = 'block';

        debounceTimer = setTimeout(() => {
            // Simulasi API Biteship
            const mockData = [
                { id: 'ID123', name: `${query}`, detail: 'Kab. Tegal, Jawa Tengah', postal: '52194' },
                { id: 'ID124', name: `${query} Barat`, detail: 'Kab. Tegal, Jawa Tengah', postal: '52195' }
            ];
            
            areaList.innerHTML = '';
            mockData.forEach(area => {
                const li = document.createElement('li');
                li.className = 'autocomplete-item';
                li.innerHTML = `<span class="area-name">Kecamatan ${area.name}</span><span class="area-detail">${area.detail}, ${area.postal}</span>`;
                li.addEventListener('click', () => {
                    areaSearch.value = `Kecamatan ${area.name}, ${area.detail}`;
                    biteshipAreaId.value = area.id;
                    kodeposInput.value = area.postal;
                    areaList.classList.remove('active');
                });
                areaList.appendChild(li);
            });
            areaList.classList.add('active');
            document.getElementById('searchLoading').style.display = 'none';
        }, 800);
    });


    // --- D. LOGIKA SIMPAN ALAMAT & BUKA KUNCI KURIR ---
    document.getElementById('btnSaveAddress').addEventListener('click', function() {
        const fullname = document.getElementById('fullname').value;
        const phone = document.getElementById('phone').value;
        const areaId = biteshipAreaId.value;
        const alamatLengkap = document.getElementById('alamatLengkap').value;

        // Validasi Form Dasar
        if (!fullname || !phone || !areaId || !alamatLengkap) {
            alert('Mohon lengkapi semua data alamat dan pilih kecamatan dari saran yang muncul.');
            return;
        }

        // 1. Ubah Tampilan Kartu Alamat di Layar Utama
        document.getElementById('emptyAddressState').style.display = 'none';
        document.getElementById('filledAddressState').style.display = 'block';
        document.getElementById('displayCustName').textContent = `${fullname} | ${phone}`;
        document.getElementById('displayCustAddress').textContent = `${alamatLengkap}, ${areaSearch.value} (${kodeposInput.value})`;

        // 2. Buka Kunci Kartu Opsi Pengiriman!
        const btnShipping = document.getElementById('btnOpenShipping');
        btnShipping.style.opacity = '1';
        btnShipping.style.pointerEvents = 'auto';

        // 3. Tutup Sheet Alamat
        closeAllSheets();

        // 4. Otomatis Cari Ongkir berdasarkan Area ID baru
        fetchShippingRates(areaId);
    });


    // --- E. LOGIKA OPSI PENGIRIMAN & UPDATE TOTAL ---
    function fetchShippingRates(areaId) {
        const container = document.getElementById('shippingOptionsContainer');
        container.innerHTML = `<p style="text-align: center; padding: 2rem 0;"><i class="fas fa-spinner fa-spin"></i> Mencari kurir terbaik...</p>`;
        
        // Simulasi hitung ongkir
        setTimeout(() => {
            const mockRates = [
                { id: 'jne-reg', name: 'JNE Reguler', duration: '2-3 Hari', price: 15000 },
                { id: 'sicepat-halu', name: 'SiCepat Halu', duration: '2-4 Hari', price: 12500 }
            ];

            let html = '';
            mockRates.forEach((rate, index) => {
                html += `
                    <label class="shipping-card" style="display: block; margin-bottom: 10px; cursor: pointer;">
                        <input type="radio" name="kurirRadio" value="${rate.id}" data-name="${rate.name}" data-price="${rate.price}" style="display: none;">
                        <div class="shipping-content" style="padding: 1rem; border: 1px solid #E5E7EB; border-radius: 8px; display: flex; justify-content: space-between;">
                            <div><strong style="display: block;">${rate.name}</strong><span style="font-size: 0.8rem; color: #6B7280;">Estimasi ${rate.duration}</span></div>
                            <strong style="color: var(--primary-yellow);">${formatRupiahCheckout(rate.price)}</strong>
                        </div>
                    </label>
                `;
            });
            container.innerHTML = html;

            // Tambahkan event click pada setiap kurir di dalam sheet
            const kurirRadios = container.querySelectorAll('input[name="kurirRadio"]');
            kurirRadios.forEach(radio => {
                radio.addEventListener('change', function() {
                    // Update UI di layar utama
                    document.getElementById('displayShipping').textContent = this.getAttribute('data-name');
                    document.getElementById('displayShippingCost').textContent = formatRupiahCheckout(this.getAttribute('data-price'));
                    
                    // Update Kalkulasi
                    ongkirAmount = parseInt(this.getAttribute('data-price'));
                    updateGrandTotal();
                    
                    // Tutup sheet setelah memilih
                    setTimeout(closeAllSheets, 300);
                });
            });

        }, 1000);
    }


    // --- F. LOGIKA METODE PEMBAYARAN ---
    const paymentRadios = document.querySelectorAll('input[name="payment"]');
    paymentRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            // Ambil nama kurir dari span terdekat
            const paymentName = this.nextElementSibling.querySelector('.kurir-name').textContent;
            document.getElementById('displayPayment').textContent = paymentName;
            
            // Tutup sheet setelah memilih
            setTimeout(closeAllSheets, 300);
        });
    });


    // --- G. FUNGSI UPDATE GRAND TOTAL ---
    function updateGrandTotal() {
        const grandTotal = subtotalAmount + ongkirAmount + adminFee;
        
        // Update rincian di bawah
        document.getElementById('checkoutOngkir').textContent = formatRupiahCheckout(ongkirAmount);
        document.getElementById('checkoutAdmin').textContent = formatRupiahCheckout(adminFee);
        
        // Update Sticky Footer (Tombol Buat Pesanan)
        document.getElementById('checkoutGrandTotal').textContent = formatRupiahCheckout(grandTotal);
    }

    // Jalankan render awal
    renderCheckoutItems();
    
    // ========================================================
    // H. AKSI TOMBOL BUAT PESANAN (INTEGRASI N8N & MIDTRANS)
    // ========================================================
    const btnPlaceOrder = document.getElementById('btnPlaceOrder');

    btnPlaceOrder.addEventListener('click', async function() {
        if (ongkirAmount === 0) {
            alert('Mohon lengkapi Alamat dan pilih Opsi Pengiriman terlebih dahulu.');
            openSheet('sheetAddress'); 
            return;
        }

        const paymentSelected = document.querySelector('input[name="payment"]:checked');
        if (!paymentSelected) {
            alert('Mohon pilih metode pembayaran.');
            openSheet('sheetPayment');
            return;
        }

        let cart = JSON.parse(localStorage.getItem('krupukCart')) || [];
        const orderPayload = {
            customer: {
                name: document.getElementById('fullname').value,
                phone: document.getElementById('phone').value,
                email: 'customer@email.com',
                address: document.getElementById('alamatLengkap').value,
                area_id: document.getElementById('biteshipAreaId').value 
            },
            items: cart,
            shipping: {
                courier: document.querySelector('input[name="kurirRadio"]:checked').value,
                cost: ongkirAmount
            },
            payment_method: paymentSelected.value,
            summary: {
                subtotal: subtotalAmount,
                admin_fee: adminFee,
                grand_total: subtotalAmount + ongkirAmount + adminFee
            }
        };

        const originalBtnText = btnPlaceOrder.innerHTML;
        btnPlaceOrder.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
        btnPlaceOrder.disabled = true;

        try {
            // 1. Tembak ke Webhook n8n Anda
            const webhookUrl = 'https://earnestine-fruitful-arla.ngrok-free.dev/webhook-test/proses-checkout'; 
            
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderPayload)
            });
            
           // 2. Tangkap balasan dari n8n
           const data = await response.json(); 
            
           // PENGAMAN JITU: Cek apakah n8n membalas berupa Array [ {token:...} ] atau Object {token:...}
           const snapToken = Array.isArray(data) ? data[0].token : data.token;

           // Periksa apakah token benar-benar ada
           if (!snapToken) {
               console.error("Respons n8n:", data);
               throw new Error("Gagal mendapatkan Token dari server n8n.");
           }
               // ... (kode onSuccess dkk biarkan sama) ...
            // 3. Panggil Pop-up Midtrans (Dipastikan window.snap sudah ter-load)
            window.snap.pay(snapToken, {
                onSuccess: function(result){
                    alert("Pembayaran Berhasil! Pesanan sedang diproses.");
                    localStorage.removeItem('krupukCart'); 
                    window.location.reload(); 
                },
                onPending: function(result){
                    alert("Menunggu pembayaran Anda. Silakan cek detail di halaman selanjutnya.");
                    localStorage.removeItem('krupukCart');
                    window.location.reload(); 
                },
                onError: function(result){
                    alert("Pembayaran gagal! Silakan coba lagi.");
                },
                onClose: function(){
                    alert('Anda menutup layar pembayaran sebelum menyelesaikannya.');
                }
            });

        } catch (error) {
            console.error('Error Checkout:', error);
            alert('Terjadi kesalahan koneksi ke server. Pastikan Webhook n8n sedang aktif (Listen for Test Event).');
        } finally {
            // Apapun yang terjadi (berhasil/gagal), kembalikan wujud tombol seperti semula
            btnPlaceOrder.innerHTML = originalBtnText;
            btnPlaceOrder.disabled = false;
        }
    });
}