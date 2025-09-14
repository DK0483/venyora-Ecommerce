document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem('venyora-token');
    const authLinksContainer = document.getElementById('user-auth-links');
    if (token && authLinksContainer) {
        try {
            const response = await fetch('https://venyora-api.onrender.com/api/auth/user', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const user = await response.json();
                const navLinks = document.getElementById("nav-links");
                authLinksContainer.remove();

                const welcomeLi = document.createElement('li');
                welcomeLi.innerHTML = `<a>Welcome, ${user.name}</a>`;
                navLinks.appendChild(welcomeLi);

                const logoutLi = document.createElement('li');
                logoutLi.innerHTML = `<a href="#" id="logout-link" class="btn" style="cursor:pointer; background-color: #f44336;">Logout</a>`;
                navLinks.appendChild(logoutLi);

                document.getElementById('logout-link').addEventListener('click', (e) => {
                    e.preventDefault();
                    localStorage.removeItem('venyora-token');
                    alert('You have been logged out.');
                    window.location.reload();
                });
            } else {
                localStorage.removeItem('venyora-token');
            }
        } catch (error) {
            console.error('Error verifying user:', error);
        }
    }
    const menuBtn = document.getElementById("menu-btn");
    const navLinks = document.getElementById("nav-links");

    if (menuBtn && navLinks) {
        const menuBtnIcon = menuBtn.querySelector("i");
        menuBtn.addEventListener("click", () => {
            navLinks.classList.toggle("open");
            const isOpen = navLinks.classList.contains("open");
            menuBtnIcon.setAttribute("class", isOpen ? "ri-close-line" : "ri-menu-line");
        });
        navLinks.addEventListener("click", (e) => {
            if (!e.target.matches('#logout-link')) {
                navLinks.classList.remove("open");
                menuBtnIcon.setAttribute("class", "ri-menu-line");
            }
        });
    }
    const productCatalogueContainer = document.getElementById('product-catalogue');

    if (productCatalogueContainer) {
        const fetchProducts = async () => {
            try {
                const response = await fetch('https://venyora-api.onrender.com/api/products');
                if (!response.ok) throw new Error('Network response was not ok');
                
                const products = await response.json();
                productCatalogueContainer.innerHTML = ''; 

                if (products.length === 0) {
                    productCatalogueContainer.innerHTML = '<p>No products found.</p>';
                    return;
                }

                products.forEach(product => {
                    const productCard = document.createElement('div');
                    productCard.className = 'product-card';
                    productCard.innerHTML = `
                        <div class="product-image">
                            <img src="${product.imageUrl}" alt="${product.name}">
                        </div>
                        <div class="product-info">
                            <h4>${product.name}</h4>
                            <p>₹${product.price.toFixed(2)}</p>
                            <a href="product-cora.html?id=${product._id}" class="btn">View Details</a>
                        </div>
                    `;
                    productCatalogueContainer.appendChild(productCard);
                });

            } catch (error) {
                console.error('Failed to fetch products:', error);
                productCatalogueContainer.innerHTML = '<p>Error loading products. Please try again later.</p>';
            }
        };
        fetchProducts();
    }
    const productDetailContainer = document.getElementById('product-detail-content');

    if (productDetailContainer) {
        const params = new URLSearchParams(window.location.search);
        const productId = params.get('id');

        if (productId) {
            const fetchProduct = async () => {
                try {
                    const response = await fetch(`https://venyora-api.onrender.com/api/products/${productId}`);
                    if (!response.ok) throw new Error('Product not found');

                    const product = await response.json();
                    document.title = `${product.name} | VENYORA`;

                    productDetailContainer.innerHTML = `
                        <div class="product-image">
                            <img src="${product.imageUrl}" alt="${product.name}" id="product-image">
                        </div>
                        <div class="product-details">
                            <h1 id="product-name">${product.name}</h1>
                            <p class="price" id="product-price">₹${product.price.toFixed(2)}</p>
                            <p class="description" id="product-description">${product.description}</p>
                            
                            <button class="btn add-to-bag-btn" data-product-id="${product._id}">ADD TO BAG</button>
                            
                            <div class="accordion">
                                </div>
                        </div>
                    `;
                } catch (error) {
                    console.error('Failed to fetch product:', error);
                    productDetailContainer.innerHTML = '<p>Product could not be found.</p>';
                }
            };
            fetchProduct();
        } else {
            productDetailContainer.innerHTML = '<p>No product ID provided.</p>';
        }
    }
    const addItemToCart = async (productId, quantity = 1) => {
        const token = localStorage.getItem('venyora-token');
        if (token) {
            try {
                const response = await fetch('https://venyora-api.onrender.com/api/cart', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ productId, quantity })
                });

                if (!response.ok) {
                    const errorResult = await response.json();
                    throw new Error(errorResult.message || 'Failed to add item to cart');
                }

                alert('Item added to your cart!');

            } catch (error) {
                console.error('Error adding item to cart:', error);
                alert(`Error: ${error.message}`);
            }
        } 
        else {
            const productName = document.getElementById('product-name')?.textContent;
            const productPrice = parseFloat(document.getElementById('product-price')?.textContent.replace('₹', ''));
            const productImage = document.getElementById('product-image')?.src;

            if (!productName) {
                alert("Could not find product details to add to guest cart.");
                return;
            }

            let guestCart = JSON.parse(localStorage.getItem("venyoraGuestCart")) || [];
            const existingItem = guestCart.find(item => item.id === productId);

            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                guestCart.push({ id: productId, name: productName, price: productPrice, image: productImage, quantity });
            }
            
            localStorage.setItem("venyoraGuestCart", JSON.stringify(guestCart));
            alert(productName + " added to your guest cart!");
        }
    };
    document.body.addEventListener("click", e => {
        if (e.target.matches(".add-to-bag-btn")) {
            const productId = e.target.dataset.productId;
            if (productId) {
                addItemToCart(productId); 
            }
        }
    });
});