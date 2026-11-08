/**
 * Pure simulation logic for STRANGER personal AI agent
 */

export type Language = 'en' | 'hi';

export interface TaskStep {
  id: string;
  title: string;
  status: 'queued' | 'running' | 'done' | 'failed';
}

export interface ActionProposal {
  toolName: string;
  arguments: Record<string, string>;
  requiresConfirmation: boolean;
  riskLevel: 'safe' | 'needs_confirmation' | 'restricted';
}

export interface AgentTask {
  id: string;
  title: string;
  summary: string;
  steps: TaskStep[];
  status: 'pending' | 'awaiting_confirmation' | 'running' | 'completed' | 'cancelled';
  requiresConfirmation: boolean;
  actionProposal?: ActionProposal;
}

export interface ChatMessage {
  id: string;
  text: string;
  fromUser: boolean;
  timestamp: number;
  language: Language;
  task?: AgentTask;
}

export const ALLOWED_TOOLS = [
  'open_app',
  'search_files',
  'download_file',
  'share_media',
  'web_search',
  'store_memory',
  'view_memories',
  'delete_memory'
] as const;

export function validateToolCall(toolName: string, args: Record<string, string>): {
  valid: boolean;
  reason?: string;
  proposal?: ActionProposal;
} {
  const norm = toolName.trim().toLowerCase();
  if (!ALLOWED_TOOLS.includes(norm as any)) {
    return {
      valid: false,
      reason: `Execution rejected: '${toolName}' is not in the STRANGER allow-list. Shell/arbitrary code execution is strictly forbidden.`
    };
  }

  if (norm === 'download_file') {
    const url = args.url?.trim() || '';
    if (!url.startsWith('https://')) {
      return { valid: false, reason: 'Downloads require a valid secure HTTPS link.' };
    }
    return {
      valid: true,
      proposal: {
        toolName: norm,
        arguments: args,
        requiresConfirmation: true,
        riskLevel: 'needs_confirmation'
      }
    };
  }

  if (norm === 'share_media') {
    return {
      valid: true,
      proposal: {
        toolName: norm,
        arguments: args,
        requiresConfirmation: true,
        riskLevel: 'needs_confirmation'
      }
    };
  }

  return {
    valid: true,
    proposal: {
      toolName: norm,
      arguments: args,
      requiresConfirmation: false,
      riskLevel: 'safe'
    }
  };
}

export function planTaskForInput(input: string, lang: Language): AgentTask | null {
  const lower = input.toLowerCase();

  if (lower.includes('pdf') || lower.includes('download') || lower.includes('डाउनलोड')) {
    return {
      id: 'task-' + Date.now(),
      title: lang === 'hi' ? 'फ़ाइल डाउनलोड योजना' : 'File Download Task',
      summary: 'https://university.edu/syllabus.pdf -> /Download/STRANGER/',
      status: 'awaiting_confirmation',
      requiresConfirmation: true,
      steps: [
        { id: '1', title: lang === 'hi' ? 'यूआरएल और फ़ाइल पैरामीटर पार्स करें' : 'Parse URL & target parameters', status: 'done' },
        { id: '2', title: lang === 'hi' ? 'सुरक्षा अनुमति सूची से पुष्टि' : 'Security allow-list validation', status: 'done' },
        { id: '3', title: lang === 'hi' ? 'उपयोगकर्ता अनुमति की प्रतीक्षा' : 'Awaiting user confirmation gate', status: 'queued' }
      ],
      actionProposal: {
        toolName: 'download_file',
        arguments: { url: 'https://university.edu/syllabus.pdf', filename: 'syllabus.pdf' },
        requiresConfirmation: true,
        riskLevel: 'needs_confirmation'
      }
    };
  }

  if (lower.includes('whatsapp') || lower.includes('message') || lower.includes('शेयर')) {
    return {
      id: 'task-' + Date.now(),
      title: lang === 'hi' ? 'मैसेजिंग व मीडिया शेयर' : 'Messaging & Media Share',
      summary: 'Prepare Android Sharesheet (no silent transmission)',
      status: 'awaiting_confirmation',
      requiresConfirmation: true,
      steps: [
        { id: '1', title: lang === 'hi' ? 'शेयरशीट इंटेंट तैयार करें' : 'Prepare Android Sharesheet intent', status: 'done' },
        { id: '2', title: lang === 'hi' ? 'समीक्षा व प्रेषक पुष्टि' : 'Confirm recipient & payload', status: 'queued' }
      ],
      actionProposal: {
        toolName: 'share_media',
        arguments: { mime_type: 'image/jpeg', action: 'android_sharesheet' },
        requiresConfirmation: true,
        riskLevel: 'needs_confirmation'
      }
    };
  }

  if (lower.includes('search') || lower.includes('खोज')) {
    return {
      id: 'task-' + Date.now(),
      title: lang === 'hi' ? 'वेब खोज कार्य' : 'Web Research Task',
      summary: `Query: "${input.trim()}"`,
      status: 'running',
      requiresConfirmation: false,
      steps: [
        { id: '1', title: lang === 'hi' ? 'खोज क्वेरी को सैनिटाइज़ करें' : 'Sanitize search query', status: 'done' },
        { id: '2', title: lang === 'hi' ? 'वेब ब्राउज़र इंटेंट निष्पादित करें' : 'Execute web browser query', status: 'running' }
      ],
      actionProposal: {
        toolName: 'web_search',
        arguments: { query: input.trim() },
        requiresConfirmation: false,
        riskLevel: 'safe'
      }
    };
  }

  return null;
}
