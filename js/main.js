/* 
   KSRTC Training Institute Custom Script
   Handles Interactive Features (Stats Counter, Filterable Gallery, Search, Dynamic Modals)
*/

document.addEventListener('DOMContentLoaded', () => {
    // 1. Sticky Header Transition on Scroll
    const header = document.querySelector('.header-main');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // 2. Statistics Counter Animation
    const statsSection = document.querySelector('.stats-section');
    const counters = document.querySelectorAll('.stat-number');
    
    if (statsSection && counters.length > 0) {
        const countUp = (element) => {
            const target = parseInt(element.getAttribute('data-target'), 10);
            const duration = 2000; // 2 seconds animation
            const stepTime = 30;
            const steps = duration / stepTime;
            const increment = target / steps;
            let current = 0;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    element.textContent = target.toLocaleString() + (element.getAttribute('data-suffix') || '');
                    clearInterval(timer);
                } else {
                    element.textContent = Math.floor(current).toLocaleString() + (element.getAttribute('data-suffix') || '');
                }
            }, stepTime);
        };

        // Trigger animation when the section is in view
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    counters.forEach(counter => countUp(counter));
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        observer.observe(statsSection);
    }

    // 3. Filterable Gallery
    const filterButtons = document.querySelectorAll('.gallery-filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item-col');

    if (filterButtons.length > 0 && galleryItems.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Set active class
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                const filterValue = button.getAttribute('data-filter');

                galleryItems.forEach(item => {
                    if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                        item.style.display = 'block';
                        // Add fade-in animation
                        const card = item.querySelector('.gallery-item-card');
                        if (card) {
                            card.style.animation = 'none';
                            card.offsetHeight; // Trigger reflow
                            card.style.animation = 'fadeInUp 0.5s ease-in-out forwards';
                        }
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
    }

    // 4. Gallery Photo Zoom Modal
    const galleryCards = document.querySelectorAll('.gallery-item-card');
    const zoomModalEl = document.getElementById('galleryZoomModal');
    
    if (galleryCards.length > 0 && zoomModalEl) {
        const zoomModal = new bootstrap.Modal(zoomModalEl);
        const modalImg = zoomModalEl.querySelector('.modal-zoom-img');
        const modalTitle = zoomModalEl.querySelector('.modal-zoom-title');
        const modalDesc = zoomModalEl.querySelector('.modal-zoom-desc');

        galleryCards.forEach(card => {
            card.addEventListener('click', () => {
                const img = card.querySelector('img');
                const title = card.querySelector('.gallery-title').textContent;
                const desc = card.querySelector('.gallery-category').textContent;

                if (modalImg && img) modalImg.src = img.src;
                if (modalTitle) modalTitle.textContent = title;
                if (modalDesc) modalDesc.textContent = desc;

                zoomModal.show();
            });
        });
    }

    // 5. Batch Search and Filter functionality
    const batchSearchInput = document.getElementById('batchSearch');
    const typeFilter = document.getElementById('courseTypeFilter');
    const locationFilter = document.getElementById('locationFilter');
    const batchCards = document.querySelectorAll('.batch-card-col');

    function filterBatches() {
        if (!batchCards.length) return;

        const query = batchSearchInput ? batchSearchInput.value.toLowerCase() : '';
        const selectedType = typeFilter ? typeFilter.value.toLowerCase() : 'all';
        const selectedLocation = locationFilter ? locationFilter.value.toLowerCase() : 'all';

        batchCards.forEach(cardCol => {
            const card = cardCol.querySelector('.batch-card');
            const title = card.querySelector('.card-title').textContent.toLowerCase();
            const code = card.querySelector('.batch-code').textContent.toLowerCase();
            const type = card.getAttribute('data-type').toLowerCase();
            const location = card.getAttribute('data-location').toLowerCase();

            const matchesSearch = title.includes(query) || code.includes(query);
            const matchesType = selectedType === 'all' || type === selectedType;
            const matchesLocation = selectedLocation === 'all' || location === selectedLocation;

            if (matchesSearch && matchesType && matchesLocation) {
                cardCol.style.display = 'block';
            } else {
                cardCol.style.display = 'none';
            }
        });
    }

    if (batchSearchInput) batchSearchInput.addEventListener('input', filterBatches);
    if (typeFilter) typeFilter.addEventListener('change', filterBatches);
    if (locationFilter) locationFilter.addEventListener('change', filterBatches);

    // 6. Enrollment Apply Pre-fill
    const applyButtons = document.querySelectorAll('.btn-apply-batch');
    const enrollModalEl = document.getElementById('enrollModal');
    const courseInput = document.getElementById('enrollCourseName');
    const batchCodeInput = document.getElementById('enrollBatchCode');

    if (applyButtons.length > 0 && enrollModalEl) {
        const enrollModal = new bootstrap.Modal(enrollModalEl);
        
        applyButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = btn.closest('.batch-card');
                const courseName = card.querySelector('.card-title').textContent;
                const batchCode = card.querySelector('.batch-code').textContent;

                if (courseInput) courseInput.value = courseName;
                if (batchCodeInput) batchCodeInput.value = batchCode;

                enrollModal.show();
            });
        });
    }

    // 7. Enrollment Form Submission
    const enrollForm = document.getElementById('enrollmentForm');
    if (enrollForm) {
        enrollForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Check form validity (Bootstrap-style validation)
            if (!enrollForm.checkValidity()) {
                e.stopPropagation();
                enrollForm.classList.add('was-validated');
                return;
            }

            // Mock submission success
            const modalInstance = bootstrap.Modal.getInstance(enrollModalEl);
            if (modalInstance) modalInstance.hide();

            // Clear form
            enrollForm.reset();
            enrollForm.classList.remove('was-validated');

            // Show success notification
            showToast('Application Submitted!', 'Your application has been received. Our team will contact you shortly.');
        });
    }

    // 8. Contact Form Handling
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (!contactForm.checkValidity()) {
                e.stopPropagation();
                contactForm.classList.add('was-validated');
                return;
            }

            contactForm.reset();
            contactForm.classList.remove('was-validated');

            showToast('Message Sent!', 'Thank you for contacting us. We will respond to your query within 24-48 hours.');
        });
    }

    // Helper: Show Bootstrap Toast dynamically
    function showToast(title, body) {
        // Check if toast container exists, if not create it
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
            toastContainer.style.zIndex = '1090';
            document.body.appendChild(toastContainer);
        }

        const toastId = 'toast-' + Date.now();
        const toastHtml = `
            <div id="${toastId}" class="toast align-items-center text-white bg-success border-0" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">
                        <strong class="d-block">${title}</strong>
                        ${body}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `;
        
        toastContainer.insertAdjacentHTML('beforeend', toastHtml);
        const toastEl = document.getElementById(toastId);
        const toast = new bootstrap.Toast(toastEl, { delay: 5000 });
        toast.show();

        // Remove toast from DOM after hidden
        toastEl.addEventListener('hidden.bs.toast', () => {
            toastEl.remove();
        });
    }

    // 8. Dynamic Placement of Google Translate Widget based on Viewport Size
    const checkTranslatePlacement = () => {
        const translateElement = document.getElementById('google_translate_element');
        if (!translateElement) return;
        
        const desktopContainer = document.getElementById('translate-desktop-container');
        const mobileContainer = document.getElementById('translate-mobile-container');
        
        if (window.innerWidth < 992) {
            if (mobileContainer && translateElement.parentElement !== mobileContainer) {
                mobileContainer.appendChild(translateElement);
            }
        } else {
            if (desktopContainer && translateElement.parentElement !== desktopContainer) {
                desktopContainer.appendChild(translateElement);
            }
        }
    };

    // Run on resize and check periodically to account for async Google script load
    checkTranslatePlacement();
    window.addEventListener('resize', checkTranslatePlacement);
    let checkCount = 0;
    const translatePoll = setInterval(() => {
        checkTranslatePlacement();
        checkCount++;
        if (checkCount > 15) {
            clearInterval(translatePoll);
        }
    }, 250);
});

// Global function to trigger Google Translate programmatically
window.translatePage = function(langCode) {
    const setTranslateCookieAndReload = () => {
        document.cookie = `googtrans=/en/${langCode}; path=/`;
        if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
            document.cookie = `googtrans=/en/${langCode}; domain=.${location.hostname}; path=/`;
        }
        window.location.reload();
    };

    const selectLanguage = (selectEl) => {
        let targetValue = langCode;
        if (langCode === 'en') {
            const hasEn = Array.from(selectEl.options).some(opt => opt.value === 'en');
            if (!hasEn) {
                targetValue = ''; // Fallback for original page language (English)
            }
        }
        
        // If it's already on this language, do nothing
        if (selectEl.value === targetValue) return;

        selectEl.value = targetValue;
        
        // Dispatch modern event
        if (typeof Event === 'function') {
            selectEl.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
        } else {
            const evt = document.createEvent('HTMLEvents');
            evt.initEvent('change', true, true);
            selectEl.dispatchEvent(evt);
        }
    };

    const selectEl = document.querySelector('select.goog-te-combo');
    if (selectEl) {
        selectLanguage(selectEl);
    } else {
        // Retry once in case widget is still rendering asynchronously
        setTimeout(() => {
            const selectRetry = document.querySelector('select.goog-te-combo');
            if (selectRetry) {
                selectLanguage(selectRetry);
            } else {
                console.warn("Google Translate widget select not found, falling back to cookie.");
                setTranslateCookieAndReload();
            }
        }, 500);
    }
};
