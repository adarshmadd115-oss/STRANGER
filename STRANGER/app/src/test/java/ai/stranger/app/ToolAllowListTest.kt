package ai.stranger.app

import ai.stranger.app.data.model.RiskLevel
import ai.stranger.app.security.ToolAllowList
import ai.stranger.app.security.ToolValidationResult
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class ToolAllowListTest {

    @Test
    fun testRejectArbitraryCommands() {
        val result = ToolAllowList.validateProposal("execute_shell", mapOf("command" to "rm -rf /"))
        assertTrue("Arbitrary shell execution must be rejected", result is ToolValidationResult.Rejected)
    }

    @Test
    fun testRejectSystemCommandExecution() {
        val result = ToolAllowList.validateProposal("system_eval", mapOf("code" to "println(1)"))
        assertTrue("Arbitrary code execution must be rejected", result is ToolValidationResult.Rejected)
    }

    @Test
    fun testValidOpenApp() {
        val result = ToolAllowList.validateProposal("open_app", mapOf("package_name" to "com.whatsapp"))
        assertTrue("Valid package name should pass", result is ToolValidationResult.Valid)
        val valid = result as ToolValidationResult.Valid
        assertEquals("open_app", valid.proposal.toolName)
        assertEquals(RiskLevel.SAFE, valid.proposal.riskLevel)
    }

    @Test
    fun testInvalidPackageNameRejected() {
        val result = ToolAllowList.validateProposal("open_app", mapOf("package_name" to "not-a-valid-pkg; rm"))
        assertTrue("Malformed package name should be rejected", result is ToolValidationResult.Rejected)
    }

    @Test
    fun testDownloadRequiresConfirmation() {
        val result = ToolAllowList.validateProposal("download_file", mapOf("url" to "https://example.com/notes.pdf"))
        assertTrue("Download proposal should be valid", result is ToolValidationResult.Valid)
        val valid = result as ToolValidationResult.Valid
        assertTrue("Download must require user confirmation gate", valid.proposal.requiresConfirmation)
        assertEquals(RiskLevel.NEEDS_CONFIRMATION, valid.proposal.riskLevel)
    }

    @Test
    fun testDownloadRejectsInsecureHttp() {
        val result = ToolAllowList.validateProposal("download_file", mapOf("url" to "http://insecure.com/bad.apk"))
        assertTrue("Insecure HTTP must be rejected", result is ToolValidationResult.Rejected)
    }

    @Test
    fun testShareMediaRequiresConfirmation() {
        val result = ToolAllowList.validateProposal("share_media", mapOf("file_uri" to "content://media/123"))
        assertTrue(result is ToolValidationResult.Valid)
        val valid = result as ToolValidationResult.Valid
        assertTrue("Media sharing must require confirmation", valid.proposal.requiresConfirmation)
    }

    @Test
    fun testStoreAndSearchMemory() {
        val storeResult = ToolAllowList.validateProposal("store_memory", mapOf("key" to "user_name", "value" to "Adarsh"))
        assertTrue(storeResult is ToolValidationResult.Valid)

        val emptyResult = ToolAllowList.validateProposal("store_memory", mapOf("key" to "", "value" to ""))
        assertTrue(emptyResult is ToolValidationResult.Rejected)
    }
}
