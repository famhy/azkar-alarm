import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Vibration,
  Animated,
  StatusBar,
} from 'react-native';
import Sound from 'react-native-sound';
import {
  DHIKR_ITEMS,
  GOAL_COUNT,
  SILENCE_DURATION_MS,
  VIBRATION_PATTERN,
} from '../constants';

// Enable playback in silence mode
Sound.setCategory('Alarm');

interface AlarmScreenProps {
  onComplete: () => void;
}

const AlarmScreen: React.FC<AlarmScreenProps> = ({ onComplete }) => {
  const [count, setCount] = useState(0);
  const [status, setStatus] = useState<'RINGING' | 'PENDING'>('RINGING');
  const [timeLeft, setTimeLeft] = useState(5);
  const [dhikr] = useState(
    () => DHIKR_ITEMS[Math.floor(Math.random() * DHIKR_ITEMS.length)],
  );

  const soundRef = useRef<Sound | null>(null);
  const timerRef = useRef<any>(null);
  const countdownRef = useRef<any>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const playSound = useCallback(() => {
    if (!soundRef.current) {
      soundRef.current = new Sound('alarm.mp3', Sound.MAIN_BUNDLE, error => {
        if (error) {
          console.log('Failed to load sound', error);
          return;
        }
        soundRef.current?.setNumberOfLoops(-1);
        soundRef.current?.setVolume(1.0);
        soundRef.current?.play();
      });
    } else {
      soundRef.current.setVolume(1.0);
      soundRef.current.play();
    }
    Vibration.vibrate(VIBRATION_PATTERN, true);
    setStatus('RINGING');
  }, []);

  const pauseSound = useCallback(() => {
    soundRef.current?.setVolume(0); // Better to set volume to 0 for "pause" feel if we want instant resume
    // soundRef.current?.pause(); // Actual pause might have slight lag on resume
    Vibration.cancel();
    setStatus('PENDING');
  }, []);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    pauseSound();
    setTimeLeft(5);

    timerRef.current = setTimeout(() => {
      if (count < GOAL_COUNT) {
        playSound();
      }
    }, SILENCE_DURATION_MS);

    countdownRef.current = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
  }, [count, pauseSound, playSound]);

  useEffect(() => {
    playSound();
    return () => {
      soundRef.current?.stop().release();
      Vibration.cancel();
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [playSound]);

  const handleTap = () => {
    if (count >= GOAL_COUNT) return;

    const newCount = count + 1;
    setCount(newCount);

    // Animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();

    if (newCount >= GOAL_COUNT) {
      handleComplete();
    } else {
      resetTimer();
    }
  };

  const handleDecrement = () => {
    setCount(prev => Math.max(0, prev - 1));
  };

  const handleComplete = () => {
    soundRef.current?.stop().release();
    Vibration.cancel();
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    onComplete();
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <View style={styles.header}>
        <Text style={styles.statusLabel}>
          {status === 'RINGING' ? '🔔 Ringing' : '🤫 Silenced (Keep tapping!)'}
        </Text>
        {status === 'PENDING' && (
          <Text style={styles.timerText}>Sound resumes in {timeLeft}s</Text>
        )}
      </View>

      <View style={styles.dhikrContainer}>
        <Text style={styles.dhikrText}>{dhikr}</Text>
      </View>

      <View style={styles.counterContainer}>
        <Text style={styles.counterText}>
          {count} / {GOAL_COUNT}
        </Text>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${(count / GOAL_COUNT) * 100}%` },
            ]}
          />
        </View>
      </View>

      <Animated.View
        style={[styles.buttonContainer, { transform: [{ scale: scaleAnim }] }]}
      >
        <TouchableOpacity
          style={styles.tapButton}
          onPress={handleTap}
          activeOpacity={0.7}
        >
          <Text style={styles.tapButtonText}>+1</Text>
        </TouchableOpacity>
      </Animated.View>

      <TouchableOpacity style={styles.minusButton} onPress={handleDecrement}>
        <Text style={styles.minusButtonText}>-1</Text>
      </TouchableOpacity>

      {status === 'RINGING' && count > 0 && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>KEEP GOING!</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
  },
  statusLabel: {
    color: '#94a3b8',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  timerText: {
    color: '#fbbf24',
    fontSize: 24,
    fontWeight: 'bold',
  },
  dhikrContainer: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    width: '100%',
    alignItems: 'center',
  },
  dhikrText: {
    color: '#f8fafc',
    fontSize: 28,
    textAlign: 'center',
    fontWeight: '700',
    lineHeight: 40,
  },
  counterContainer: {
    width: '100%',
    alignItems: 'center',
  },
  counterText: {
    color: '#38bdf8',
    fontSize: 48,
    fontWeight: '800',
    marginBottom: 10,
  },
  progressBarBackground: {
    width: '80%',
    height: 8,
    backgroundColor: '#334155',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#38bdf8',
  },
  buttonContainer: {
    width: 200,
    height: 200,
  },
  tapButton: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    backgroundColor: '#38bdf8',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  tapButtonText: {
    color: 'white',
    fontSize: 72,
    fontWeight: 'bold',
  },
  minusButton: {
    padding: 10,
  },
  minusButtonText: {
    color: '#64748b',
    fontSize: 20,
  },
  warningContainer: {
    position: 'absolute',
    top: 150,
    backgroundColor: '#ef4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
  },
  warningText: {
    color: 'white',
    fontWeight: '900',
    fontSize: 24,
  },
});

export default AlarmScreen;
