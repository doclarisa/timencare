import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import TimerControls from '../components/TimerControls';
import SessionCard from '../components/SessionCard';
import useTimer from '../hooks/useTimer';

const SessionTimerScreen = () => {
  const { timer, isActive, startTimer, stopTimer } = useTimer();

  useEffect(() => {
    // Handle notifications or any side effects related to the timer
    return () => {
      // Cleanup if necessary
    };
  }, [isActive]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Session Timer</Text>
      <SessionCard timer={timer} />
      <TimerControls 
        isActive={isActive} 
        onStart={startTimer} 
        onStop={stopTimer} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default SessionTimerScreen;