import { useState, useCallback } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { PinInput } from '@/components/pin/pin-input';
import { useAuth } from '@/contexts/auth-context';

export default function PinScreen() {
  const { pinExists, authenticate, createPin } = useAuth();
  const [mode, setMode] = useState<'create' | 'confirm' | 'unlock'>(
    pinExists ? 'unlock' : 'create'
  );
  const [firstPin, setFirstPin] = useState('');
  const [error, setError] = useState('');

  const handleComplete = useCallback(
    async (pin: string) => {
      setError('');

      if (mode === 'unlock') {
        const valid = await authenticate(pin);
        if (!valid) {
          setError('Incorrect PIN. Try again.');
        }
        return;
      }

      if (mode === 'create') {
        setFirstPin(pin);
        setMode('confirm');
        return;
      }

      if (mode === 'confirm') {
        if (pin === firstPin) {
          await createPin(pin);
        } else {
          setError('PINs do not match. Start over.');
          setFirstPin('');
          setMode('create');
        }
      }
    },
    [mode, firstPin, authenticate, createPin]
  );

  const getTitle = () => {
    switch (mode) {
      case 'create':
        return 'Create Your PIN';
      case 'confirm':
        return 'Confirm Your PIN';
      case 'unlock':
        return 'Enter Your PIN';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <PinInput
        title={getTitle()}
        onComplete={handleComplete}
        error={error}
        pinLength={4}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
