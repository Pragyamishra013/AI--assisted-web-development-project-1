document.addEventListener('DOMContentLoaded', () => {

    // --- Shopping Cart System ---
    let cart = [];

    const cartToggleBtn = document.getElementById('cartToggleBtn');
    const cartDrawer = document.getElementById('cartDrawer');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartDrawerClose = document.getElementById('cartDrawerClose');
    const cartBadge = document.getElementById('cartBadge');
    const cartItemsList = document.getElementById('cartItemsList');
    const cartEmptyState = document.getElementById('cartEmptyState');
    const cartTotalAmount = document.getElementById('cartTotalAmount');
    const cartCheckoutBtn = document.getElementById('cartCheckoutBtn');

    const getCartCount = () => cart.reduce((sum, item) => sum + item.qty, 0);

    const getCartTotal = () => cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    const addToCart = (name, price) => {
        const existing = cart.find(item => item.name === name);
        if (existing) {
            existing.qty += 1;
        } else {
            cart.push({ name, price: parseInt(price, 10), qty: 1 });
        }
        renderCart();
        showNotification('Item Added', `${name} (₹${price}) has been added to your cart.`);
    };

    const updateCartQty = (name, delta) => {
        const item = cart.find(i => i.name === name);
        if (!item) return;
        item.qty += delta;
        if (item.qty <= 0) {
            cart = cart.filter(i => i.name !== name);
        }
        renderCart();
    };

    const renderCart = () => {
        const count = getCartCount();
        const total = getCartTotal();

        if (cartBadge) {
            cartBadge.textContent = count;
            cartBadge.classList.toggle('hidden', count === 0);
        }

        if (cartTotalAmount) {
            cartTotalAmount.textContent = `₹${total}`;
        }

        if (cartCheckoutBtn) {
            cartCheckoutBtn.disabled = count === 0;
        }

        if (!cartItemsList || !cartEmptyState) return;

        if (cart.length === 0) {
            cartEmptyState.classList.remove('hidden');
            cartItemsList.classList.add('hidden');
            cartItemsList.innerHTML = '';
            return;
        }

        cartEmptyState.classList.add('hidden');
        cartItemsList.classList.remove('hidden');
        cartItemsList.innerHTML = cart.map(item => `
            <li class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">₹${item.price * item.qty}</div>
                </div>
                <div class="cart-item-controls">
                    <button class="cart-qty-btn" data-action="decrease" data-item="${item.name}" aria-label="Decrease quantity">−</button>
                    <span class="cart-item-qty">${item.qty}</span>
                    <button class="cart-qty-btn" data-action="increase" data-item="${item.name}" aria-label="Increase quantity">+</button>
                </div>
            </li>
        `).join('');

        cartItemsList.querySelectorAll('.cart-qty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.getAttribute('data-action');
                const itemName = btn.getAttribute('data-item');
                updateCartQty(itemName, action === 'increase' ? 1 : -1);
            });
        });
    };

    const openCart = () => {
        if (cartDrawer) cartDrawer.classList.add('open');
        if (cartOverlay) {
            cartOverlay.classList.add('visible');
            cartOverlay.setAttribute('aria-hidden', 'false');
        }
        document.body.style.overflow = 'hidden';
    };

    const closeCart = () => {
        if (cartDrawer) cartDrawer.classList.remove('open');
        if (cartOverlay) {
            cartOverlay.classList.remove('visible');
            cartOverlay.setAttribute('aria-hidden', 'true');
        }
        document.body.style.overflow = '';
    };

    if (cartToggleBtn) cartToggleBtn.addEventListener('click', openCart);
    if (cartDrawerClose) cartDrawerClose.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && cartDrawer && cartDrawer.classList.contains('open')) {
            closeCart();
        }
    });

    if (cartCheckoutBtn) {
        cartCheckoutBtn.addEventListener('click', () => {
            if (cart.length === 0) return;
            const total = getCartTotal();
            const itemSummary = cart.map(i => `${i.name} × ${i.qty}`).join(', ');
            closeCart();
            showModal(`
                <div class="booking-success text-center">
                    <div class="success-check-icon">✓</div>
                    <h3>Payment Successful</h3>
                    <p class="booking-code-text">Order Total: <strong>₹${total}</strong></p>
                    <div class="booking-summary-card">
                        <div class="summary-row">
                            <span class="label">Items:</span>
                            <span class="val">${itemSummary}</span>
                        </div>
                        <div class="summary-row">
                            <span class="label">Payment:</span>
                            <span class="val">Online Payment</span>
                        </div>
                        <div class="summary-row">
                            <span class="label">Status:</span>
                            <span class="val">Confirmed</span>
                        </div>
                    </div>
                    <p class="note margin-top-15">Your order has been placed. A confirmation email will be sent shortly.</p>
                    <button class="btn btn-gold btn-large margin-top-20" id="btnClearCartAfterPayment">Done</button>
                </div>
            `);
            document.getElementById('btnClearCartAfterPayment').addEventListener('click', () => {
                cart = [];
                renderCart();
                closeModal();
            });
        });
    }

    // --- 1. Mobile Menu Toggle ---
    const mobileNavToggle = document.getElementById('mobileNavToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (mobileNavToggle && navMenu) {
        mobileNavToggle.addEventListener('click', () => {
            mobileNavToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu when link is clicked
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileNavToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // --- 2. Top Action Bar Service Selection ---
    const actionItems = document.querySelectorAll('.action-item');
    actionItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active from all
            actionItems.forEach(i => i.classList.remove('active'));
            // Add active to clicked
            item.classList.add('active');

            const service = item.getAttribute('data-service');
            
            if (service === 'reserve') {
                const resSection = document.getElementById('reservation');
                if (resSection) {
                    resSection.scrollIntoView({ behavior: 'smooth' });
                }
            } else if (service === 'online') {
                showNotification('Order Online Active', 'Please browse our menu below and click "Add" to build your online order.');
                const menuSection = document.getElementById('menu');
                if (menuSection) {
                    menuSection.scrollIntoView({ behavior: 'smooth' });
                }
            } else if (service === 'takeaway') {
                showNotification('Takeaway Pickup Active', 'Select items from our menu below. Your order will be prepared for immediate pickup.');
                const menuSection = document.getElementById('menu');
                if (menuSection) {
                    menuSection.scrollIntoView({ behavior: 'smooth' });
                }
            } else if (service === 'dine-in') {
                showNotification('Dine In Active', 'Welcome to a premium sit-down experience. You can browse menu items or book a table below.');
            }
        });
    });

    // --- 3. Bestsellers & Menu Quick Add (unified cart) ---
    const quickAddBtns = document.querySelectorAll('.quick-add-btn');
    quickAddBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const itemName = btn.getAttribute('data-item');
            const itemPrice = btn.getAttribute('data-price');

            btn.classList.add('btn-clicked');
            setTimeout(() => btn.classList.remove('btn-clicked'), 200);

            addToCart(itemName, itemPrice);
        });
    });

    // --- 4. Menu Section Category Tabs & Filtering ---
    const menuTabs = document.querySelectorAll('.menu-tab-btn');
    const menuItemCards = document.querySelectorAll('.menu-item-card');

    menuTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active tab button
            menuTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const selectedCategory = tab.getAttribute('data-category');

            menuItemCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                if (cardCategory === selectedCategory) {
                    card.classList.remove('hidden');
                    // Add entry animation trigger
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(10px)';
                    setTimeout(() => {
                        card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });

    // --- 5. Interactive Loyalty Program Digital Card ---
    const stampsGrid = document.getElementById('stampsGrid');
    const stampsStatus = document.getElementById('stampsStatus');
    const btnSimulateStamp = document.getElementById('btnSimulateStamp');

    if (stampsGrid && stampsStatus && btnSimulateStamp) {
        // Handle direct stamp circle clicking to toggle stamp status
        const stampCircles = stampsGrid.querySelectorAll('.stamp-circle');
        
        const updateStampsUI = () => {
            const stampedCount = stampsGrid.querySelectorAll('.stamp-circle.stamped').length;
            
            if (stampedCount >= 9) {
                stampsStatus.innerHTML = `<strong>9 of 9 stamps collected!</strong> Your 10th cup is unlocked.`;
                const rewardCircle = stampsGrid.querySelector('.stamp-circle.reward');
                rewardCircle.classList.add('unlocked');
            } else {
                stampsStatus.innerHTML = `<strong>${stampedCount} of 9 stamps</strong> collected. ${9 - stampedCount} more to go!`;
                const rewardCircle = stampsGrid.querySelector('.stamp-circle.reward');
                rewardCircle.classList.remove('unlocked');
            }
        };

        stampCircles.forEach(circle => {
            circle.addEventListener('click', () => {
                // If it is the 10th reward slot and unlocked, trigger the prize
                if (circle.classList.contains('reward')) {
                    if (circle.classList.contains('unlocked')) {
                        triggerRewardRedemption();
                    } else {
                        showNotification('Keep Collecting!', 'Buy 9 coffees first to unlock your free 10th reward beverage.');
                    }
                    return;
                }

                // Toggle standard stamp
                circle.classList.toggle('stamped');
                
                // Add icon content if stamped
                const mark = circle.querySelector('.stamp-mark');
                if (circle.classList.contains('stamped')) {
                    mark.textContent = '☕';
                    showNotification('Stamp Collected', 'Coffee purchase stamped on your card.');
                } else {
                    mark.textContent = '';
                }
                
                updateStampsUI();
            });
        });

        // Simulate stamp button
        btnSimulateStamp.addEventListener('click', () => {
            const emptyStamp = stampsGrid.querySelector('.stamp-circle:not(.stamped):not(.reward)');
            if (emptyStamp) {
                emptyStamp.classList.add('stamped');
                emptyStamp.querySelector('.stamp-mark').textContent = '☕';
                updateStampsUI();
                showNotification('Stamp Added', 'You stamped a coffee!');
            } else {
                const rewardCircle = stampsGrid.querySelector('.stamp-circle.reward');
                if (rewardCircle.classList.contains('unlocked')) {
                    triggerRewardRedemption();
                } else {
                    showNotification('Card Fully Stamped!', 'Click the gift box reward icon to redeem your free coffee!');
                }
            }
        });

        const triggerRewardRedemption = () => {
            showModal(`
                <div class="reward-success-modal text-center">
                    <div class="reward-icon-large">🎁</div>
                    <h3>Free Coffee Unlocked!</h3>
                    <p class="margin-top-10">Congratulations! You have completed your Smoky Circle loyalty card.</p>
                    <div class="coupon-code-box">
                        <span class="coupon-label">REDEEM CODE</span>
                        <span class="coupon-code">SMOKY-FREE-10</span>
                    </div>
                    <p class="note margin-top-15">Show this code to your barista on your next visit to get your free handcrafted coffee.</p>
                    <button class="btn btn-gold btn-large margin-top-20" id="btnResetLoyalty">Claim & Reset Card</button>
                </div>
            `);

            document.getElementById('btnResetLoyalty').addEventListener('click', () => {
                // Reset card
                stampCircles.forEach(circle => {
                    if (circle.classList.contains('reward')) {
                        circle.classList.remove('unlocked');
                    } else {
                        circle.classList.remove('stamped');
                        circle.querySelector('.stamp-mark').textContent = '';
                    }
                });
                // Give back 3 stamps as starter points for the next card loop
                for (let i = 0; i < 3; i++) {
                    stampCircles[i].classList.add('stamped');
                    stampCircles[i].querySelector('.stamp-mark').textContent = '☕';
                }
                updateStampsUI();
                closeModal();
                showNotification('Card Reset', 'A new loyalty card has been opened with 3 starter stamps!');
            });
        };
    }

    // --- 6. Events & Special Offers Tab Switcher ---
    const toggleEventsBtn = document.getElementById('toggleEventsBtn');
    const toggleOffersBtn = document.getElementById('toggleOffersBtn');
    const eventsGrid = document.getElementById('eventsGrid');
    const offersGrid = document.getElementById('offersGrid');

    if (toggleEventsBtn && toggleOffersBtn && eventsGrid && offersGrid) {
        toggleEventsBtn.addEventListener('click', () => {
            toggleEventsBtn.classList.add('active');
            toggleOffersBtn.classList.remove('active');
            eventsGrid.classList.add('active-view');
            eventsGrid.classList.remove('hidden-view');
            offersGrid.classList.remove('active-view');
            offersGrid.classList.add('hidden-view');
        });

        toggleOffersBtn.addEventListener('click', () => {
            toggleOffersBtn.classList.add('active');
            toggleEventsBtn.classList.remove('active');
            offersGrid.classList.add('active-view');
            offersGrid.classList.remove('hidden-view');
            eventsGrid.classList.remove('active-view');
            eventsGrid.classList.add('hidden-view');
        });

        // Event Registration with ticket price & payment form
        const registerBtns = document.querySelectorAll('.event-register-btn');
        registerBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const eventName = btn.getAttribute('data-event');
                const ticketPrice = btn.getAttribute('data-price');
                showEventRegistrationForm(eventName, ticketPrice);
            });
        });
    }

    const showEventRegistrationForm = (eventName, ticketPrice) => {
        showModal(`
            <div class="event-registration text-center">
                <div class="modal-icon-header">🎟️</div>
                <h3>${eventName}</h3>
                <span class="event-ticket-label">Ticket Price</span>
                <div class="event-ticket-price">₹${ticketPrice}</div>
                <form class="event-reg-form" id="eventRegForm">
                    <div class="form-group">
                        <label for="eventRegName">Name</label>
                        <input type="text" id="eventRegName" class="form-input" placeholder="Your full name" required>
                    </div>
                    <div class="form-group">
                        <label for="eventRegEmail">Email</label>
                        <input type="email" id="eventRegEmail" class="form-input" placeholder="your@email.com" required>
                    </div>
                    <div class="form-group">
                        <label>Payment Method</label>
                        <label class="payment-option-box selected" id="paymentOptionBox">
                            <input type="radio" name="paymentMethod" value="online" checked>
                            <div>
                                <div class="payment-option-label">Online Payment</div>
                                <div class="payment-option-desc">Pay securely via UPI, card, or net banking</div>
                            </div>
                        </label>
                    </div>
                    <button type="submit" class="btn btn-gold btn-block btn-large margin-top-10">Pay ₹${ticketPrice} & Register</button>
                </form>
            </div>
        `);

        const eventRegForm = document.getElementById('eventRegForm');
        const paymentBox = document.getElementById('paymentOptionBox');

        if (paymentBox) {
            paymentBox.addEventListener('click', () => {
                paymentBox.classList.add('selected');
                paymentBox.querySelector('input[type="radio"]').checked = true;
            });
        }

        if (eventRegForm) {
            eventRegForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('eventRegName').value.trim();
                const email = document.getElementById('eventRegEmail').value.trim();

                if (!name || !email) return;

                showModal(`
                    <div class="event-registration text-center">
                        <div class="success-check-icon">✓</div>
                        <h3>Event Registered!</h3>
                        <p class="margin-top-10">You have been registered. A reminder email and digital entry pass have been sent to your registered email address. See you there!</p>
                        <div class="booking-summary-card margin-top-20">
                            <div class="summary-row">
                                <span class="label">Event:</span>
                                <span class="val">${eventName}</span>
                            </div>
                            <div class="summary-row">
                                <span class="label">Registered As:</span>
                                <span class="val">${name}</span>
                            </div>
                            <div class="summary-row">
                                <span class="label">Email:</span>
                                <span class="val">${email}</span>
                            </div>
                            <div class="summary-row">
                                <span class="label">Amount Paid:</span>
                                <span class="val">₹${ticketPrice}</span>
                            </div>
                        </div>
                        <button class="btn btn-gold btn-large margin-top-20" onclick="closeModal()">Awesome</button>
                    </div>
                `);
            });
        }
    }

    // --- 7. Reviews Testimonial Slider Carousel ---
    const reviewsCarousel = document.getElementById('reviewsCarousel');
    const dots = document.querySelectorAll('.dot');
    
    if (reviewsCarousel && dots.length > 0) {
        const slides = reviewsCarousel.querySelectorAll('.review-slide');
        let currentSlide = 0;
        let slideInterval;

        const showSlide = (index) => {
            slides.forEach(slide => slide.classList.remove('active-slide'));
            dots.forEach(dot => dot.classList.remove('active'));

            slides[index].classList.add('active-slide');
            dots[index].classList.add('active');
            currentSlide = index;
        };

        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                const slideIdx = parseInt(dot.getAttribute('data-slide'));
                showSlide(slideIdx);
                resetInterval();
            });
        });

        const startInterval = () => {
            slideInterval = setInterval(() => {
                let nextSlide = (currentSlide + 1) % slides.length;
                showSlide(nextSlide);
            }, 6000);
        };

        const resetInterval = () => {
            clearInterval(slideInterval);
            startInterval();
        };

        startInterval();
    }

    // --- 8. Table Reservation Form Submission & Verification ---
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        // Set minimum date picker to today
        const bookingDateInput = document.getElementById('bookingDate');
        if (bookingDateInput) {
            const today = new Date().toISOString().split('T')[0];
            bookingDateInput.min = today;
        }

        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('bookingName').value;
            const phone = document.getElementById('bookingPhone').value;
            const date = document.getElementById('bookingDate').value;
            const time = document.getElementById('bookingTime').value;
            const guests = document.getElementById('bookingGuests').value;
            const requests = document.getElementById('bookingRequests').value || 'None';

            // Generate booking ID
            const bookingId = 'SMK-' + Math.floor(1000 + Math.random() * 9000) + '-RESE';

            // Show Confirmation Modal
            showModal(`
                <div class="booking-success text-center">
                    <div class="success-check-icon">✓</div>
                    <h3>Reservation Confirmed</h3>
                    <p class="booking-code-text">Booking Code: <strong>${bookingId}</strong></p>
                    <div class="booking-summary-card">
                        <div class="summary-row">
                            <span class="label">Reserved For:</span>
                            <span class="val">${name}</span>
                        </div>
                        <div class="summary-row">
                            <span class="label">Date & Time:</span>
                            <span class="val">${date} at ${time}</span>
                        </div>
                        <div class="summary-row">
                            <span class="label">Party Size:</span>
                            <span class="val">${guests}</span>
                        </div>
                        <div class="summary-row">
                            <span class="label">Contact Phone:</span>
                            <span class="val">${phone}</span>
                        </div>
                        <div class="summary-row">
                            <span class="label">Special Notes:</span>
                            <span class="val italic">${requests}</span>
                        </div>
                    </div>
                    <p class="note margin-top-15">We are holding your table for 15 minutes past your reserved time. An SMS confirmation was sent.</p>
                    <button class="btn btn-gold btn-large margin-top-20" onclick="closeModal()">Great, See You There</button>
                </div>
            `);

            // Reset form
            bookingForm.reset();
        });
    }

    // --- 9. Modal Management Helpers ---
    const backdrop = document.getElementById('modalBackdrop');
    const closeBtn = document.getElementById('modalCloseBtn');
    const contentContainer = document.getElementById('modalContent');

    window.showModal = (htmlContent) => {
        if (backdrop && contentContainer) {
            contentContainer.innerHTML = htmlContent;
            backdrop.classList.add('visible');
            document.body.style.overflow = 'hidden'; // Lock scroll
        }
    };

    window.closeModal = () => {
        if (backdrop) {
            backdrop.classList.remove('visible');
            document.body.style.overflow = ''; // Unlock scroll
        }
    };

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    if (backdrop) {
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) {
                closeModal();
            }
        });
    }

    // --- 10. Floating Toast Notifications ---
    window.showNotification = (title, message) => {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.innerHTML = `
            <div class="toast-header">
                <span class="toast-title-text">${title}</span>
                <button class="toast-close-btn">&times;</button>
            </div>
            <p class="toast-body">${message}</p>
        `;
        
        // Append to body
        document.body.appendChild(toast);
        
        // Triggers slide in
        setTimeout(() => toast.classList.add('visible'), 50);
        
        // Close on button click
        toast.querySelector('.toast-close-btn').addEventListener('click', () => {
            toast.classList.remove('visible');
            setTimeout(() => toast.remove(), 400);
        });

        // Auto remove after 4.5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.classList.remove('visible');
                setTimeout(() => toast.remove(), 400);
            }
        }, 4500);
    };

    renderCart();

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});
