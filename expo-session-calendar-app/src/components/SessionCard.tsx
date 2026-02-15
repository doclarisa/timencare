import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SessionCardProps {
  startTime: string;
  endTime: string;
  countdown: number;
}

const SessionCard: React.FC<SessionCardProps> = ({ startTime, endTime, countdown }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.timeText}>Start Time: {startTime}</Text>
      <Text style={styles.timeText}>End Time: {endTime}</Text>
      <Text style={styles.countdownText}>Countdown: {countdown} seconds</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    margin: 8,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  timeText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  countdownText: {
    fontSize: 14,
    color: '#ff0000',
  },
});

export default SessionCard;