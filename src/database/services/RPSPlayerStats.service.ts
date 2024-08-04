// import db from '../';
// TODO [WARNING]: Are we actually supposed to directly import models like this and not through the database instance?
import { RPSPlayerStats } from "@/database/models/RPSPlayerStats.model";


export async function incrementWins(userId: string | bigint): Promise<void> {
    const playerStats = await getUserStats(userId);
    await playerStats.increment('wins');
}

export async function incrementLosses(userId: string | bigint): Promise<void> {
    const playerStats = await getUserStats(userId);
    await playerStats.increment('losses');
}

export async function incrementTies(userId: string | bigint): Promise<void> {
    const playerStats = await getUserStats(userId);
    await playerStats.increment('ties');
}

async function getUserStats(userId: string | bigint): Promise<RPSPlayerStats> {
    userId = typeof userId === 'string' ? BigInt(userId) : userId;

    const playerStats = await RPSPlayerStats.findByPk(userId);
    if (!playerStats) {
        return await RPSPlayerStats.create({ userId, wins: 0, losses: 0, ties: 0 });
    }
    return playerStats;
}
