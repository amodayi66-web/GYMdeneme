package com.zenlauncher.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideOutHorizontally
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectHorizontalDragGestures
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.width
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.zenlauncher.ui.LauncherViewModel
import com.zenlauncher.ui.components.AlphabetNav
import com.zenlauncher.ui.components.LetterOverlay

/** Edge swipe threshold to trigger app list reveal (in dp). */
private const val EDGE_THRESHOLD = 40f

@Composable
fun LauncherScreen(
    viewModel: LauncherViewModel,
    modifier: Modifier = Modifier,
    onAppClick: (String) -> Unit = {}
) {
    val activeLetter by viewModel.activeLetter.collectAsState()
    val showOverlay by viewModel.showLetterOverlay.collectAsState()

    // Controls whether the app list panel is visible
    var showAppList by remember { mutableStateOf(false) }

    // Tracks drag distance for edge detection
    var dragAccumulator by remember { mutableFloatStateOf(0f) }

    Box(
        modifier = modifier
            .fillMaxSize()
            // Make background transparent so wallpaper shows through
            .background(Color.Transparent)
    ) {
        // ============================================================
        // HOME SCREEN (shown when app list is hidden)
        // ============================================================
        AnimatedVisibility(
            visible = !showAppList,
            modifier = Modifier.fillMaxSize()
        ) {
            HomeScreen(
                viewModel = viewModel,
                // Edge swipe to reveal app list (works from BOTH edges)
                onEdgeSwipe = { showAppList = true }
            )
        }

        // ============================================================
        // APP LIST PANEL (slides in from left, Niagara-style)
        // ============================================================
        AnimatedVisibility(
            visible = showAppList,
            enter = slideInHorizontally { -it },
            exit = slideOutHorizontally { -it },
            modifier = Modifier.fillMaxSize()
        ) {
            AppListPanel(
                viewModel = viewModel,
                onAppClick = onAppClick,
                onClose = { showAppList = false }
            )
        }

        // Letter overlay when dragging alphabet
        LetterOverlay(
            letter = activeLetter,
            visible = showOverlay
        )
    }
}

// ============================================================
// HOME SCREEN CONTENT
// ============================================================
@Composable
private fun HomeScreen(
    viewModel: LauncherViewModel,
    onEdgeSwipe: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            // Edge detection on BOTH left and right sides
            .pointerInput(Unit) {
                detectHorizontalDragGestures(
                    onDragEnd = { /* no-op */ },
                    onHorizontalDrag = { change, dragAmount ->
                        change.consume()
                        // Swipe in from left or right edge
                        val isLeftEdge = change.position.x < EDGE_THRESHOLD
                        val isRightEdge =
                            change.position.x > size.width - EDGE_THRESHOLD
                        if (isLeftEdge || isRightEdge) {
                            // Dragging inward opens the app list
                            if (dragAmount > 0 && isRightEdge) {
                                onEdgeSwipe()
                            } else if (dragAmount < 0 && isLeftEdge) {
                                onEdgeSwipe()
                            }
                        }
                    }
                )
            },
        contentAlignment = Alignment.Center
    ) {
        // Minimal home screen content
        Text(
            text = "ZenLauncher",
            color = Color.White.copy(alpha = 0.3f),
            fontSize = 18.sp,
            fontWeight = FontWeight.Light
        )
    }
}

// ============================================================
// APP LIST PANEL
// ============================================================
@Composable
private fun AppListPanel(
    viewModel: LauncherViewModel,
    onAppClick: (String) -> Unit,
    onClose: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxSize()
            // Dark, slightly transparent background for readability
            .background(Color(0xCC0D0D0D))
    ) {
        // Alphabet navigation on the LEFT edge
        // Wider touch area with the invisible Box for edge-drag
        Box(
            modifier = Modifier
                .fillMaxHeight()
                .width(40.dp) // wider touch target
        ) {
            AlphabetNav(
                activeLetter = viewModel.activeLetter.collectAsState().value,
                onLetterSelected = { viewModel.onLetterSelected(it) },
                onDragEnded = { viewModel.onLetterDragEnded() },
                barWidth = 40.dp
            )
        }

        // App list takes remaining space
        AppListScreen(
            viewModel = viewModel,
            modifier = Modifier.weight(1f),
            onAppClick = onAppClick
        )

        // Right edge tap/drag to close
        Box(
            modifier = Modifier
                .width(24.dp)
                .fillMaxHeight()
                .background(Color.Transparent)
                .pointerInput(Unit) {
                    detectHorizontalDragGestures(
                        onHorizontalDrag = { change, dragAmount ->
                            change.consume()
                            // Swiping right closes the app list
                            if (dragAmount > 0) onClose()
                        }
                    )
                }
        )
    }
}