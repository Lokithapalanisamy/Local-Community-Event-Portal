// Form validation and handling
import { eventApi } from './api.js';

// Form validation rules
const validationRules = {
    firstName: {
        required: true,
        minLength: 2,
        pattern: /^[A-Za-z\s-']+$/
    },
    lastName: {
        required: true,
        minLength: 2,
        pattern: /^[A-Za-z\s-']+$/
    },
    email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    phone: {
        required: true,
        pattern: /^\+?[\d\s-]{10,}$/
    }
};

// Error messages
const errorMessages = {
    required: 'This field is required',
    minLength: 'Must be at least {min} characters',
    pattern: 'Please enter a valid {field}',
    email: 'Please enter a valid email address',
    phone: 'Please enter a valid phone number'
};

// Form handler class
class FormHandler {
    constructor(formId) {
        this.form = document.getElementById(formId);
        this.errors = new Map();
        this.setupForm();
    }

    setupForm() {
        // Add form submit handler
        this.form.addEventListener('submit', this.handleSubmit.bind(this));

        // Add input validation on blur
        this.form.querySelectorAll('input').forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
        });

        // Add real-time validation on input
        this.form.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => this.validateField(input));
        });
    }

    validateField(input) {
        const { name, value } = input;
        const rules = validationRules[name];
        
        if (!rules) return true;

        let isValid = true;
        let errorMessage = '';

        // Check required
        if (rules.required && !value.trim()) {
            isValid = false;
            errorMessage = errorMessages.required;
        }
        // Check min length
        else if (rules.minLength && value.length < rules.minLength) {
            isValid = false;
            errorMessage = errorMessages.minLength.replace('{min}', rules.minLength);
        }
        // Check pattern
        else if (rules.pattern && !rules.pattern.test(value)) {
            isValid = false;
            errorMessage = errorMessages[name] || errorMessages.pattern.replace('{field}', name);
        }

        this.updateFieldError(input, isValid, errorMessage);
        return isValid;
    }

    updateFieldError(input, isValid, message) {
        const errorElement = this.getOrCreateErrorElement(input);
        
        if (!isValid) {
            this.errors.set(input.name, message);
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            input.classList.add('error');
        } else {
            this.errors.delete(input.name);
            errorElement.style.display = 'none';
            input.classList.remove('error');
        }
    }

    getOrCreateErrorElement(input) {
        let errorElement = input.parentElement.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            input.parentElement.appendChild(errorElement);
        }
        return errorElement;
    }

    async handleSubmit(event) {
        event.preventDefault();
        console.log('Form submission started');

        // Validate all fields
        const inputs = this.form.querySelectorAll('input');
        let isValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        if (!isValid) {
            console.log('Form validation failed:', this.errors);
            return;
        }

        // Get form data
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData.entries());
        
        console.log('Form data:', data);

        try {
            // Show loading state
            this.setLoadingState(true);

            // Simulate API call
            const response = await this.submitFormData(data);
            console.log('API Response:', response);

            if (response.success) {
                this.showSuccessMessage();
                this.form.reset();
            } else {
                this.showErrorMessage(response.message);
            }
        } catch (error) {
            console.error('Form submission error:', error);
            this.showErrorMessage('An error occurred. Please try again.');
        } finally {
            this.setLoadingState(false);
        }
    }

    async submitFormData(data) {
        // Simulate API call with timeout
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate successful submission
                resolve({
                    success: true,
                    message: 'Registration successful!'
                });
            }, 1500);
        });
    }

    setLoadingState(isLoading) {
        const submitButton = this.form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;

        if (isLoading) {
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        } else {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    }

    showSuccessMessage() {
        const message = document.createElement('div');
        message.className = 'success-message';
        message.textContent = 'Registration successful!';
        this.form.insertAdjacentElement('beforebegin', message);
        
        // Remove message after 3 seconds
        setTimeout(() => message.remove(), 3000);
    }

    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        this.form.insertAdjacentElement('beforebegin', errorDiv);
        
        // Remove message after 3 seconds
        setTimeout(() => errorDiv.remove(), 3000);
    }
}

// Initialize form handler when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const formHandler = new FormHandler('eventRegistrationForm');
    
    // Add jQuery-like functionality
    window.$ = (selector) => document.querySelector(selector);
    window.$$ = (selector) => document.querySelectorAll(selector);

    // Add fade effects
    Element.prototype.fadeIn = function(duration = 300) {
        this.style.opacity = 0;
        this.style.display = 'block';
        let start = null;
        
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            this.style.opacity = Math.min(progress / duration, 1);
            
            if (progress < duration) {
                window.requestAnimationFrame(animate);
            }
        };
        
        window.requestAnimationFrame(animate);
    };

    Element.prototype.fadeOut = function(duration = 300) {
        let start = null;
        
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            this.style.opacity = 1 - Math.min(progress / duration, 1);
            
            if (progress < duration) {
                window.requestAnimationFrame(animate);
            } else {
                this.style.display = 'none';
            }
        };
        
        window.requestAnimationFrame(animate);
    };

    // Example of jQuery-like usage
    $('#registerBtn')?.addEventListener('click', () => {
        console.log('Register button clicked');
    });

    // Example of fade effects
    const eventCards = $$('.event-card');
    eventCards.forEach(card => {
        card.style.opacity = 0;
        setTimeout(() => card.fadeIn(), 100);
    });
});

// Export for testing
export { FormHandler, validationRules, errorMessages }; 