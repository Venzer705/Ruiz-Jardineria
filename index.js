document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================================================
    // 1. SCROLL EFFECT ON HEADER
    // ==========================================================================
    const header = document.querySelector('.main-header');
    const handleScroll = () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    
    // ==========================================================================
    // 2. MOBILE NAVIGATION MENU
    // ==========================================================================
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mainNav = document.getElementById('main-navigation');
    const navLinks = document.querySelectorAll('.nav-link');
    
    const toggleMenu = () => {
        const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
        mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
        mobileMenuBtn.classList.toggle('active');
        mainNav.classList.toggle('active');
    };
    
    mobileMenuBtn.addEventListener('click', toggleMenu);
    
    // Close menu when clicking nav links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mainNav.classList.contains('active')) {
                toggleMenu();
            }
            
            // Set active class visually
            navLinks.forEach(item => item.classList.remove('active'));
            link.classList.add('active');
        });
    });
    
    // Highlight menu links on scroll
    const sections = document.querySelectorAll('section[id]');
    const scrollActiveNav = () => {
        const scrollY = window.pageYOffset;
        
        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 150;
            const sectionId = current.getAttribute('id');
            const navLink = document.querySelector(`.nav-links a[href*=${sectionId}]`);
            
            if (navLink) {
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    navLinks.forEach(item => item.classList.remove('active'));
                    navLink.classList.add('active');
                }
            }
        });
    };
    window.addEventListener('scroll', scrollActiveNav);

    // ==========================================================================
    // 3. INTERACTIVE BUDGET CALCULATOR
    // ==========================================================================
    // Rates (Price per square meter / flat rates)
    const RATES = {
        mow: 0.09,          // Lawnmower
        brush: 0.18,        // Brush clearing (Desbrozado)
        collect: 0.04,      // Collection
        profileAddon: 0.06  // Profiling addon
    };
    const BASE_COST = 12.00; // Base call-out / displacement cost

    // DOM Elements
    const gardenSizeSlider = document.getElementById('garden-size');
    const gardenSizeNum = document.getElementById('garden-size-num');
    const sizeOutput = document.getElementById('size-output');
    
    const cbMow = document.getElementById('cb-mow');
    const cbBrush = document.getElementById('cb-brush');
    const cbCollect = document.getElementById('cb-collect');
    const calcProfilingOpt = document.getElementById('calc-profiling-opt');
    const profileAddonNotice = document.getElementById('profile-addon-notice');
    
    const labelMow = document.getElementById('label-cb-mow');
    const labelBrush = document.getElementById('label-cb-brush');
    const labelCollect = document.getElementById('label-cb-collect');
    
    const estimatedPriceDisplay = document.getElementById('estimated-price');
    const btnApplyBudget = document.getElementById('btn-apply-budget');
    
    let currentCalculatedPrice = 49;

    // Helper: Roll number animation
    const animatePrice = (start, end, duration = 400) => {
        if (start === end) return;
        const range = end - start;
        let startTime = null;
        
        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            // Easing function: easeOutQuad
            const easedProgress = progress * (2 - progress);
            const value = Math.round(start + range * easedProgress);
            estimatedPriceDisplay.textContent = value;
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    };

    // Calculate budget function
    const calculateBudget = () => {
        const size = parseInt(gardenSizeSlider.value) || 0;
        
        let servicesCount = 0;
        let areaPrice = 0;
        let flatPrice = 0;
        let isCustomPrice = false;
        
        if (cbMow && cbMow.checked) {
            areaPrice += RATES.mow;
            servicesCount++;
        }
        if (cbBrush && cbBrush.checked) {
            areaPrice += RATES.brush;
            servicesCount++;
        }
        if (cbCollect && cbCollect.checked) {
            areaPrice += RATES.collect;
            servicesCount++;
        }
        
        const profilingVal = calcProfilingOpt.value;
        
        if (profilingVal === 'basic') {
            flatPrice += 15.00;
            servicesCount++;
        } else if (profilingVal === 'intermediate') {
            flatPrice += 30.00;
            servicesCount++;
        } else if (profilingVal === 'intensive') {
            isCustomPrice = true;
            servicesCount++;
        }
        
        let totalPrice = 0;
        const volumeDiscountBadge = document.getElementById('volume-discount-badge');
        const eligibleForDiscount = (cbMow && cbMow.checked) || (cbBrush && cbBrush.checked);
        
        if (servicesCount > 0) {
            totalPrice = BASE_COST + (size * areaPrice) + flatPrice;
            
            // Premium discount: 10% off for large gardens (> 500m2)
            // Only applies if either Corte (mow) or Desbrozado (brush) is contracted
            if (size > 500 && eligibleForDiscount) {
                totalPrice *= 0.9;
                if (volumeDiscountBadge) volumeDiscountBadge.style.display = 'inline-flex';
            } else {
                if (volumeDiscountBadge) volumeDiscountBadge.style.display = 'none';
            }
        } else {
            if (volumeDiscountBadge) volumeDiscountBadge.style.display = 'none';
        }
        
        const finalPrice = Math.round(totalPrice);
        
        if (isCustomPrice) {
            estimatedPriceDisplay.style.fontSize = "1.8rem";
            estimatedPriceDisplay.textContent = "Personalizado";
        } else {
            estimatedPriceDisplay.style.fontSize = "";
            animatePrice(currentCalculatedPrice, finalPrice);
            currentCalculatedPrice = finalPrice;
        }
    };

    // Update Slider UI and synchronize with number input
    const updateSizeFromSlider = () => {
        const val = gardenSizeSlider.value;
        sizeOutput.textContent = val;
        gardenSizeNum.value = val;
        
        // Hide error when using the slider
        const errorMsg = document.getElementById('calc-error-msg');
        if (errorMsg) errorMsg.style.display = 'none';
        gardenSizeNum.classList.remove('input-error');
        
        calculateBudget();
    };

    // Update Number Input UI and synchronize with range slider
    const updateSizeFromNum = () => {
        let val = parseInt(gardenSizeNum.value);
        if (isNaN(val)) return;
        
        const errorMsg = document.getElementById('calc-error-msg');
        
        // Boundaries check and error styling
        if (val > 1000) {
            if (errorMsg) errorMsg.style.display = 'block';
            gardenSizeNum.classList.add('input-error');
            val = 1000;
            gardenSizeNum.value = 1000;
        } else {
            if (errorMsg) errorMsg.style.display = 'none';
            gardenSizeNum.classList.remove('input-error');
            
            if (val < 10) {
                val = 10;
                gardenSizeNum.value = 10;
            }
        }
        
        gardenSizeSlider.value = val;
        sizeOutput.textContent = val;
        calculateBudget();
    };

    // Card Checkbox styling updates
    const toggleServiceCheckbox = (checkbox, label) => {
        if (checkbox && label) {
            if (checkbox.checked) {
                label.classList.add('active');
            } else {
                label.classList.remove('active');
            }
        }
        calculateBudget();
    };

    // Calculator Event Listeners
    if (gardenSizeSlider) gardenSizeSlider.addEventListener('input', updateSizeFromSlider);
    if (gardenSizeNum) gardenSizeNum.addEventListener('change', updateSizeFromNum);
    
    if (cbMow) cbMow.addEventListener('change', () => toggleServiceCheckbox(cbMow, labelMow));
    if (cbBrush) cbBrush.addEventListener('change', () => toggleServiceCheckbox(cbBrush, labelBrush));
    if (cbCollect) cbCollect.addEventListener('change', () => toggleServiceCheckbox(cbCollect, labelCollect));
    if (calcProfilingOpt) calcProfilingOpt.addEventListener('change', calculateBudget);

    // Initialize budget calculation
    calculateBudget();

    // ==========================================================================
    // 4. INTEGRATE BUDGET WITH CONTACT FORM
    // ==========================================================================
    btnApplyBudget.addEventListener('click', () => {
        const size = gardenSizeSlider.value;
        const price = currentCalculatedPrice;
        
        // Form elements
        const formSize = document.getElementById('form-size');
        const formServices = document.getElementById('form-services');
        const formMessage = document.getElementById('form-message');
        
        // Set Size
        formSize.value = size;
        
        // Determine selected services text list
        let servicesText = [];
        if (cbMow && cbMow.checked) servicesText.push("Corte de césped con cortacésped");
        if (cbBrush && cbBrush.checked) servicesText.push("Desbrozado de terreno");
        
        const profilingVal = calcProfilingOpt.value;
        if (profilingVal === 'basic') {
            servicesText.push("Perfilado básico");
        } else if (profilingVal === 'intermediate') {
            servicesText.push("Perfilado intermedio");
        } else if (profilingVal === 'intensive') {
            servicesText.push("Perfilado intensivo (Personalizado)");
        }
        
        if (cbCollect && cbCollect.checked) servicesText.push("Recogida y limpieza de restos");
        
        // Determine formServices value based on selected combo:
        const hasMow = cbMow && cbMow.checked;
        const hasBrush = cbBrush && cbBrush.checked;
        const hasCollect = cbCollect && cbCollect.checked;
        const hasProfile = profilingVal !== 'none';
        
        if (hasMow && hasBrush && hasProfile && hasCollect) {
            formServices.value = 'todos';
        } else if (hasMow && hasBrush && hasCollect) {
            formServices.value = 'corte-desbroce-recogida';
        } else if (hasMow && hasProfile && hasCollect) {
            formServices.value = 'corte-perfilado-recogida';
        } else if (hasMow && hasBrush) {
            formServices.value = 'corte-desbroce';
        } else if (hasMow && hasProfile) {
            formServices.value = 'corte-perfilado';
        } else if (hasMow && hasCollect) {
            formServices.value = 'corte-recogida';
        } else if (hasBrush && hasCollect) {
            formServices.value = 'desbroce-recogida';
        } else if (hasProfile && hasCollect) {
            formServices.value = 'perfilado-recogida';
        } else if (hasProfile) {
            formServices.value = 'perfilado-indep';
        } else if (hasMow) {
            formServices.value = 'solo-corte';
        } else if (hasBrush) {
            formServices.value = 'solo-desbroce';
        } else {
            formServices.value = 'todos';
        }
        
        const priceText = profilingVal === 'intensive' ? "a consultar (intensivo)" : `${price} € (IVA incluido)`;
        const discountText = (size > 500 && (hasMow || hasBrush)) ? "\n(Incluye tarifa base de desplazamiento de 12 € y 10% de descuento por volumen por >500 m²)" : "\n(Incluye tarifa base de desplazamiento de 12 €)";
        
        formMessage.value = `Hola, he calculado un presupuesto estimado de aproximadamente ${priceText} para mi jardín de ${size} m².${discountText}\n\nServicios seleccionados:\n- ${servicesText.join('\n- ')}\n\nMe gustaría concertar una cita para confirmar el presupuesto y los detalles del terreno.`;
        
        // Scroll to form
        const contactSection = document.getElementById('contacto');
        contactSection.scrollIntoView({ behavior: 'smooth' });
        
        // Subtle focus animation on name field
        setTimeout(() => {
            document.getElementById('form-name').focus();
        }, 800);
    });

    // ==========================================================================
    // 5. SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER)
    // ==========================================================================
    const revealElements = document.querySelectorAll('.scroll-reveal');
    
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target); // Run animation once
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        });
        
        revealElements.forEach(element => {
            revealObserver.observe(element);
        });
    } else {
        // Fallback for older browsers
        revealElements.forEach(element => {
            element.classList.add('revealed');
        });
    }

    // ==========================================================================
    // 6. CONTACT FORM SUBMISSION
    // ==========================================================================
    const contactForm = document.getElementById('contact-form');
    const formSuccess = document.getElementById('form-success');
    const btnResetForm = document.getElementById('btn-reset-form');
    const submitBtn = document.getElementById('form-submit-btn');

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Basic loading animation
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';
        submitBtn.style.opacity = '0.7';
        
        // Prepare FormData for FormSubmit API (supports files/attachments)
        const formData = new FormData();
        formData.append('Nombre', document.getElementById('form-name').value);
        formData.append('Teléfono', document.getElementById('form-phone').value || 'No proporcionado');
        formData.append('Email', document.getElementById('form-email').value);
        formData.append('Tamaño del Jardín (m2)', document.getElementById('form-size').value);
        formData.append('Servicios Seleccionados', document.getElementById('form-services').value);
        formData.append('Detalles Adicionales', document.getElementById('form-message').value || 'Sin comentarios');
        
        // Add files
        const photosInput = document.getElementById('form-photos');
        if (photosInput && photosInput.files.length > 0) {
            for (let i = 0; i < photosInput.files.length; i++) {
                formData.append('Foto_' + (i + 1), photosInput.files[i]);
            }
        }
        
        // Disable spam detection page (optional, but good for AJAX)
        formData.append('_captcha', 'false');
        
        // Send using FormSubmit AJAX endpoint
        fetch('https://formsubmit.co/ajax/info.ruizjardineria@gmail.com', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Network response was not ok.');
        })
        .then(data => {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
            submitBtn.style.opacity = '1';
            
            // Show success message
            formSuccess.classList.add('active');
            formSuccess.setAttribute('aria-hidden', 'false');
            
            // Clean up fields
            document.getElementById('form-name').value = '';
            document.getElementById('form-phone').value = '';
            document.getElementById('form-email').value = '';
            document.getElementById('form-size').value = '';
            document.getElementById('form-services').value = '';
            
            // Clean up files
            if (photosInput) photosInput.value = '';
            const previewGrid = document.getElementById('file-list-preview');
            if (previewGrid) previewGrid.innerHTML = '';
        })
        .catch(error => {
            console.error('Error submitting form:', error);
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
            submitBtn.style.opacity = '1';
            alert('Ha ocurrido un error al enviar el formulario. Por favor, inténtelo de nuevo o contáctenos por teléfono.');
        });
    });

    btnResetForm.addEventListener('click', () => {
        formSuccess.classList.remove('active');
        formSuccess.setAttribute('aria-hidden', 'true');
        
        // Clean up fields on reset
        document.getElementById('form-name').value = '';
        document.getElementById('form-phone').value = '';
        document.getElementById('form-email').value = '';
        document.getElementById('form-size').value = '';
        document.getElementById('form-services').value = '';
        
        // Clean up files on reset
        const photosInput = document.getElementById('form-photos');
        const previewGrid = document.getElementById('file-list-preview');
        if (photosInput) photosInput.value = '';
        if (previewGrid) previewGrid.innerHTML = '';
    });

    // ==========================================================================
    // 7. FILE UPLOAD PREVIEW
    // ==========================================================================
    const fileInput = document.getElementById('form-photos');
    const fileListPreview = document.getElementById('file-list-preview');
    
    if (fileInput && fileListPreview) {
        fileInput.addEventListener('change', () => {
            fileListPreview.innerHTML = '';
            const files = fileInput.files;
            if (files.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    const fileItem = document.createElement('div');
                    fileItem.classList.add('file-preview-item');
                    
                    // Simple attachment icon
                    fileItem.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="14" height="14" style="color: var(--color-accent); flex-shrink: 0;">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${files[i].name}</span>
                    `;
                    fileListPreview.appendChild(fileItem);
                }
            }
        });
    }
});
