// Mock API service for events
const MOCK_EVENTS = [
    {
        id: 1,
        name: "Community Workshop",
        date: "2024-03-25",
        location: "Community Center",
        category: "workshop",
        availableSeats: 20,
        description: "Learn new skills in our community workshop.",
        type: "Workshop"
    },
    {
        id: 2,
        name: "City Festival",
        date: "2024-06-15",
        location: "City Park",
        category: "festival",
        availableSeats: 100,
        description: "Annual city festival with food and entertainment.",
        type: "Festival"
    },
    {
        id: 3,
        name: "Town Hall Meeting",
        date: "2024-04-10",
        location: "City Hall",
        category: "meeting",
        availableSeats: 50,
        description: "Monthly town hall meeting for community updates.",
        type: "Meeting"
    }
];

// Simulate API delay with default parameter
const delay = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to find event by ID
const findEventById = (id) => MOCK_EVENTS.find(event => event.id === id);

// Helper function to validate event
const validateEvent = (event) => {
    if (!event) throw new Error('Event not found');
    if (event.availableSeats <= 0) throw new Error('No seats available');
    return true;
};

// Mock API service using modern JavaScript features
export const eventApi = {
    // Fetch all events with optional delay
    getEvents: async (customDelay = 1000) => {
        await delay(customDelay);
        return [...MOCK_EVENTS]; // Create a new array using spread operator
    },

    // Fetch event by ID with destructuring
    getEventById: async (id) => {
        await delay(500);
        const event = findEventById(id);
        validateEvent(event);
        return { ...event }; // Create a new object using spread operator
    },

    // Register for an event with destructuring and default parameters
    registerForEvent: async (eventId, { name, email } = {}) => {
        await delay(1500);
        const event = findEventById(eventId);
        validateEvent(event);

        // Create a new event object with updated seats
        const updatedEvent = {
            ...event,
            availableSeats: event.availableSeats - 1
        };

        // Update the original event
        Object.assign(event, updatedEvent);

        return {
            success: true,
            message: 'Registration successful',
            event: { ...updatedEvent } // Return a new object
        };
    },

    // Search events with destructuring and optional parameters
    searchEvents: async (query = '', fields = ['name', 'description', 'location']) => {
        await delay(800);
        const searchTerm = query.toLowerCase();
        
        return MOCK_EVENTS.filter(event => 
            fields.some(field => 
                event[field].toLowerCase().includes(searchTerm)
            )
        ).map(event => ({ ...event })); // Create new objects for each event
    },

    // Filter events by category with destructuring
    filterEventsByCategory: async (category) => {
        await delay(600);
        return MOCK_EVENTS
            .filter(({ category: eventCategory }) => eventCategory === category)
            .map(event => ({ ...event })); // Create new objects for each event
    },

    // Get event statistics using modern array methods
    getEventStats: async () => {
        await delay(300);
        const stats = MOCK_EVENTS.reduce((acc, { category, availableSeats }) => {
            acc.categories[category] = (acc.categories[category] || 0) + 1;
            acc.totalSeats += availableSeats;
            return acc;
        }, { categories: {}, totalSeats: 0 });

        return {
            ...stats,
            totalEvents: MOCK_EVENTS.length
        };
    }
}; 