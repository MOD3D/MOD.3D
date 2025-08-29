document.addEventListener('DOMContentLoaded', function() {
    let currentStep = 1;
    const totalSteps = 3;
    
    const form = document.getElementById('quotationForm');
    const serviceRadios = document.querySelectorAll('input[name="service"]');
    const nextStep1 = document.getElementById('nextStep1');
    const nextStep2 = document.getElementById('nextStep2');
    const backStep1 = document.getElementById('backStep1');
    const backStep2 = document.getElementById('backStep2');
    const submitForm = document.getElementById('submitForm');

    const urlParams = new URLSearchParams(window.location.search);
    const preselectedService = urlParams.get('service');

    updateProgressIndicator();
    setupEventListeners();
    setupFileUpload();

    function setupEventListeners() {
        serviceRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                nextStep1.disabled = false;
                showServiceForm(this.value);
            });
        });

        nextStep1.addEventListener('click', () => goToStep(2));
        nextStep2.addEventListener('click', () => goToStep(3));
        backStep1.addEventListener('click', () => goToStep(1));
        backStep2.addEventListener('click', () => goToStep(2));

        form.addEventListener('submit', handleFormSubmit);
        setupRealTimeValidation();
    }


    function showServiceForm(service) {
        document.querySelectorAll('.form-section').forEach(section => {
            section.classList.remove('active');
        });

        const targetForm = document.getElementById(service + '-form');
        if (targetForm) {
            targetForm.classList.add('active');
        }
    }

    function goToStep(step) {
        if (step < 1 || step > totalSteps) return;
        
        if (step > currentStep && !validateCurrentStep()) {
            return;
        }

        document.getElementById(`step-${currentStep}`).classList.remove('active');
        document.getElementById(`step-${step}`).classList.add('active');
        
        currentStep = step;
        
        updateProgressIndicator();

        if (step === 3) {
            showEstimatedCost();
        }

        document.querySelector('.form-container').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }


    function updateProgressIndicator() {
        for (let i = 1; i <= totalSteps; i++) {
            const step = document.getElementById(`step${i}`);
            const line = document.getElementById(`line${i}`);
            
            if (i < currentStep) {
                step.classList.add('completed');
                step.classList.remove('active');
                if (line) line.classList.add('active');
            } else if (i === currentStep) {
                step.classList.add('active');
                step.classList.remove('completed');
            } else {
                step.classList.remove('active', 'completed');
                if (line) line.classList.remove('active');
            }
        }
    }

    
    function validateCurrentStep() {
        switch (currentStep) {
            case 1:
                const selectedService = document.querySelector('input[name="service"]:checked');
                if (!selectedService) {
                    alert('Por favor, selecciona un servicio.');
                    return false;
                }
                return true;
            
            case 2:
                return validateServiceForm();
            
            case 3:
                return validateContactForm();
            
            default:
                return true;
        }
    }

    
    function validateServiceForm() {
        const selectedService = document.querySelector('input[name="service"]:checked').value;
        
        switch (selectedService) {
            case 'impresion3d':
                const servicios3d = document.querySelectorAll('input[name="impresion_servicios[]"]:checked');
                if (servicios3d.length === 0) {
                    alert('Por favor, selecciona al menos un servicio de impresión 3D.');
                    return false;
                }
                break;
            
            case 'automatizacion':
                const serviciosAuto = document.querySelectorAll('input[name="auto_servicios[]"]:checked');
                if (serviciosAuto.length === 0) {
                    alert('Por favor, selecciona al menos un tipo de proyecto de automatización.');
                    return false;
                }
                break;
            
            case 'desarrolloweb':
                const serviciosWeb = document.querySelectorAll('input[name="web_servicios[]"]:checked');
                if (serviciosWeb.length === 0) {
                    alert('Por favor, selecciona al menos un tipo de sitio web.');
                    return false;
                }
                break;
        }
        
        return true;
    }

    
    function validateContactForm() {
        const nombre = document.getElementById('nombre').value.trim();
        const email = document.getElementById('email').value.trim();
        const descripcion = document.getElementById('descripcion').value.trim();

        if (!nombre) {
            alert('Por favor, ingresa tu nombre completo.');
            document.getElementById('nombre').focus();
            return false;
        }

        if (!email) {
            alert('Por favor, ingresa tu correo electrónico.');
            document.getElementById('email').focus();
            return false;
        }

        if (!isValidEmail(email)) {
            alert('Por favor, ingresa un correo electrónico válido.');
            document.getElementById('email').focus();
            return false;
        }

        if (!descripcion) {
            alert('Por favor, describe tu proyecto.');
            document.getElementById('descripcion').focus();
            return false;
        }

        return true;
    }

    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    
    function setupRealTimeValidation() {
        const emailInput = document.getElementById('email');
        emailInput.addEventListener('blur', function() {
            if (this.value && !isValidEmail(this.value)) {
                this.classList.add('is-invalid');
            } else {
                this.classList.remove('is-invalid');
            }
        });

        const requiredFields = ['nombre', 'email', 'descripcion'];
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('blur', function() {
                    if (this.hasAttribute('required') && !this.value.trim()) {
                        this.classList.add('is-invalid');
                    } else {
                        this.classList.remove('is-invalid');
                    }
                });
            }
        });
    }

    
    function showEstimatedCost() {
        const estimatedCost = document.getElementById('estimatedCost');
        estimatedCost.classList.add('show');
        
        const cost = calculateEstimatedCost();
        document.getElementById('costAmount').textContent = cost;
    }


    function calculateEstimatedCost() {
        const selectedService = document.querySelector('input[name="service"]:checked');
        if (!selectedService) return 'Cotización personalizada';

        const basePrices = {
            'impresion3d': 'Desde $50,000 COP',
            'automatizacion': 'Desde $200,000 COP',
            'desarrolloweb': 'Desde $300,000 COP'
        };

        return basePrices[selectedService.value] || 'Cotización personalizada';
    }


    function setupFileUpload() {
        const uploadAreas = document.querySelectorAll('.file-upload-area');
        
        uploadAreas.forEach(area => {
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                area.addEventListener(eventName, preventDefaults, false);
            });

            ['dragenter', 'dragover'].forEach(eventName => {
                area.addEventListener(eventName, () => area.classList.add('dragover'), false);
            });

            ['dragleave', 'drop'].forEach(eventName => {
                area.addEventListener(eventName, () => area.classList.remove('dragover'), false);
            });

            area.addEventListener('drop', handleDrop, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            const input = e.target.closest('.form-group').querySelector('input[type="file"]');
            
            if (input && files.length > 0) {
                input.files = files;
                updateFileDisplay(input, files);
            }
        }

        document.querySelectorAll('input[type="file"]').forEach(input => {
            input.addEventListener('change', function(e) {
                updateFileDisplay(this, this.files);
            });
        });

        function updateFileDisplay(input, files) {
            const uploadArea = input.closest('.form-group').querySelector('.file-upload-area');
            const fileList = Array.from(files).map(file => file.name).join(', ');
            
            if (files.length > 0) {
                uploadArea.innerHTML = `
                    <i class="bi bi-check-circle" style="font-size: 2rem; color: var(--success-color);"></i>
                    <p class="mb-0 mt-2"><strong>${files.length} archivo(s) seleccionado(s)</strong></p>
                    <small class="text-muted">${fileList}</small>
                `;
            }
        }
    }

    
    function handleFormSubmit(e) {
        e.preventDefault();
        
        if (!validateCurrentStep()) {
            return;
        }

        submitForm.disabled = true;
        submitForm.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Enviando...';

        const formData = new FormData(form);
        
        setTimeout(() => {
            showSuccessMessage();
        }, 2000);
    }


    function showSuccessMessage() {
        const container = document.querySelector('.form-container');
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-check-circle" style="font-size: 4rem; color: var(--success-color);"></i>
                <h3 class="mt-3 mb-3">¡Cotización Enviada!</h3>
                <p class="mb-4">
                    Gracias por confiar en <strong>Mod3D</strong>. Hemos recibido tu solicitud de cotización 
                    y nos pondremos en contacto contigo en las próximas <strong>24 horas</strong> con una 
                    propuesta detallada.
                </p>
                <div class="row justify-content-center">
                    <div class="col-md-8">
                        <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 10px; margin: 2rem 0;">
                            <h5>¿Qué sigue?</h5>
                            <ul class="list-unstyled mt-3">
                                <li class="mb-2"><i class="bi bi-check text-success me-2"></i> Revisaremos tu proyecto en detalle</li>
                                <li class="mb-2"><i class="bi bi-check text-success me-2"></i> Prepararemos una cotización personalizada</li>
                                <li class="mb-2"><i class="bi bi-check text-success me-2"></i> Te contactaremos para aclarar dudas</li>
                                <li class="mb-0"><i class="bi bi-check text-success me-2"></i> Te enviaremos la propuesta formal</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="mt-4">
                    <a href="mailto:info@mod3d.com" class="btn btn-outline-primary me-3">
                        <i class="bi bi-envelope me-2"></i> info@mod3d.com
                    </a>
                    <a href="https://wa.me/573001234567" class="btn btn-success">
                        <i class="bi bi-whatsapp me-2"></i> WhatsApp
                    </a>
                </div>
            </div>
        `;
    }

    
    const formSteps = document.querySelectorAll('.form-step');
    formSteps.forEach((step, index) => {
        if (index === 0) {
            step.classList.add('active');
        } else {
            step.style.display = 'none';
        }
    });

    
    window.showStep = function(stepNumber) {
        formSteps.forEach((step, index) => {
            if (index === stepNumber - 1) {
                step.style.display = 'block';
                step.classList.add('active');
            } else {
                step.style.display = 'none';
                step.classList.remove('active');
            }
        });
    };

    
    // const originalGoToStep = goToStep;
    // goToStep = function(step) {
    //     if (step < 1 || step > totalSteps) return;
        
    //     if (step > currentStep && !validateCurrentStep()) {
    //         return;
    //     }

    //     currentStep = step;
    //     showStep(step);
    //     updateProgressIndicator();

    //     if (step === 3) {
    //         showEstimatedCost();
    //     }

    //     document.querySelector('.form-container').scrollIntoView({ 
    //         behavior: 'smooth', 
    //         block: 'start' 
    //     });
    // };

    const originalGoToStep = goToStep;
    goToStep = function(step) {
        if (step < 1 || step > totalSteps) return;
        
        if (step > currentStep && !validateCurrentStep()) {
            return;
        }

        currentStep = step;
        showStep(step);
        updateProgressIndicator();

        if (step === 3) {
            showEstimatedCost();
        }

        document.querySelector('.form-container').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    };

    if (preselectedService === 'desarrolloweb') {
        const webServiceRadio = document.getElementById('desarrolloweb');
        if (webServiceRadio) {
            webServiceRadio.checked = true;
        }

        showServiceForm('desarrolloweb');
        goToStep(2);
    }

});