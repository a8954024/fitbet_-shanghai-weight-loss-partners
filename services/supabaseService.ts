import { supabase } from '../supabaseClient';
import { GameState, Player, ActivityLog, PayoutMode } from '../types';

// Helper to map DB snake_case to TS camelCase if needed, 
// but for simplicity we will try to keep them aligned or map manually.

export const supabaseService = {
    // --- Game Settings ---

    async getGameSettings() {
        const { data, error } = await supabase
            .from('game_settings')
            .select('*')
            .single();

        if (error) throw error;
        return data;
    },

    async updateGameSettings(settings: Partial<GameState>) {
        // We assume there is only one row with ID 1
        const { error } = await supabase
            .from('game_settings')
            .update({
                is_started: settings.isStarted,
                start_date: settings.startDate,
                end_date: settings.endDate,
                target_percentage: settings.targetPercentage,
                bet_amount: settings.betAmount,
                payout_mode: settings.payoutMode
            })
            .eq('id', 1);

        if (error) throw error;
    },

    // --- Players ---

    async getPlayers(): Promise<Player[]> {
        const { data, error } = await supabase
            .from('players')
            .select('*')
            .order('id', { ascending: true });

        if (error) throw error;

        // Map DB fields to TS interface
        return (data || []).map((p: any) => ({
            id: p.id,
            name: p.name,
            initialWeight: p.initial_weight,
            currentWeight: p.current_weight,
            targetWeight: p.target_weight,
            weightHistory: p.weight_history || [],
            cheers: p.cheers,
            lastUpdateDate: p.last_update_date,
            avatarSeed: p.avatar_seed,
            joinDate: p.join_date,
            badges: p.badges || [],
            streak: p.streak,
            betAmount: p.bet_amount
        }));
    },

    async addPlayer(player: Omit<Player, 'id'>) {
        const { data, error } = await supabase
            .from('players')
            .insert([{
                name: player.name,
                initial_weight: player.initialWeight,
                current_weight: player.currentWeight,
                target_weight: player.targetWeight,
                weight_history: player.weightHistory,
                cheers: player.cheers,
                last_update_date: player.lastUpdateDate,
                avatar_seed: player.avatarSeed,
                join_date: player.joinDate,
                badges: player.badges,
                streak: player.streak,
                bet_amount: player.betAmount
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updatePlayer(id: number, updates: Partial<Player>) {
        const dbUpdates: any = {};
        if (updates.currentWeight !== undefined) dbUpdates.current_weight = updates.currentWeight;
        if (updates.weightHistory !== undefined) dbUpdates.weight_history = updates.weightHistory;
        if (updates.cheers !== undefined) dbUpdates.cheers = updates.cheers;
        if (updates.lastUpdateDate !== undefined) dbUpdates.last_update_date = updates.lastUpdateDate;
        if (updates.streak !== undefined) dbUpdates.streak = updates.streak;
        if (updates.badges !== undefined) dbUpdates.badges = updates.badges;

        const { error } = await supabase
            .from('players')
            .update(dbUpdates)
            .eq('id', id);

        if (error) throw error;
    },

    // --- Logs ---

    async getLogs(): Promise<ActivityLog[]> {
        const { data, error } = await supabase
            .from('activity_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;

        return (data || []).map((l: any) => ({
            id: l.id,
            type: l.type,
            playerId: l.player_id,
            playerName: l.player_name,
            message: l.message,
            timestamp: l.timestamp,
            avatarSeed: l.avatar_seed
        }));
    },

    async addLog(log: Omit<ActivityLog, 'id'>) {
        const { error } = await supabase
            .from('activity_logs')
            .insert([{
                type: log.type,
                player_id: log.playerId,
                player_name: log.playerName,
                message: log.message,
                timestamp: log.timestamp,
                avatar_seed: log.avatarSeed
            }]);

        if (error) throw error;
    },

    // --- Realtime Subscription ---

    subscribeToChanges(onUpdate: () => void) {
        const channel = supabase
            .channel('game-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'game_settings' },
                () => onUpdate()
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'players' },
                () => onUpdate()
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'activity_logs' },
                () => onUpdate()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    },

    // --- Full State ---

    async getFullGameState(): Promise<GameState | null> {
        try {
            const settings = await this.getGameSettings();
            if (!settings) return null;

            const players = await this.getPlayers();
            const logs = await this.getLogs();

            return {
                isStarted: settings.is_started,
                startDate: settings.start_date,
                endDate: settings.end_date,
                targetPercentage: settings.target_percentage,
                betAmount: settings.bet_amount,
                payoutMode: settings.payout_mode as PayoutMode,
                players: players,
                logs: logs
            };
        } catch (error) {
            console.error('Error fetching game state:', error);
            return null;
        }
    }
};
