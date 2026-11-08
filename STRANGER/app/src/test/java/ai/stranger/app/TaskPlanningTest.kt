package ai.stranger.app

import ai.stranger.app.data.model.AgentTask
import ai.stranger.app.data.model.Language
import ai.stranger.app.data.model.StepStatus
import ai.stranger.app.data.model.TaskStatus
import ai.stranger.app.data.model.TaskStep
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class TaskPlanningTest {

    @Test
    fun testTaskPlanningTransitions() {
        val step1 = TaskStep(title = "Parse user request in Hindi/English", status = StepStatus.DONE)
        val step2 = TaskStep(title = "Formulate tool action proposal", status = StepStatus.RUNNING)
        val step3 = TaskStep(title = "Prompt user confirmation", status = StepStatus.QUEUED)

        val task = AgentTask(
            title = "Download AKTU PDF",
            summary = "Downloading syllabus from university portal",
            steps = listOf(step1, step2, step3),
            status = TaskStatus.RUNNING,
            requiresConfirmation = true
        )

        assertEquals(3, task.steps.size)
        assertEquals(StepStatus.DONE, task.steps[0].status)
        assertEquals(StepStatus.RUNNING, task.steps[1].status)
        assertTrue(task.requiresConfirmation)
    }

    @Test
    fun testLanguageSelectionLocales() {
        assertEquals("en-IN", Language.ENGLISH.speechLocale)
        assertEquals("hi-IN", Language.HINDI.speechLocale)
    }
}
