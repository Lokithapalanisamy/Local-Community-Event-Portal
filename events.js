// Event class definition
class Event {
    constructor(id, name, date, location, totalSeats, category, type, description) {
        this.id = id;
        this.name = name;
        this.date = date;
        this.location = location;
        this.totalSeats = totalSeats;
        this.availableSeats = totalSeats;
        this.registeredAttendees = 0;
        this.category = category;
        this.type = type;
        this.description = description;
    }

    // Instance methods
    checkAvailability() {
        const today = new Date();
        const eventDate = new Date(this.date);
        return eventDate > today && this.availableSeats > 0;
    }

    registerAttendee() {
        if (this.checkAvailability()) {
            this.availableSeats--;
            this.registeredAttendees++;
            return true;
        }
        return false;
    }

    cancelRegistration() {
        if (this.registeredAttendees > 0) {
            this.availableSeats++;
            this.registeredAttendees--;
            return true;
        }
        return false;
    }

    getEventInfo() {
        return {
            id: this.id,
            name: this.name,
            date: this.date,
            location: this.location,
            availableSeats: this.availableSeats,
            registeredAttendees: this.registeredAttendees,
            category: this.category,
            type: this.type,
            description: this.description,
            isAvailable: this.checkAvailability()
        };
    }

    // Format event for display
    formatDisplayCard() {
        const info = this.getEventInfo();
        return {
            title: `${info.type} on ${info.name}`,
            date: new Date(info.date).toLocaleDateString(),
            location: info.location,
            seats: `${info.availableSeats} seats available`,
            category: info.category,
            description: info.description
        };
    }

    // Static methods
    static fromObject(obj) {
        return new Event(
            obj.id,
            obj.name,
            obj.date,
            obj.location,
            obj.totalSeats,
            obj.category,
            obj.type,
            obj.description
        );
    }
}

// Event categories and their registration trackers using closure
const createCategoryTracker = (categoryName) => {
    let totalRegistrations = 0;
    return {
        increment: () => ++totalRegistrations,
        decrement: () => --totalRegistrations,
        getTotal: () => totalRegistrations,
        getCategory: () => categoryName
    };
};

// Category trackers
const categoryTrackers = {
    workshop: createCategoryTracker('Workshop'),
    festival: createCategoryTracker('Festival'),
    meeting: createCategoryTracker('Meeting'),
    music: createCategoryTracker('Music'),
    sports: createCategoryTracker('Sports'),
    arts: createCategoryTracker('Arts')
};

// Event list with validation
const events = [
    new Event(1, "Community Workshop", "2024-03-25", "City Community Center", 50, "workshop", "Workshop", "Learn new skills in our community workshop"),
    new Event(2, "City Festival", "2024-06-15", "Central Park", 200, "festival", "Festival", "Annual city celebration with food and entertainment"),
    new Event(3, "Town Hall Meeting", "2024-04-10", "City Hall", 100, "meeting", "Meeting", "Community discussion on local issues"),
    new Event(4, "Summer Concert", "2024-07-20", "City Amphitheater", 150, "music", "Concert", "Live music performance by local artists"),
    new Event(5, "Jazz Night", "2024-05-05", "Downtown Club", 80, "music", "Concert", "Evening of jazz music and refreshments")
];

// Array operations for event management
const eventManager = {
    // Add new event
    addEvent(eventData) {
        try {
            const newEvent = new Event(
                events.length + 1,
                eventData.name,
                eventData.date,
                eventData.location,
                eventData.totalSeats,
                eventData.category,
                eventData.type,
                eventData.description
            );
            events.push(newEvent);
            return newEvent;
        } catch (error) {
            console.error("Error adding event:", error);
            throw error;
        }
    },

    // Remove event
    removeEvent(eventId) {
        const index = events.findIndex(event => event.id === eventId);
        if (index !== -1) {
            return events.splice(index, 1)[0];
        }
        return null;
    },

    // Update event
    updateEvent(eventId, updates) {
        const event = events.find(event => event.id === eventId);
        if (event) {
            Object.assign(event, updates);
            return event;
        }
        return null;
    },

    // Get events by type
    getEventsByType(type) {
        return events.filter(event => event.type === type);
    },

    // Get events by category
    getEventsByCategory(category) {
        return events.filter(event => event.category === category);
    },

    // Get music events
    getMusicEvents() {
        return events.filter(event => event.category === 'music');
    },

    // Get upcoming events
    getUpcomingEvents() {
        const today = new Date();
        return events.filter(event => new Date(event.date) > today);
    },

    // Format all events for display
    formatAllEvents() {
        return events.map(event => event.formatDisplayCard());
    },

    // Get event statistics
    getEventStats() {
        return {
            totalEvents: events.length,
            byCategory: events.reduce((acc, event) => {
                acc[event.category] = (acc[event.category] || 0) + 1;
                return acc;
            }, {}),
            byType: events.reduce((acc, event) => {
                acc[event.type] = (acc[event.type] || 0) + 1;
                return acc;
            }, {}),
            totalRegistrations: events.reduce((acc, event) => acc + event.registeredAttendees, 0)
        };
    }
};

// Higher-order function for filtering events
const filterEvents = (predicate) => {
    return events.filter(predicate);
};

// Event filtering functions
const filterEventsByCategory = (category) => {
    return eventManager.getEventsByCategory(category);
};

const filterEventsByDate = (startDate, endDate) => {
    return filterEvents(event => {
        const eventDate = new Date(event.date);
        return eventDate >= startDate && eventDate <= endDate;
    });
};

const filterEventsByLocation = (location) => {
    return filterEvents(event => 
        event.location.toLowerCase().includes(location.toLowerCase())
    );
};

// Function to get valid events
function getValidEvents() {
    return filterEvents(event => event.checkAvailability());
}

// Register user for an event
function registerUser(eventId, userData) {
    try {
        const event = events.find(e => e.id === eventId);
        
        if (!event) {
            throw new Error("Event not found");
        }

        if (!event.checkAvailability()) {
            throw new Error("Event is either past or full");
        }

        // Validate user data
        if (!userData.email || !userData.name) {
            throw new Error("User email and name are required");
        }

        // Register user
        if (event.registerAttendee()) {
            categoryTrackers[event.category].increment();
            return {
                success: true,
                event: event.getEventInfo(),
                user: userData,
                registrationDate: new Date()
            };
        } else {
            throw new Error("Registration failed");
        }
    } catch (error) {
        console.error("Registration error:", error.message);
        throw error;
    }
}

// Function to display event information using template literals
function displayEventInfo() {
    try {
        const validEvents = getValidEvents();
        if (validEvents.length === 0) {
            throw new Error("No upcoming events available");
        }

        const eventInfo = validEvents.map(event => {
            const info = event.getEventInfo();
            return `
                Event: ${info.type} on ${info.name}
                Date: ${new Date(info.date).toLocaleDateString()}
                Location: ${info.location}
                Category: ${info.category}
                Available Seats: ${info.availableSeats}
                Registered Attendees: ${info.registeredAttendees}
                Total Category Registrations: ${categoryTrackers[info.category].getTotal()}
                Description: ${info.description}
            `;
        }).join('\n\n');

        console.log(eventInfo);
        return eventInfo;
    } catch (error) {
        console.error("Error displaying event info:", error.message);
        return "No events available at this time.";
    }
}

// Function to populate event select dropdown
function populateEventSelect() {
    try {
        const select = document.getElementById('event');
        if (!select) {
            throw new Error("Event select element not found");
        }

        // Clear existing options
        select.innerHTML = '<option value="">Choose an event...</option>';

        // Add valid events
        getValidEvents().forEach(event => {
            const info = event.getEventInfo();
            const option = document.createElement('option');
            option.value = info.id;
            option.textContent = `${info.type} on ${info.name} - ${new Date(info.date).toLocaleDateString()} (${info.availableSeats} seats available)`;
            select.appendChild(option);
        });

        if (select.options.length <= 1) {
            throw new Error("No upcoming events available");
        }
    } catch (error) {
        console.error("Error populating events:", error.message);
        showNotification("No upcoming events available", "error");
    }
}

// Export functions for use in other files
export {
    Event,
    eventManager,
    displayEventInfo,
    registerUser,
    filterEventsByCategory,
    filterEventsByDate,
    filterEventsByLocation,
    populateEventSelect,
    getValidEvents,
    categoryTrackers
}; 