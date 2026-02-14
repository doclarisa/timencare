import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { Pressable } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: true,
        tabBarButton: HapticTab,
        headerRight: () => (
          <Pressable
            onPress={() => router.push('/settings')}
            style={{ marginRight: 16 }}
          >
            <IconSymbol
              name="gearshape.fill"
              size={24}
              color={Colors[colorScheme ?? 'light'].icon}
            />
          </Pressable>
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Timer',
          headerShown: false,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="timer" color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          headerShown: false,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="calendar.badge.clock" color={color} />,
        }}
      />
      {/* Hide the old explore tab from navigation */}
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
