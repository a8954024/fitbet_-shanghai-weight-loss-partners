import React, { useState, useEffect } from 'react';
import { GameSetup } from './components/GameSetup';
import { Dashboard } from './components/Dashboard';
import { Layout } from './components/Layout';
import { GameState } from './types';
import { supabaseService } from './services/supabaseService';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchState = async () => {
    try {
      const state = await supabaseService.getFullGameState();
      // Only set state if the game is actually started
      if (state && state.isStarted) {
        setGameState(state);
      } else {
        setGameState(null);
      }
    } catch (error) {
      console.error('Failed to fetch game state:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchState();

    const unsubscribe = supabaseService.subscribeToChanges(() => {
      console.log('Received real-time update, refreshing state...');
      fetchState();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleStart = async (newState: GameState) => {
    try {
      // 1. Update Game Settings
      await supabaseService.updateGameSettings({
        isStarted: true,
        startDate: newState.startDate,
        endDate: newState.endDate,
        targetPercentage: newState.targetPercentage,
        betAmount: newState.betAmount,
        payoutMode: newState.payoutMode
      });

      // 2. Add Players
      for (const player of newState.players) {
        await supabaseService.addPlayer(player);
      }

      // 3. Add Initial Log
      if (newState.logs && newState.logs.length > 0) {
        await supabaseService.addLog(newState.logs[0]);
      }

      // State will be updated via subscription or we can force fetch
      fetchState();
    } catch (error: any) {
      console.error('Failed to start game:', error);
      alert(`Failed to start game: ${error.message || JSON.stringify(error)}`);
    }
  };

  const handleUpdatePlayerWeight = async (id: number, newWeight: number) => {
    if (!gameState) return;

    const player = gameState.players.find(p => p.id === id);
    if (!player) return;

    const today = new Date().toISOString();
    const newHistory = [...(player.weightHistory || []), { date: today, weight: newWeight }];

    // Optimistic Update
    const updatedPlayers = gameState.players.map(p =>
      p.id === id ? { ...p, currentWeight: newWeight, weightHistory: newHistory, lastUpdateDate: today } : p
    );
    setGameState({ ...gameState, players: updatedPlayers });

    try {
      await supabaseService.updatePlayer(id, {
        currentWeight: newWeight,
        weightHistory: newHistory,
        lastUpdateDate: today
      });

      await supabaseService.addLog({
        type: 'WEIGHT_UPDATE',
        playerId: id,
        playerName: player.name,
        message: `更新了体重: ${newWeight}kg`,
        timestamp: today,
        avatarSeed: player.avatarSeed
      });
    } catch (error) {
      console.error('Failed to update player weight:', error);
      fetchState(); // Revert on error
    }
  };

  const handlePoke = async (id: number) => {
    if (!gameState) return;
    const player = gameState.players.find(p => p.id === id);
    if (!player) return;

    // Optimistic Update
    const updatedPlayers = gameState.players.map(p =>
      p.id === id ? { ...p, cheers: (p.cheers || 0) + 1 } : p
    );
    setGameState({ ...gameState, players: updatedPlayers });

    try {
      await supabaseService.updatePlayer(id, {
        cheers: (player.cheers || 0) + 1
      });

      await supabaseService.addLog({
        type: 'CHEER',
        playerName: '有人', // TODO: Identify who poked if we have auth, for now anonymous
        message: `给 ${player.name} 加油打气！`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to poke player:', error);
      fetchState();
    }
  };

  const handleReset = async () => {
    if (confirm('确定要重置游戏吗？所有数据将丢失。')) {
      try {
        await supabaseService.updateGameSettings({ isStarted: false });
        setGameState(null);
      } catch (error) {
        console.error('Failed to reset game:', error);
      }
    }
  };

  // Handler for Dashboard to update state (e.g. adding new player, changing settings)
  const handleUpdateState = async (newState: GameState) => {
    // If the player count increased, it's an add player.
    if (gameState && newState.players.length > gameState.players.length) {
      const newPlayer = newState.players[newState.players.length - 1];
      try {
        await supabaseService.addPlayer(newPlayer);
        await supabaseService.addLog({
          type: 'JOIN',
          playerName: newPlayer.name,
          message: '加入了挑战！',
          timestamp: new Date().toISOString(),
          avatarSeed: newPlayer.avatarSeed
        });
      } catch (e) {
        console.error(e);
      }
    }

    // If settings changed
    if (gameState && (newState.startDate !== gameState.startDate || newState.endDate !== gameState.endDate)) {
      try {
        await supabaseService.updateGameSettings({
          startDate: newState.startDate,
          endDate: newState.endDate
        });
      } catch (e) { console.error(e); }
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <Layout gameState={gameState} onReset={handleReset}>
      {!gameState ? (
        <GameSetup onStart={handleStart} />
      ) : (
        <Dashboard
          state={gameState}
          onUpdatePlayer={handleUpdatePlayerWeight}
          onPoke={handlePoke}
          onReset={handleReset}
          onUpdateState={handleUpdateState}
        />
      )}
    </Layout>
  );
};

export default App;