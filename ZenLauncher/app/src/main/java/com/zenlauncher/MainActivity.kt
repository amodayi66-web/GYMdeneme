package com.zenlauncher

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.core.view.WindowCompat
import androidx.lifecycle.viewmodel.compose.viewModel
import com.zenlauncher.ui.LauncherViewModel
import com.zenlauncher.ui.screens.LauncherScreen
import com.zenlauncher.ui.theme.ZenLauncherTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        // Make status bar icons light
        WindowCompat.getInsetsController(window, window.decorView).apply {
            isAppearanceLightStatusBars = false
            isAppearanceLightNavigationBars = false
        }

        setContent {
            ZenLauncherTheme(darkTheme = true) {
                Surface(modifier = Modifier.fillMaxSize()) {
                    val viewModel: LauncherViewModel = viewModel()
                    LauncherScreen(
                        viewModel = viewModel,
                        onAppClick = { packageName ->
                            viewModel.launchApp(packageName)
                        }
                    )
                }
            }
        }
    }
}