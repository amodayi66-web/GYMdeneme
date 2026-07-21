package com.zenlauncher.data.model

import android.graphics.drawable.Drawable

data class AppInfo(
    val packageName: String,
    val label: String,
    val icon: Drawable?,
    val firstLetter: Char
) {
    companion object {
        fun getFirstLetter(label: String): Char {
            val c = label.firstOrNull()?.uppercaseChar() ?: '#'
            return if (c in 'A'..'Z') c else '#'
        }
    }
}