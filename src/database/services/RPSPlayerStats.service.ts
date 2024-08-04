import db from '../';
// TODO [WARNING]: Are we actually supposed to directly import models like this and not through the database instance?
//  I know JavaScript caches modules so once the models get initialized, their instance should be accessible by
//  importing their files directly, but my Python brain is telling me this shouldn't be done.
import { RPSPlayerStats } from "@/database/models/RPSPlayerStats.model";

/*
Stuff for updating player stats in the database.
 */
type OutcomeType = 'win' | 'loss' | 'tie';
type TotalType = 'wins' | 'losses' | 'ties';
type CurrentStreakType = 'currentWinStreak' | 'currentLossStreak' | 'currentTieStreak';
type LongestStreakType = 'longestWinStreak' | 'longestLossStreak' | 'longestTieStreak';

const outcomeMapping: Record<OutcomeType, { total: TotalType, currentStreak: CurrentStreakType, longestStreak: LongestStreakType }> = {
    win: { total: 'wins', currentStreak: 'currentWinStreak', longestStreak: 'longestWinStreak' },
    loss: { total: 'losses', currentStreak: 'currentLossStreak', longestStreak: 'longestLossStreak' },
    tie: { total: 'ties', currentStreak: 'currentTieStreak', longestStreak: 'longestTieStreak' }
};

export async function addWin(userId: string | bigint): Promise<void> {
    await addOutcome(userId, 'win');
}

export async function addLoss(userId: string | bigint): Promise<void> {
    await addOutcome(userId, 'loss');
}

export async function addTie(userId: string | bigint): Promise<void> {
    await addOutcome(userId, 'tie');
}

async function addOutcome(userId: string | bigint, outcome: OutcomeType): Promise<void> {
    await db.sequelize.transaction(async () => {
        // get the player's current stats
        const playerStats = await getPlayerStats(userId);

        // create an object to store the updates that will be made to the player's stats
        const updates: Partial<RPSPlayerStats> = {};
        // get the outcome-specific model attributes (e.g. wins, currentWinStreak, longestWinStreak)
        const { total, currentStreak, longestStreak } = outcomeMapping[outcome];

        // increment the count of the specific outcome (wins, losses or ties)
        updates[total] = playerStats[total] + 1;
        // increment the current streak
        updates[currentStreak] = playerStats[currentStreak] + 1;

        resetOtherCurrentStreaks(playerStats, updates, outcome);

        // update the longest streak if necessary
        if (updates[currentStreak]! > playerStats[longestStreak]) {
            updates[longestStreak] = updates[currentStreak];
        }

        await playerStats.update(updates);
    });
}

function resetOtherCurrentStreaks(playerStats: RPSPlayerStats, updates: Partial<RPSPlayerStats>, keepStreak: OutcomeType): void {
    if (keepStreak !== 'win' && playerStats.currentWinStreak !== 0) {
        updates.currentWinStreak = 0;
    }
    if (keepStreak !== 'loss' && playerStats.currentLossStreak !== 0) {
        updates.currentLossStreak = 0;
    }
    if (keepStreak !== 'tie' && playerStats.currentTieStreak !== 0) {
        updates.currentTieStreak = 0;
    }
}

/*
Stuff for getting player stats from the database.
 */
export async function getPlayerStats(userId: string | bigint): Promise<RPSPlayerStats> {
    userId = typeof userId === 'string' ? BigInt(userId) : userId;

    const playerStats = await RPSPlayerStats.findByPk(userId);
    if (!playerStats) {
        return await RPSPlayerStats.create({ userId });
    }
    return playerStats;
}
