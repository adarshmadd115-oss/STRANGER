package ai.stranger.app

import android.content.Intent
import android.os.Bundle
import android.speech.RecognizerIntent
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.GraphicEq
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.Psychology
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.SmartToy
import androidx.compose.material.icons.filled.Translate
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.AssistChip
import androidx.compose.material3.AssistChipDefaults
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import ai.stranger.app.data.model.ActionProposal
import ai.stranger.app.data.model.AgentTask
import ai.stranger.app.data.model.ChatMessage
import ai.stranger.app.data.model.Language
import ai.stranger.app.data.model.RiskLevel
import ai.stranger.app.data.model.StepStatus
import ai.stranger.app.data.model.StrangerMemory
import ai.stranger.app.data.model.TaskStatus
import ai.stranger.app.data.model.TaskStep
import ai.stranger.app.security.ToolAllowList
import ai.stranger.app.security.ToolValidationResult
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            val strangerColors = darkColorScheme(
                primary = Color(0xFF9B8CFF),
                secondary = Color(0xFF70D6C2),
                background = Color(0xFF0B0C10),
                surface = Color(0xFF151720),
                surfaceVariant = Color(0xFF202330),
                outline = Color(0xFF2D3142)
            )
            MaterialTheme(colorScheme = strangerColors) {
                StrangerHome()
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun StrangerHome() {
    var selectedLanguage by remember { mutableStateOf(Language.ENGLISH) }
    var showMemoryDialog by remember { mutableStateOf(false) }
    var isFloatingModeActive by remember { mutableStateOf(false) }

    val memories = remember {
        mutableStateListOf(
            StrangerMemory(key = "target_device", value = "Redmi 13C 5G (4GB RAM + 2GB Extension)", category = "hardware"),
            StrangerMemory(key = "preferred_language", value = "English / हिन्दी", category = "preference"),
            StrangerMemory(key = "safety_gate", value = "Explicit confirmation before sending files/messages", category = "security")
        )
    }

    val messages = remember {
        mutableStateListOf(
            ChatMessage(
                text = "Welcome to STRANGER. I am your private personal Android AI agent. My modular shell, bilingual voice recognizer, task planner, and security allow-list are active.",
                fromUser = false,
                language = Language.ENGLISH
            )
        )
    }

    var input by remember { mutableStateOf("") }
    var listeningError by remember { mutableStateOf<String?>(null) }
    val listState = rememberLazyListState()

    LaunchedEffect(messages.size) {
        if (messages.isNotEmpty()) {
            listState.animateScrollToItem(messages.size - 1)
        }
    }

    val speechLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.StartActivityForResult()
    ) { result ->
        val spoken = result.data
            ?.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)
            ?.firstOrNull()
        if (!spoken.isNullOrBlank()) {
            input = spoken
            listeningError = null
        } else {
            listeningError = if (selectedLanguage == Language.HINDI) {
                "आवाज़ प्राप्त नहीं हुई। कृपया पुनः प्रयास करें।"
            } else {
                "Voice input was not received. Please try again."
            }
        }
    }

    fun handleUserSubmission(commandText: String) {
        val trimmed = commandText.trim()
        if (trimmed.isEmpty()) return

        // 1. Record user message
        messages.add(
            ChatMessage(
                text = trimmed,
                fromUser = true,
                language = selectedLanguage
            )
        )
        input = ""

        // 2. Structured Action Planning with Allow-list validation
        val lower = trimmed.lowercase()
        val generatedTask: AgentTask? = when {
            lower.contains("pdf") || lower.contains("download") || lower.contains("डाउनलोड") -> {
                val validation = ToolAllowList.validateProposal(
                    "download_file",
                    mapOf("url" to "https://university.edu/syllabus.pdf", "filename" to "syllabus.pdf")
                )
                if (validation is ToolValidationResult.Valid) {
                    val step1 = TaskStep(title = "Extract download target from user request", status = StepStatus.DONE)
                    val step2 = TaskStep(title = "Validate URL against HTTPS safety rules", status = StepStatus.DONE)
                    val step3 = TaskStep(title = "Awaiting user confirmation before DownloadManager call", status = StepStatus.QUEUED)
                    AgentTask(
                        title = if (selectedLanguage == Language.HINDI) "फ़ाइल डाउनलोड योजना" else "File Download Task",
                        summary = "https://university.edu/syllabus.pdf -> /Download/STRANGER/",
                        steps = listOf(step1, step2, step3),
                        status = TaskStatus.AWAITING_CONFIRMATION,
                        requiresConfirmation = true,
                        actionProposal = validation.proposal
                    )
                } else null
            }
            lower.contains("whatsapp") || lower.contains("message") || lower.contains("शेयर") -> {
                val validation = ToolAllowList.validateProposal(
                    "share_media",
                    mapOf("mime_type" to "image/jpeg", "action" to "android_sharesheet")
                )
                if (validation is ToolValidationResult.Valid) {
                    val step1 = TaskStep(title = "Prepare Android Sharesheet intent", status = StepStatus.DONE)
                    val step2 = TaskStep(title = "Prompt user confirmation before launching Sharesheet", status = StepStatus.QUEUED)
                    AgentTask(
                        title = if (selectedLanguage == Language.HINDI) "मैसेजिंग व शेयरिंग" else "Messaging & Media Share",
                        summary = "Prepare Android Sharesheet (no silent transmission)",
                        steps = listOf(step1, step2),
                        status = TaskStatus.AWAITING_CONFIRMATION,
                        requiresConfirmation = true,
                        actionProposal = validation.proposal
                    )
                } else null
            }
            lower.contains("search") || lower.contains("खोज") -> {
                val validation = ToolAllowList.validateProposal("web_search", mapOf("query" to trimmed))
                if (validation is ToolValidationResult.Valid) {
                    val step1 = TaskStep(title = "Sanitize search parameters", status = StepStatus.DONE)
                    val step2 = TaskStep(title = "Execute web query via safe browser intent", status = StepStatus.RUNNING)
                    AgentTask(
                        title = if (selectedLanguage == Language.HINDI) "वेब खोज" else "Web Search Task",
                        summary = "Query: '$trimmed'",
                        steps = listOf(step1, step2),
                        status = TaskStatus.RUNNING,
                        requiresConfirmation = false,
                        actionProposal = validation.proposal
                    )
                } else null
            }
            else -> null
        }

        val responseText = if (selectedLanguage == Language.HINDI) {
            if (generatedTask != null) {
                "मैंने आपके अनुरोध के लिए एक बहु-चरणीय कार्य योजना तैयार की है। अनुमति के लिए नीचे समीक्षा करें।"
            } else {
                "कमांड प्राप्त हुआ: '$trimmed'। STRANGER का मूल शेल व अनुमति सूची सक्रिय हैं।"
            }
        } else {
            if (generatedTask != null) {
                "I have planned a multi-step task for your request. Please review and confirm the action below."
            } else {
                "Command received: '$trimmed'. STRANGER shell & allow-list are active."
            }
        }

        messages.add(
            ChatMessage(
                text = responseText,
                fromUser = false,
                language = selectedLanguage,
                task = generatedTask
            )
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(38.dp)
                                    .background(Color(0xFF27243D), CircleShape)
                                    .border(1.dp, Color(0xFF9B8CFF), CircleShape),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    Icons.Default.AutoAwesome,
                                    contentDescription = "STRANGER Logo",
                                    tint = Color(0xFFB8A9FF),
                                    modifier = Modifier.size(20.dp)
                                )
                            }
                            Spacer(Modifier.width(10.dp))
                            Column {
                                Text(
                                    text = "STRANGER",
                                    fontWeight = FontWeight.Bold,
                                    letterSpacing = 1.8.sp,
                                    color = Color(0xFFF3F1FD),
                                    fontSize = 17.sp
                                )
                                Text(
                                    text = "PERSONAL AI AGENT · M1 SHELL",
                                    fontSize = 9.sp,
                                    color = Color(0xFF8F93A3),
                                    letterSpacing = 0.8.sp
                                )
                            }
                        }

                        Row(verticalAlignment = Alignment.CenterVertically) {
                            // Memory dialog button
                            IconButton(
                                onClick = { showMemoryDialog = true },
                                modifier = Modifier
                                    .size(36.dp)
                                    .background(Color(0xFF1E212E), CircleShape)
                            ) {
                                Icon(
                                    Icons.Default.Psychology,
                                    contentDescription = "View Memories",
                                    tint = Color(0xFF70D6C2),
                                    modifier = Modifier.size(18.dp)
                                )
                            }

                            Spacer(Modifier.width(8.dp))

                            // Language toggle (EN / हिन्दी)
                            Surface(
                                shape = RoundedCornerShape(16.dp),
                                color = Color(0xFF27243D),
                                modifier = Modifier.clickable {
                                    selectedLanguage = if (selectedLanguage == Language.ENGLISH) Language.HINDI else Language.ENGLISH
                                }
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 9.dp, vertical = 5.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(
                                        Icons.Default.Translate,
                                        contentDescription = "Language",
                                        tint = Color(0xFFB8A9FF),
                                        modifier = Modifier.size(13.dp)
                                    )
                                    Spacer(Modifier.width(4.dp))
                                    Text(
                                        text = selectedLanguage.displayName,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = Color.White
                                    )
                                }
                            }
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color(0xFF0B0C10))
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { isFloatingModeActive = !isFloatingModeActive },
                containerColor = if (isFloatingModeActive) Color(0xFF70D6C2) else Color(0xFF8F80F5),
                contentColor = Color.Black,
                shape = CircleShape,
                modifier = Modifier.size(50.dp)
            ) {
                Icon(
                    if (isFloatingModeActive) Icons.Default.SmartToy else Icons.Default.GraphicEq,
                    contentDescription = "Floating Assistant Mode"
                )
            }
        },
        bottomBar = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0xFF0B0C10))
                    .windowInsetsPadding(WindowInsets.navigationBars)
                    .padding(horizontal = 14.dp, vertical = 8.dp)
            ) {
                AnimatedVisibility(visible = listeningError != null) {
                    listeningError?.let {
                        Text(
                            text = it,
                            color = Color(0xFFFF8B8B),
                            fontSize = 12.sp,
                            modifier = Modifier.padding(bottom = 6.dp)
                        )
                    }
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    OutlinedTextField(
                        value = input,
                        onValueChange = { input = it },
                        modifier = Modifier.weight(1f),
                        placeholder = {
                            Text(
                                if (selectedLanguage == Language.HINDI) "STRANGER को संदेश भेजें…" else "Message STRANGER…",
                                color = Color(0xFF6B7082),
                                fontSize = 14.sp
                            )
                        },
                        shape = RoundedCornerShape(24.dp),
                        maxLines = 4,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Color(0xFF9B8CFF),
                            unfocusedBorderColor = Color(0xFF2C3042),
                            focusedContainerColor = Color(0xFF151720),
                            unfocusedContainerColor = Color(0xFF151720),
                            focusedTextColor = Color(0xFFF3F1FD),
                            unfocusedTextColor = Color(0xFFF3F1FD)
                        ),
                        keyboardOptions = KeyboardOptions(imeAction = ImeAction.Send),
                        keyboardActions = KeyboardActions(onSend = { handleUserSubmission(input) })
                    )

                    Spacer(Modifier.width(8.dp))

                    // Speech recognition button with language locale
                    IconButton(
                        onClick = {
                            val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                                putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                                putExtra(RecognizerIntent.EXTRA_LANGUAGE, selectedLanguage.speechLocale)
                                putExtra(RecognizerIntent.EXTRA_PROMPT, if (selectedLanguage == Language.HINDI) "STRANGER से बोलें" else "Speak to STRANGER")
                            }
                            try {
                                speechLauncher.launch(intent)
                            } catch (_: Exception) {
                                listeningError = "No speech recognition app is available on this phone."
                            }
                        },
                        modifier = Modifier
                            .size(46.dp)
                            .background(Color(0xFF252238), CircleShape)
                            .border(1.dp, Color(0xFF4C4570), CircleShape)
                    ) {
                        Icon(
                            Icons.Default.Mic,
                            contentDescription = "Voice input",
                            tint = Color(0xFFB8A9FF)
                        )
                    }

                    Spacer(Modifier.width(6.dp))

                    // Send button
                    IconButton(
                        onClick = { handleUserSubmission(input) },
                        modifier = Modifier
                            .size(46.dp)
                            .background(Color(0xFF8F80F5), CircleShape)
                    ) {
                        Icon(
                            Icons.AutoMirrored.Filled.Send,
                            contentDescription = "Send",
                            tint = Color.Black
                        )
                    }
                }

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 6.dp, start = 4.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Redmi 13C 5G · Low-overhead mode · Allow-list enforced",
                        color = Color(0xFF6B7082),
                        fontSize = 10.sp
                    )
                    Text(
                        text = "Zero arbitrary code",
                        color = Color(0xFF70D6C2),
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Medium
                    )
                }
            }
        },
        containerColor = Color(0xFF0B0C10)
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 16.dp)
        ) {
            // Floating Assistant Banner simulation
            AnimatedVisibility(visible = isFloatingModeActive) {
                Surface(
                    color = Color(0xFF1E2835),
                    shape = RoundedCornerShape(12.dp),
                    border = BorderStroke(1.dp, Color(0xFF70D6C2)),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 12.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.SmartToy, contentDescription = null, tint = Color(0xFF70D6C2), modifier = Modifier.size(18.dp))
                        Spacer(Modifier.width(8.dp))
                        Text(
                            "Floating Assistant Bubble active. Tap anywhere to interact over other apps (M6 capability).",
                            color = Color(0xFFE0F4EE),
                            fontSize = 11.sp
                        )
                    }
                }
            }

            // System Status Card
            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFF151720)),
                shape = RoundedCornerShape(16.dp),
                border = BorderStroke(1.dp, Color(0xFF262A3B)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(Modifier.padding(14.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Security, contentDescription = null, tint = Color(0xFF70D6C2), modifier = Modifier.size(16.dp))
                            Spacer(Modifier.width(6.dp))
                            Text("SECURITY & ARCHITECTURE", fontSize = 10.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp, color = Color(0xFF8F93A3))
                        }
                        Surface(
                            color = Color(0xFF1B332C),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Text(
                                "M1 VERIFIED",
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp),
                                color = Color(0xFF70D6C2),
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                    Spacer(Modifier.height(8.dp))
                    Text(
                        text = "Android Shell Active · Tool-calling Allow-list Enforced",
                        color = Color(0xFFF3F1FD),
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                    Text(
                        text = "Next: M2 Gemini reasoning engine with secure Cloud API keys.",
                        color = Color(0xFF9A9CAB),
                        fontSize = 11.sp
                    )
                }
            }

            Spacer(Modifier.height(12.dp))

            // Quick command ideas
            Text(
                text = if (selectedLanguage == Language.HINDI) "सुझाए गए आदेश" else "QUICK COMMAND SUGGESTIONS",
                color = Color(0xFF787D91),
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.sp
            )
            Spacer(Modifier.height(6.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                AssistChip(
                    onClick = { handleUserSubmission("Download syllabus notes PDF") },
                    label = { Text("Download PDF", fontSize = 11.sp) },
                    colors = AssistChipDefaults.assistChipColors(
                        containerColor = Color(0xFF1C1E2B),
                        labelColor = Color(0xFFB8A9FF)
                    )
                )
                AssistChip(
                    onClick = { handleUserSubmission("Share document on WhatsApp") },
                    label = { Text("WhatsApp Share", fontSize = 11.sp) },
                    colors = AssistChipDefaults.assistChipColors(
                        containerColor = Color(0xFF1C1E2B),
                        labelColor = Color(0xFF70D6C2)
                    )
                )
                AssistChip(
                    onClick = { handleUserSubmission("Search web for Android 15 news") },
                    label = { Text("Web Search", fontSize = 11.sp) },
                    colors = AssistChipDefaults.assistChipColors(
                        containerColor = Color(0xFF1C1E2B),
                        labelColor = Color(0xFFE2E4EC)
                    )
                )
            }

            Spacer(Modifier.height(10.dp))

            // Message List
            LazyColumn(
                state = listState,
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(messages, key = { it.id }) { message ->
                    MessageBubbleItem(
                        message = message,
                        onConfirmAction = { task ->
                            messages.add(
                                ChatMessage(
                                    text = "Action '${task.actionProposal?.toolName}' confirmed by user. Gated execution permitted.",
                                    fromUser = false,
                                    language = selectedLanguage
                                )
                            )
                        },
                        onCancelAction = { task ->
                            messages.add(
                                ChatMessage(
                                    text = "Action '${task.actionProposal?.toolName}' was cancelled by user.",
                                    fromUser = false,
                                    language = selectedLanguage
                                )
                            )
                        }
                    )
                }
            }
        }
    }

    // Memory Dialog
    if (showMemoryDialog) {
        AlertDialog(
            onDismissRequest = { showMemoryDialog = false },
            title = {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Psychology, contentDescription = null, tint = Color(0xFF70D6C2))
                    Spacer(Modifier.width(8.dp))
                    Text("Stored Memory & Preferences", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                }
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(
                        "STRANGER stores user-approved preferences locally. You can review or delete any stored memory item:",
                        color = Color(0xFF9A9CAB),
                        fontSize = 12.sp
                    )
                    Spacer(Modifier.height(4.dp))
                    memories.forEach { memory ->
                        Surface(
                            color = Color(0xFF1E212E),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(8.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(memory.key, fontWeight = FontWeight.Bold, fontSize = 11.sp, color = Color(0xFFB8A9FF))
                                    Text(memory.value, fontSize = 12.sp, color = Color(0xFFF3F1FD))
                                }
                                IconButton(
                                    onClick = { memories.remove(memory) },
                                    modifier = Modifier.size(30.dp)
                                ) {
                                    Icon(Icons.Default.Delete, contentDescription = "Delete", tint = Color(0xFFFF8B8B), modifier = Modifier.size(16.dp))
                                }
                            }
                        }
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = { showMemoryDialog = false }) {
                    Text("Close", color = Color(0xFF9B8CFF))
                }
            },
            containerColor = Color(0xFF151720)
        )
    }
}

@Composable
private fun MessageBubbleItem(
    message: ChatMessage,
    onConfirmAction: (AgentTask) -> Unit,
    onCancelAction: (AgentTask) -> Unit
) {
    val timeFormat = remember { SimpleDateFormat("HH:mm", Locale.getDefault()) }
    val formattedTime = remember(message.timestamp) { timeFormat.format(Date(message.timestamp)) }

    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = if (message.fromUser) Arrangement.End else Arrangement.Start
    ) {
        Column(
            modifier = Modifier.fillMaxWidth(0.9f),
            horizontalAlignment = if (message.fromUser) Alignment.End else Alignment.Start
        ) {
            Surface(
                color = if (message.fromUser) Color(0xFF312A54) else Color(0xFF191C27),
                shape = RoundedCornerShape(
                    topStart = 16.dp,
                    topEnd = 16.dp,
                    bottomEnd = if (message.fromUser) 4.dp else 16.dp,
                    bottomStart = if (message.fromUser) 16.dp else 4.dp
                ),
                border = BorderStroke(
                    1.dp,
                    if (message.fromUser) Color(0xFF4C427E) else Color(0xFF282C3D)
                )
            ) {
                Column(modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp)) {
                    Text(
                        text = message.text,
                        color = Color(0xFFF3F1FD),
                        fontSize = 14.sp,
                        lineHeight = 20.sp
                    )

                    // Render task proposal card if present
                    message.task?.let { task ->
                        Spacer(Modifier.height(10.dp))
                        TaskCardView(
                            task = task,
                            onConfirm = { onConfirmAction(task) },
                            onCancel = { onCancelAction(task) }
                        )
                    }

                    Spacer(Modifier.height(4.dp))
                    Text(
                        text = formattedTime,
                        fontSize = 9.sp,
                        color = Color(0xFF8F93A3),
                        modifier = Modifier.align(Alignment.End)
                    )
                }
            }
        }
    }
}

@Composable
private fun TaskCardView(
    task: AgentTask,
    onConfirm: () -> Unit,
    onCancel: () -> Unit
) {
    Surface(
        color = Color(0xFF12141D),
        shape = RoundedCornerShape(12.dp),
        border = BorderStroke(1.dp, Color(0xFF2D3247)),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = task.title,
                    fontWeight = FontWeight.Bold,
                    fontSize = 12.sp,
                    color = Color(0xFF9B8CFF)
                )
                Text(
                    text = task.status.name,
                    fontSize = 9.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = when (task.status) {
                        TaskStatus.AWAITING_CONFIRMATION -> Color(0xFFFFB84D)
                        TaskStatus.RUNNING -> Color(0xFF70D6C2)
                        TaskStatus.COMPLETED -> Color(0xFF70D6C2)
                        else -> Color(0xFF8F93A3)
                    }
                )
            }

            Text(
                text = task.summary,
                fontSize = 11.sp,
                color = Color(0xFFB5B8C7),
                fontFamily = FontFamily.Monospace,
                modifier = Modifier.padding(vertical = 4.dp)
            )

            // Step List
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                task.steps.forEachIndexed { index, step ->
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.padding(vertical = 2.dp)
                    ) {
                        Text(
                            text = "${index + 1}.",
                            fontSize = 10.sp,
                            color = Color(0xFF8F93A3),
                            modifier = Modifier.width(18.dp)
                        )
                        Text(
                            text = step.title,
                            fontSize = 11.sp,
                            color = if (step.status == StepStatus.DONE) Color(0xFF70D6C2) else Color(0xFFE2E4EC),
                            modifier = Modifier.weight(1f)
                        )
                        when (step.status) {
                            StepStatus.DONE -> Icon(Icons.Default.Check, contentDescription = null, tint = Color(0xFF70D6C2), modifier = Modifier.size(14.dp))
                            StepStatus.RUNNING -> CircularProgressIndicator(modifier = Modifier.size(12.dp), strokeWidth = 1.5.dp, color = Color(0xFF9B8CFF))
                            else -> Text("WAIT", fontSize = 9.sp, color = Color(0xFF6B7082))
                        }
                    }
                }
            }

            // Confirmation Gate Actions
            if (task.requiresConfirmation) {
                Spacer(Modifier.height(8.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End
                ) {
                    OutlinedButton(
                        onClick = onCancel,
                        modifier = Modifier.height(32.dp),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFFFF8B8B))
                    ) {
                        Icon(Icons.Default.Close, contentDescription = null, modifier = Modifier.size(12.dp))
                        Spacer(Modifier.width(4.dp))
                        Text("Cancel", fontSize = 11.sp)
                    }
                    Spacer(Modifier.width(8.dp))
                    Button(
                        onClick = onConfirm,
                        modifier = Modifier.height(32.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF8F80F5))
                    ) {
                        Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(12.dp), tint = Color.Black)
                        Spacer(Modifier.width(4.dp))
                        Text("Confirm & Execute", fontSize = 11.sp, color = Color.Black, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
