import type { MatchEvent } from "@/types/mockData";
import { fetchFixtures } from "@/lib/api/events";

/**
 * Enrich events with fixture data (team names and logos)
 * Matches events with fixtures by fixtureId and replaces Home/Away placeholders
 */
export const enrichEventsWithFixtures = async (
    events: MatchEvent[]
): Promise<MatchEvent[]> => {
    try {
        // Fetch all fixtures
        const fixtures = await fetchFixtures();

        // Create a map of fixture ID -> fixture for quick lookup
        const fixturesMap = new Map<string, MatchEvent>();
        fixtures.forEach((fixture) => {
            if (fixture.id) {
                fixturesMap.set(String(fixture.id), fixture);
            }
        });

        // Enrich each event with fixture data
        return events.map((event) => {
            // Try to get fixtureId from various possible field names
            const fixtureId =
                (event as any).fixtureId ||
                (event as any).fixture_id ||
                (event as any).matchId ||
                (event as any).match_id;

            if (!fixtureId) {
                // No fixture ID, return event as-is
                return event;
            }

            const fixture = fixturesMap.get(String(fixtureId));
            if (!fixture) {
                // Fixture not found, return event as-is
                return event;
            }

            // Check if event has placeholder team names
            const hasPlaceholderHome =
                !event.homeTeam?.name ||
                event.homeTeam?.name === "Home" ||
                event.homeTeam?.name.trim() === "";

            const hasPlaceholderAway =
                !event.awayTeam?.name ||
                event.awayTeam?.name === "Away" ||
                event.awayTeam?.name.trim() === "";

            console.log('Enriching event:', event);
            console.log('Fixture:', fixture);

            // Merge fixture data into event
            return {
                ...event,
                homeTeam: hasPlaceholderHome && fixture.homeTeam ? {
                    ...event.homeTeam,
                    name: fixture.homeTeam.name,
                    logo: fixture.homeTeam.logo || event.homeTeam?.logo,
                } : event.homeTeam,
                awayTeam: hasPlaceholderAway && fixture.awayTeam ? {
                    ...event.awayTeam,
                    name: fixture.awayTeam.name,
                    logo: fixture.awayTeam.logo || event.awayTeam?.logo,
                } : event.awayTeam,
            };
        });
    } catch (error) {
        console.error('[enrichEventsWithFixtures] Error:', error);
        // If fixtures fetch fails, return events as-is
        return events;
    }
};
