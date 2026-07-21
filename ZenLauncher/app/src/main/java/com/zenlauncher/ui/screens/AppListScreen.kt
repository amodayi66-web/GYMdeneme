package com.zenlauncher.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.zenlauncher.data.model.AppInfo
import com.zenlauncher.ui.LauncherViewModel
import com.zenlauncher.ui.components.drawableToBitmap

@Composable
fun AppListScreen(
    viewModel: LauncherViewModel,
    modifier: Modifier = Modifier,
    onAppClick: (String) -> Unit = {}
) {
    val apps by viewModel.apps.collectAsState()
    val activeLetter by viewModel.activeLetter.collectAsState()
    val letterPositions by viewModel.letterPositions.collectAsState()
    val listState = rememberLazyListState()

    // Scroll to letter when active letter changes
    LaunchedEffect(activeLetter) {
        val letter = activeLetter ?: return@LaunchedEffect
        val position = letterPositions[letter] ?: return@LaunchedEffect
        if (position in apps.indices) {
            listState.animateScrollToItem(position)
        }
    }

    LazyColumn(
        state = listState,
        modifier = modifier
            .fillMaxSize()
            .padding(start = 16.dp, end = 16.dp, top = 8.dp, bottom = 8.dp),
        verticalArrangement = Arrangement.spacedBy(0.dp)
    ) {
        itemsIndexed(
            items = apps,
            key = { _, app -> app.packageName }
        ) { index, app ->
            val showHeader = index == 0 || apps[index - 1].firstLetter != app.firstLetter
            if (showHeader) {
                Text(
                    text = app.firstLetter.toString(),
                    color = Color.Gray,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(top = 16.dp, bottom = 4.dp)
                )
            }
            AppListItem(
                app = app,
                onClick = { onAppClick(app.packageName) }
            )
        }
    }
}

@Composable
private fun AppListItem(
    app: AppInfo,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(vertical = 10.dp, horizontal = 4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // App icon
        val icon = app.icon
        if (icon != null) {
            val bitmap = drawableToBitmap(icon)
            if (bitmap != null) {
                Image(
                    bitmap = bitmap.asImageBitmap(),
                    contentDescription = app.label,
                    modifier = Modifier.size(36.dp)
                )
            }
        }
        Spacer(modifier = Modifier.width(14.dp))
        Text(
            text = app.label,
            fontSize = 16.sp,
            color = Color.White
        )
    }
}