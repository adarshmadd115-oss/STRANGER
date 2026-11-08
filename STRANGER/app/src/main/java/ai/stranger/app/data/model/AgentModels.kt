package ai.stranger.app.data.model

import java.util.UUID

enum class Language(val code: String, val displayName: String, val speechLocale: String) {
    ENGLISH("en", "English", "en-IN"),
    HINDI("hi", "हिन्दी", "hi-IN")
}

enum class TaskStatus {
    PENDING,
    AWAITING_CONFIRMATION,
    RUNNING,
    COMPLETED,
    FAILED,
    CANCELLED
}

enum class StepStatus {
    QUEUED,
    RUNNING,
    DONE,
    FAILED
}

enum class RiskLevel {
    SAFE,
    NEEDS_CONFIRMATION,
    RESTRICTED
}

data class TaskStep(
    val id: String = UUID.randomUUID().toString(),
    val title: String,
    val status: StepStatus = StepStatus.QUEUED
)

data class ActionProposal(
    val toolName: String,
    val arguments: Map<String, String>,
    val requiresConfirmation: Boolean = true,
    val riskLevel: RiskLevel = RiskLevel.NEEDS_CONFIRMATION
)

data class AgentTask(
    val id: String = UUID.randomUUID().toString(),
    val title: String,
    val summary: String,
    val steps: List<TaskStep>,
    val status: TaskStatus = TaskStatus.PENDING,
    val requiresConfirmation: Boolean = false,
    val actionProposal: ActionProposal? = null
)

data class ChatMessage(
    val id: String = UUID.randomUUID().toString(),
    val text: String,
    val fromUser: Boolean,
    val timestamp: Long = System.currentTimeMillis(),
    val language: Language = Language.ENGLISH,
    val task: AgentTask? = null
)

data class StrangerMemory(
    val id: String = UUID.randomUUID().toString(),
    val key: String,
    val value: String,
    val category: String = "general",
    val timestamp: Long = System.currentTimeMillis()
)
