package com.dhikralarm

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class AlarmModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "AlarmModule"

    @ReactMethod
    fun setAlarm(timestamp: Double) {
        val alarmManager = reactApplicationContext.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val intent = Intent(reactApplicationContext, AlarmReceiver::class.java)
        val pendingIntent = PendingIntent.getBroadcast(
            reactApplicationContext,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            if (alarmManager.canScheduleExactAlarms()) {
                alarmManager.setExactAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    timestamp.toLong(),
                    pendingIntent
                )
            } else {
                // Should handle permission request in JS
                alarmManager.setAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    timestamp.toLong(),
                    pendingIntent
                )
            }
        } else {
            alarmManager.setExactAndAllowWhileIdle(
                AlarmManager.RTC_WAKEUP,
                timestamp.toLong(),
                pendingIntent
            )
        }
    }

    @ReactMethod
    fun stopAlarm() {
        val alarmManager = reactApplicationContext.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val intent = Intent(reactApplicationContext, AlarmReceiver::class.java)
        val pendingIntent = PendingIntent.getBroadcast(
            reactApplicationContext,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        alarmManager.cancel(pendingIntent)
    }

    @ReactMethod
    fun openAlarmSettings() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val intent = Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            reactApplicationContext.startActivity(intent)
        }
    }

    @ReactMethod
    fun checkAlarmTriggered(promise: com.facebook.react.bridge.Promise) {
        val activity = currentActivity
        if (activity != null && activity.intent.getBooleanExtra("ALARM_TRIGGERED", false)) {
            // Reset the extra so it doesn't trigger again on reload
            activity.intent.putExtra("ALARM_TRIGGERED", false)
            promise.resolve(true)
        } else {
            promise.resolve(false)
        }
    }
}
