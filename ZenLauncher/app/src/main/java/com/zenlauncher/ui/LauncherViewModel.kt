package com.zenlauncher.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.zenlauncher.data.AppRepository
import com.zenlauncher.data.model.AppInfo
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class LauncherViewModel(application: Application) : AndroidViewModel(application) {

    private val repository = AppRepository(application)

    private val _apps = MutableStateFlow<List<AppInfo>>(emptyList())
    val apps: StateFlow<List<AppInfo>> = _apps.asStateFlow()

    private val _isLoading = MutableStateFlow(true)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    // Scrolled-to letter in alphabet navigation (null = no letter selected)
    private val _activeLetter = MutableStateFlow<Char?>(null)
    val activeLetter: StateFlow<Char?> = _activeLetter.asStateFlow()

    // Letter to scroll position mapping
    private val _letterPositions = MutableStateFlow<Map<Char, Int>>(emptyMap())
    val letterPositions: StateFlow<Map<Char, Int>> = _letterPositions.asStateFlow()

    private val _showLetterOverlay = MutableStateFlow(false)
    val showLetterOverlay: StateFlow<Boolean> = _showLetterOverlay.asStateFlow()

    init {
        loadApps()
    }

    fun loadApps() {
        viewModelScope.launch {
            _isLoading.value = true
            val appList = repository.getInstalledApps()
            _apps.value = appList

            // Build letter -> first index map
            val positions = mutableMapOf<Char, Int>()
            appList.forEachIndexed { index, app ->
                if (!positions.containsKey(app.firstLetter)) {
                    positions[app.firstLetter] = index
                }
            }
            _letterPositions.value = positions
            _isLoading.value = false
        }
    }

    fun onLetterSelected(letter: Char) {
        _activeLetter.value = letter
        _showLetterOverlay.value = true
    }

    fun onLetterDragEnded() {
        _showLetterOverlay.value = false
        _activeLetter.value = null
    }

    fun launchApp(packageName: String) {
        repository.launchApp(packageName)
    }
}