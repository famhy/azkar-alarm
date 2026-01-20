package com.dhikralarm

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
            // In a real app, we would query storage and reschedule.
            // For MVP, we'll just log or leave a placeholder.
        }
    }
}
