import { eventManager, registerUser } from './events.js';
import { eventApi } from './api.js';

// DOM Elements
const eventContainer = document.querySelector('.event-container');
const categoryFilter = document.getElementById('category');
const searchInput = document.getElementById('searchEvents');

// Loading state management
let isLoading = false;

// Show loading spinner
const showLoading = () => {
    isLoading = true;
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    spinner.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    eventContainer.innerHTML = '';
    eventContainer.appendChild(spinner);
};

// Hide loading spinner
const hideLoading = () => {
    isLoading = false;
    const spinner = document.querySelector('.loading-spinner');
    if (spinner) {
        spinner.remove();
    }
};

// Create event card with destructuring
const createEventCard = ({ id, name, date, location, category, availableSeats, description, type }) => {
    const card = document.createElement('div');
    card.className = 'card event-card';
    card.dataset.eventId = id;

    const formattedDate = new Date(date).toLocaleDateString();
    const isAvailable = availableSeats > 0;

    card.innerHTML = `
        <div class="card-header">
            <h3>${name}</h3>
            <span class="category-badge">${category}</span>
        </div>
        <div class="card-body">
            <p class="event-description">${description}</p>
            <div class="event-details">
                <p><i class="fas fa-calendar"></i> ${formattedDate}</p>
                <p><i class="fas fa-map-marker-alt"></i> ${location}</p>
                <p><i class="fas fa-chair"></i> ${availableSeats} seats available</p>
            </div>
        </div>
        <div class="card-footer">
            <button class="btn btn-primary register-btn" ${!isAvailable ? 'disabled' : ''}>
                Register Now
            </button>
            <button class="btn btn-secondary details-btn">
                View Details
            </button>
        </div>
    `;

    // Add event listeners with debouncing
    const registerBtn = card.querySelector('.register-btn');
    registerBtn.onclick = debounce(() => handleRegistration(id), 300);

    const detailsBtn = card.querySelector('.details-btn');
    detailsBtn.onclick = () => showEventDetails({ id, ...card.dataset });

    // Add keyboard navigation
    card.tabIndex = 0;
    card.onkeydown = (e) => {
        if (e.key === 'Enter') {
            showEventDetails({ id, ...card.dataset });
        }
    };

    return card;
};

// Debounce function using arrow function
const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

// Handle registration with destructuring
const handleRegistration = async (eventId) => {
    const registerBtn = document.querySelector(`[data-event-id="${eventId}"] .register-btn`);
    if (!registerBtn) return;

    try {
        // Show loading state
        const originalText = registerBtn.textContent;
        registerBtn.disabled = true;
        registerBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';

        const { firstName, lastName, email } = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value
        };

        const userData = { name: `${firstName} ${lastName}`, email };
        const { success, message } = await eventApi.registerForEvent(eventId, userData);

        if (success) {
            showNotification(message, 'success');
            await updateEventDisplay();
        }
    } catch (error) {
        showNotification(error.message, 'error');
    } finally {
        // Reset button state
        registerBtn.disabled = false;
        registerBtn.textContent = originalText;
    }
};

// Show event details with destructuring
const showEventDetails = async ({ id }) => {
    try {
        const event = await eventApi.getEventById(id);
        const { name, date, location, category, availableSeats, description, type } = event;

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-labelledby', 'modalTitle');
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close" role="button" tabindex="0">&times;</span>
                <h2 id="modalTitle">${type} on ${name}</h2>
                <div class="modal-body">
                    <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
                    <p><strong>Location:</strong> ${location}</p>
                    <p><strong>Category:</strong> ${category}</p>
                    <p><strong>Available Seats:</strong> ${availableSeats}</p>
                    <p><strong>Description:</strong> ${description}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary register-btn" ${!availableSeats ? 'disabled' : ''}>
                        Register Now
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Focus trap for accessibility
        const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const [firstFocusable, lastFocusable] = [focusableElements[0], focusableElements[focusableElements.length - 1]];

        // Close modal functionality
        const closeModal = () => {
            modal.remove();
            document.removeEventListener('keydown', handleKeyDown);
        };

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                closeModal();
            } else if (e.key === 'Tab') {
                if (e.shiftKey && document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable.focus();
                } else if (!e.shiftKey && document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
        };

        const closeBtn = modal.querySelector('.close');
        closeBtn.onclick = closeModal;
        modal.onclick = (e) => {
            if (e.target === modal) closeModal();
        };

        document.addEventListener('keydown', handleKeyDown);
        firstFocusable.focus();
    } catch (error) {
        showNotification('Error loading event details: ' + error.message, 'error');
    }
};

// Update event display with debounced search
const debouncedUpdateDisplay = debounce(updateEventDisplay, 300);

// Update event display with async/await
const updateEventDisplay = async () => {
    if (!eventContainer || isLoading) return;

    try {
        showLoading();

        // Get filtered events using destructuring
        const [category, searchTerm] = [
            categoryFilter?.value,
            searchInput?.value
        ];

        let events = await eventApi.getEvents();

        // Apply filters using optional chaining
        if (category) {
            events = await eventApi.filterEventsByCategory(category);
        }

        if (searchTerm) {
            events = await eventApi.searchEvents(searchTerm);
        }

        // Clear and update display
        eventContainer.innerHTML = '';
        
        if (events.length === 0) {
            eventContainer.innerHTML = `
                <div class="no-events">
                    No events found matching your criteria.
                </div>
            `;
            return;
        }

        // Create and append event cards using map
        const eventCards = events.map(event => createEventCard(event));
        eventContainer.append(...eventCards);

    } catch (error) {
        showNotification('Error loading events: ' + error.message, 'error');
        eventContainer.innerHTML = `
            <div class="error-message">
                Failed to load events. Please try again later.
            </div>
        `;
    } finally {
        hideLoading();
    }
};

// Initialize event display with modern features
const initializeEventDisplay = () => {
    // Create search input if it doesn't exist
    if (!searchInput) {
        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        searchContainer.innerHTML = `
            <input type="text" 
                   id="searchEvents" 
                   class="form-control" 
                   placeholder="Search events... (Press '/' to focus)"
                   aria-label="Search events">
        `;
        eventContainer.parentElement.insertBefore(searchContainer, eventContainer);
    }

    // Create category filter if it doesn't exist
    if (!categoryFilter) {
        const filterContainer = document.createElement('div');
        filterContainer.className = 'filter-container';
        filterContainer.innerHTML = `
            <select id="category" class="form-control" aria-label="Filter by category">
                <option value="">All Categories</option>
                <option value="workshop">Workshops</option>
                <option value="festival">Festivals</option>
                <option value="meeting">Meetings</option>
                <option value="music">Music</option>
                <option value="sports">Sports</option>
                <option value="arts">Arts</option>
            </select>
        `;
        eventContainer.parentElement.insertBefore(filterContainer, eventContainer);
    }

    // Add event listeners using modern syntax
    searchInput?.addEventListener('input', debouncedUpdateDisplay);
    searchInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            searchInput.value = '';
            updateEventDisplay();
        }
    });

    categoryFilter?.addEventListener('change', updateEventDisplay);

    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === '/' && !e.target.matches('input, textarea')) {
            e.preventDefault();
            searchInput?.focus();
        }
    });

    // Initial display
    updateEventDisplay();
};

// Export functions
export {
    initializeEventDisplay,
    updateEventDisplay,
    createEventCard
}; 