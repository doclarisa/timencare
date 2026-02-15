import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CalendarView = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Calendar View</Text>
            {/* Month grid and event display will be implemented here */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
});

export default CalendarView;