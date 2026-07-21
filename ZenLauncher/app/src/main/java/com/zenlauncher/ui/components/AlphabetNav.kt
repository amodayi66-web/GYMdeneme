package com.zenlauncher.ui.components

import android.graphics.Paint
import android.graphics.Typeface
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.width
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.nativeCanvas
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

private val ALPHABET = ('A'..'Z').toList()

@Composable
fun AlphabetNav(
    modifier: Modifier = Modifier,
    activeLetter: Char?,
    onLetterSelected: (Char) -> Unit,
    onDragEnded: () -> Unit,
    barWidth: Dp = 20.dp
) {
    Box(
        modifier = modifier
            .width(barWidth)
            .fillMaxHeight()
            .pointerInput(Unit) {
                detectTapGestures { offset ->
                    val letter = getLetterAtPosition(offset.y, size.height.toFloat())
                    if (letter != null) onLetterSelected(letter)
                }
            }
            .pointerInput(Unit) {
                detectDragGestures(
                    onDragStart = { offset ->
                        val letter = getLetterAtPosition(offset.y, size.height.toFloat())
                        if (letter != null) onLetterSelected(letter)
                    },
                    onDrag = { change, _ ->
                        change.consume()
                        val letter = getLetterAtPosition(change.position.y, size.height.toFloat())
                        if (letter != null) onLetterSelected(letter)
                    },
                    onDragEnd = { onDragEnded() },
                    onDragCancel = { onDragEnded() }
                )
            }
    ) {
        Canvas(modifier = Modifier.fillMaxHeight().width(barWidth)) {
            val itemHeight = size.height / ALPHABET.size
            ALPHABET.forEachIndexed { index, letter ->
                val y = index * itemHeight
                val isActive = letter == activeLetter
                drawLetter(
                    letter = letter,
                    x = size.width / 2f,
                    y = y + itemHeight / 2f,
                    isActive = isActive,
                    itemHeight = itemHeight
                )
            }
        }
    }
}

private fun getLetterAtPosition(y: Float, canvasHeight: Float): Char? {
    val index = (y / canvasHeight * ALPHABET.size).toInt().coerceIn(0, ALPHABET.size - 1)
    return ALPHABET.getOrNull(index)
}

private fun DrawScope.drawLetter(
    letter: Char,
    x: Float,
    y: Float,
    isActive: Boolean,
    itemHeight: Float
) {
    val color = if (isActive) Color.White else Color(0xFFAAAAAA)
    // Bigger letters: up to 22sp for readability
    val fontSize = (itemHeight * 0.6f).coerceIn(12f, 22f)
    val paint = Paint().apply {
        this.color = color.hashCode()
        this.textSize = fontSize
        this.textAlign = Paint.Align.CENTER
        this.isAntiAlias = true
        this.typeface = Typeface.DEFAULT_BOLD
    }
    drawContext.canvas.nativeCanvas.drawText(
        letter.toString(),
        x,
        y - (paint.descent() + paint.ascent()) / 2f,
        paint
    )
}
