# STRANGER — Personal Android AI Agent

STRANGER is a private, security-first personal AI assistant built exclusively for Android (optimized for Redmi 13C 5G: 4 GB physical RAM + 2 GB virtual extension).

## Architecture Overview

```text
User Speech / Text (Hindi or English)
       │
       ▼
Jetpack Compose Chat Shell (Low-RAM, Dark UI)
       │
       ▼
Reasoning Engine (Gemini 2.5/Flash API via Cloud Proxy)
       │
       ▼
Structured Action Proposal (JSON / Tool Call)
       │
       ▼
Security Allow-list & Parameter Validator (Zero arbitrary code/shell)
       │
       ▼
Permission & Confirmation Gate (User approves files, messages, downloads)
       │
       ▼
Native Android Tool Registry
  ├─ Android Sharesheet (WhatsApp, SMS)
  ├─ DownloadManager (HTTPS only)
  ├─ Storage Access Framework / MediaStore
  └─ App Launch Intents
```

## Security Model

1. **Zero Arbitrary Execution**: STRANGER never executes raw shell commands (`sh`, `bash`, `su`) or arbitrary model-generated scripts.
2. **Strict Tool Allow-list**: Only pre-compiled native tool methods (`open_app`, `search_files`, `download_file`, `share_media`, `web_search`, `store_memory`, `view_memories`, `delete_memory`) can be proposed.
3. **Mandatory Confirmation Gate**: All sensitive operations (sending media, downloading files, deleting memories) require an explicit user tap on "Confirm & Execute".
4. **API Key Security**: The Gemini API key is never committed to Git. In production, requests flow through a secure server proxy.

## Development Phases

- **M1**: Android shell and chat interface (Complete & Tested).
- **M2**: Gemini API integration with structured tool-calling.
- **M3**: Android file search, SAF integration, and DownloadManager.
- **M4**: Messaging and media sharing via Android Sharesheet.
- **M5**: Web browsing and multi-step research agent.
- **M6**: Floating assistant overlay and optional accessibility automation.
- **M7**: Performance profiling, RAM optimization, and release APK signing.
