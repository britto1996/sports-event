export type MatchStatus = 'Upcoming' | 'Live' | 'Finished';

export interface Team {
	name?: string;
	logo?: string;
	/** Present for Live/Finished in our mock data */
	score?: number;
}

export interface MatchEvent {
	id: string;
	title: string;
	competition?: string;
	date: string;
	venue: string;
	status: MatchStatus;
	homeTeam?: Team;
	awayTeam?: Team;

	// Ticketing
	ticketsAvailable?: boolean;
	ticketPriceStart?: number;

	// Live stats (optional)
	minute?: string;
	possession?: { home: number; away: number };
	shots?: { home: number; away: number };

	// Post-match
	highlightsUrl?: string;
}

export interface NewsArticle {
	id: string;
	title: string;
	summary: string;
	image: string;
	date: string;
}

export interface TicketTier {
	type: string;
	price: number;
	benefits: string[];
	available: number;
}

export interface BookedSeat {
	id: string;
	row: string;
	number: string;
	price: number;
	typeLabel: string;
}

export interface Booking {
	id: string;
	eventId: string;
	eventTitle: string;
	eventDate: string;
	venue: string;
	tierType: string;
	seats: BookedSeat[];
	totalPrice: number;
	bookedAt: string;
	status: 'confirmed' | 'cancelled';
	qrCode: string; // Base64 encoded QR code image
	bookingReference: string; // Human-readable reference (e.g., LCM-2026-12345)
}

export interface MockData {
	events: MatchEvent[];
	news: NewsArticle[];
	tickets: TicketTier[];
	aiChat: {
		initialMessages: { id: number; sender: 'bot' | 'user'; text: string }[];
		suggestedPrompts: string[];
	};
}
