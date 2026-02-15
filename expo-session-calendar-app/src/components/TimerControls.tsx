import React from 'react';
import { View, Button, StyleSheet } from 'react-native';

interface TimerControlsProps {
  isActive: boolean;
  onStart: () => void;
  onStop: () => void;
}

const TimerControls: React.FC<TimerControlsProps> = ({ isActive, onStart, onStop }) => {
  return (
    <View style={styles.container}>
      {isActive ? (
        <Button title="Clock Out" onPress={onStop} />
      ) : (
        <Button title="Clock In" onPress={onStart} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    margin: 20,
  },
});

export default TimerControls;