import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NativeAlarm from './src/NativeAlarm';
import AlarmScreen from './src/screens/AlarmScreen';

const ALARM_TIME_KEY = '@alarm_time';

export default function App() {
  const [alarmTime, setAlarmTime] = useState(new Date());
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [isRinging, setIsRinging] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    loadAlarmTime();
    const checkInitialAlarm = async () => {
      const triggered = await NativeAlarm.checkAlarmTriggered();
      if (triggered) {
        setIsRinging(true);
      }
    };
    checkInitialAlarm();
  }, []);

  const loadAlarmTime = async () => {
    try {
      const savedTime = await AsyncStorage.getItem(ALARM_TIME_KEY);
      if (savedTime) {
        setAlarmTime(new Date(savedTime));
      }
    } catch (e) {
      console.error('Failed to load alarm time', e);
    }
  };

  const saveAlarmTime = async (time: Date) => {
    try {
      await AsyncStorage.setItem(ALARM_TIME_KEY, time.toISOString());
    } catch (e) {
      console.error('Failed to save alarm time', e);
    }
  };

  const scheduleAlarm = (time: Date) => {
    const now = new Date();
    const scheduledTime = new Date(now);
    scheduledTime.setHours(time.getHours());
    scheduledTime.setMinutes(time.getMinutes());
    scheduledTime.setSeconds(0);
    scheduledTime.setMilliseconds(0);

    // If time is in the past, schedule for tomorrow
    if (scheduledTime.getTime() <= now.getTime()) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    NativeAlarm.setAlarm(scheduledTime.getTime());
    saveAlarmTime(time);
    Alert.alert(
      'Alarm Set',
      `Alarm scheduled for ${scheduledTime.toLocaleTimeString()}`,
    );
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    setPickerVisible(false);
    if (selectedDate) {
      setAlarmTime(selectedDate);
      scheduleAlarm(selectedDate);
    }
  };

  const onAlarmComplete = () => {
    setIsRinging(false);
    setIsSuccess(true);
    // Notification for the next alarm could be set here
  };

  // Mock trigger for testing in Dev
  const triggerAlarmManually = () => {
    setIsRinging(true);
  };

  if (isRinging) {
    return <AlarmScreen onComplete={onAlarmComplete} />;
  }

  if (isSuccess) {
    return (
      <View style={styles.successContainer}>
        <StatusBar barStyle="light-content" />
        <Text style={styles.successEmoji}>✨</Text>
        <Text style={styles.successTitle}>MashaAllah!</Text>
        <Text style={styles.successSub}>100 Dhikrs completed.</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setIsSuccess(false)}
        >
          <Text style={styles.backButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        <Text style={styles.appTitle}>Dhikr Alarm</Text>
        <Text style={styles.appSubtitle}>Wake up with Remembrance</Text>

        <View style={styles.timeCard}>
          <Text style={styles.nextAlarmLabel}>Next Alarm At</Text>
          <Text style={styles.timeText}>
            {alarmTime.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setPickerVisible(true)}
          >
            <Text style={styles.editButtonText}>Change Time</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.testButton}
          onPress={triggerAlarmManually}
        >
          <Text style={styles.testButtonText}>🚀 Test Alarm Now</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingsLink}
          onPress={() => NativeAlarm.openAlarmSettings()}
        >
          <Text style={styles.settingsLinkText}>
            Configure Exact Alarm Permission
          </Text>
        </TouchableOpacity>
      </View>

      {isPickerVisible && (
        <DateTimePicker
          value={alarmTime}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 42,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 5,
  },
  appSubtitle: {
    fontSize: 18,
    color: '#64748b',
    marginBottom: 50,
  },
  timeCard: {
    backgroundColor: 'white',
    width: '100%',
    padding: 30,
    borderRadius: 30,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  nextAlarmLabel: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  timeText: {
    fontSize: 64,
    fontWeight: '800',
    color: '#0f172a',
    marginVertical: 10,
  },
  editButton: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 10,
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  testButton: {
    marginTop: 40,
    padding: 15,
  },
  testButtonText: {
    color: '#38bdf8',
    fontSize: 18,
    fontWeight: '600',
  },
  settingsLink: {
    position: 'absolute',
    bottom: 30,
  },
  settingsLinkText: {
    color: '#94a3b8',
    textDecorationLine: 'underline',
  },
  successEmoji: {
    fontSize: 100,
    marginBottom: 20,
  },
  successTitle: {
    color: 'white',
    fontSize: 48,
    fontWeight: '900',
  },
  successSub: {
    color: '#d1fae5',
    fontSize: 20,
    marginTop: 10,
  },
  backButton: {
    marginTop: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
  },
  backButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  successContainer: {
    flex: 1,
    backgroundColor: '#065f46',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
});
