package ai.stranger.app.security

import ai.stranger.app.data.model.ActionProposal
import ai.stranger.app.data.model.RiskLevel

sealed class ToolValidationResult {
    data class Valid(val proposal: ActionProposal) : ToolValidationResult()
    data class Rejected(val reason: String) : ToolValidationResult()
}

object ToolAllowList {
    val ALLOWED_TOOLS = setOf(
        "open_app",
        "search_files",
        "download_file",
        "share_media",
        "web_search",
        "store_memory",
        "view_memories",
        "delete_memory"
    )

    private val PACKAGE_REGEX = Regex("^[a-zA-Z][a-zA-Z0-9_]*(\\.[a-zA-Z][a-zA-Z0-9_]*)+$")
    private val SECURE_URL_REGEX = Regex("^https://[a-zA-Z0-9\\-._~:/?#\\[\\]@!$&'()*+,;=]+$")

    fun validateProposal(toolName: String, args: Map<String, String>): ToolValidationResult {
        val normalized = toolName.trim().lowercase()

        // 1. Strict allow-list check: no shell, system, or arbitrary execution
        if (!ALLOWED_TOOLS.contains(normalized)) {
            return ToolValidationResult.Rejected(
                "Execution rejected: '$toolName' is not in the STRANGER allow-list. Arbitrary code, system calls, and shell commands are strictly forbidden."
            )
        }

        // 2. Validate tool-specific arguments
        return when (normalized) {
            "open_app" -> {
                val pkg = args["package_name"]?.trim()
                if (pkg.isNullOrBlank()) {
                    ToolValidationResult.Rejected("Missing required 'package_name' parameter.")
                } else if (!PACKAGE_REGEX.matches(pkg)) {
                    ToolValidationResult.Rejected("Invalid Android package format: '$pkg'.")
                } else {
                    ToolValidationResult.Valid(
                        ActionProposal(
                            toolName = normalized,
                            arguments = args,
                            requiresConfirmation = false,
                            riskLevel = RiskLevel.SAFE
                        )
                    )
                }
            }
            "search_files" -> {
                val query = args["query"]?.trim()
                if (query.isNullOrBlank()) {
                    ToolValidationResult.Rejected("Missing search query.")
                } else {
                    ToolValidationResult.Valid(
                        ActionProposal(
                            toolName = normalized,
                            arguments = args,
                            requiresConfirmation = false,
                            riskLevel = RiskLevel.SAFE
                        )
                    )
                }
            }
            "download_file" -> {
                val url = args["url"]?.trim()
                if (url.isNullOrBlank()) {
                    ToolValidationResult.Rejected("Missing download URL.")
                } else if (!SECURE_URL_REGEX.matches(url)) {
                    ToolValidationResult.Rejected("Insecure URL rejected. Downloads require valid HTTPS protocol.")
                } else {
                    // Downloads require user confirmation gate
                    ToolValidationResult.Valid(
                        ActionProposal(
                            toolName = normalized,
                            arguments = args,
                            requiresConfirmation = true,
                            riskLevel = RiskLevel.NEEDS_CONFIRMATION
                        )
                    )
                }
            }
            "share_media" -> {
                val file = args["file_uri"]?.trim() ?: args["file_path"]?.trim()
                if (file.isNullOrBlank()) {
                    ToolValidationResult.Rejected("Missing file location for share_media.")
                } else {
                    // Sharing files/media requires explicit user confirmation
                    ToolValidationResult.Valid(
                        ActionProposal(
                            toolName = normalized,
                            arguments = args,
                            requiresConfirmation = true,
                            riskLevel = RiskLevel.NEEDS_CONFIRMATION
                        )
                    )
                }
            }
            "web_search" -> {
                val query = args["query"]?.trim()
                if (query.isNullOrBlank()) {
                    ToolValidationResult.Rejected("Missing query for web search.")
                } else {
                    ToolValidationResult.Valid(
                        ActionProposal(
                            toolName = normalized,
                            arguments = args,
                            requiresConfirmation = false,
                            riskLevel = RiskLevel.SAFE
                        )
                    )
                }
            }
            "store_memory" -> {
                val key = args["key"]?.trim()
                val value = args["value"]?.trim()
                if (key.isNullOrBlank() || value.isNullOrBlank()) {
                    ToolValidationResult.Rejected("store_memory requires non-empty key and value.")
                } else {
                    ToolValidationResult.Valid(
                        ActionProposal(
                            toolName = normalized,
                            arguments = args,
                            requiresConfirmation = false,
                            riskLevel = RiskLevel.SAFE
                        )
                    )
                }
            }
            "view_memories" -> {
                ToolValidationResult.Valid(
                    ActionProposal(
                        toolName = normalized,
                        arguments = emptyMap(),
                        requiresConfirmation = false,
                        riskLevel = RiskLevel.SAFE
                    )
                )
            }
            "delete_memory" -> {
                val key = args["key"]?.trim()
                if (key.isNullOrBlank()) {
                    ToolValidationResult.Rejected("delete_memory requires a key.")
                } else {
                    ToolValidationResult.Valid(
                        ActionProposal(
                            toolName = normalized,
                            arguments = args,
                            requiresConfirmation = true,
                            riskLevel = RiskLevel.NEEDS_CONFIRMATION
                        )
                    )
                }
            }
            else -> ToolValidationResult.Rejected("Unsupported tool: $toolName")
        }
    }
}
