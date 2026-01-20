import { NativeModules } from 'react-native';

const { AlarmModule } = NativeModules;

interface AlarmInterface {
  setAlarm(timestamp: number): void;
  stopAlarm(): void;
  openAlarmSettings(): void;
  checkAlarmTriggered(): Promise<boolean>;
}

export default AlarmModule as AlarmInterface;
