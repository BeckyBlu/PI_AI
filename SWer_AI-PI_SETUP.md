# SWer_AI-PI: Setup and Integration Instructions

## Step 1: Set Up WSL on Windows
Since **SWer_AI-PI** uses Docker and Rhasspy for voice processing, we’ll create a Linux environment on Windows using WSL.

1. **Install WSL**:
   - Open **PowerShell as Administrator** and run:
     ```powershell
     wsl --install
     ```
   - This installs the default **Ubuntu** distribution.
   - Restart your computer if prompted.

2. **Complete Ubuntu Setup**:
   - After restarting, open a terminal and complete the Ubuntu setup by creating a **username** and **password**.

---

## Step 2: Install Docker in WSL
1. Open your **WSL terminal (Ubuntu)**.

2. **Install Docker**:
   ```bash
   sudo apt update
   sudo apt install -y docker.io
   ```

3. **Start the Docker Service**:
   ```bash
   sudo service docker start
   ```

4. **Add Your User to the Docker Group** (to avoid using `sudo` with Docker):
   ```bash
   sudo usermod -aG docker $USER
   ```
   - Log out and log back in for this change to take effect.

---

## Step 3: Install Rhasspy for Voice Processing
1. In your **WSL terminal**, run the following command to start **Rhasspy** using Docker:
   ```bash
   docker run -d -p 12101:12101 \
     --name rhasspy \
     -v "$HOME/.config/rhasspy/profiles:/profiles" \
     --device /dev/snd:/dev/snd \
     rhasspy/rhasspy
   ```

2. **Access the Rhasspy Web UI**:
   - Open a browser and navigate to: [http://localhost:12101](http://localhost:12101)

---

## Step 4: Configure Speech-to-Text (STT) and Text-to-Speech (TTS) in Rhasspy
1. **Speech-to-Text (STT)**:
   - Use **Vosk** (lightweight and offline).
   - Configure this in the Rhasspy web UI under the **Speech-to-Text** section.

2. **Text-to-Speech (TTS)**:
   - Use **Mimic 3** for high-quality voice cloning.
   - Train a voice model using your recorded audio samples (see **Step 5**).

---

## Step 5: Voice Cloning with Mimic 3
1. **Collect Audio Samples**:
   - Record **15-30 minutes** of your voice.
   - Save these as **.wav files** (16kHz sample rate, mono).

2. **Train a TTS Model**:
   - Install **Mimic 3** in your WSL environment:
     ```bash
     pip install mimic3
     ```
   - Train the model using your recorded audio samples. Follow the **Mimic 3 training guide** for detailed instructions.

3. **Integrate the Model into Rhasspy**:
   - In the Rhasspy web UI, go to the **Text-to-Speech** section.
   - Select **Mimic 3** as the TTS engine.
   - Provide the path to your trained voice model.

---

## Step 6: Integrate Mistral for NLP (SWer_AI-PI Core)
1. **Modify Rhasspy’s Intent Handling**:
   - Edit Rhasspy’s configuration to include a custom script for **SWer_AI-PI**.

2. **Example Script**:
   - Create a Python script (e.g., `swb_integration.py`) in your WSL environment:
     ```python
     import requests

     def query_swb(text):
         url = "https://api.mistral.ai/v1/chat/completions"
         headers = {"Authorization": "Bearer YOUR_MISTRAL_API_KEY"}
         payload = {
             "model": "mistral-medium",
             "messages": [{"role": "user", "content": text}]
         }
         response = requests.post(url, headers=headers, json=payload)
         return response.json()["choices"][0]["message"]["content"]

     def handle_intent(text):
         response = query_swb(text)
         return response
     ```

3. **Configure Rhasspy to Use the Script**:
   - In the Rhasspy web UI, go to the **Intent Handling** section.
   - Configure Rhasspy to call your `handle_intent` function when an intent is detected.

---

## Step 7: Test the Setup
1. Speak to the assistant using the **wake word**.
2. The assistant will:
   - Transcribe your speech (STT).
   - Send the text to **SWer_AI-PI** for NLP.
   - Respond in your cloned voice (TTS).

---

## Step 8: Troubleshooting Tips
- If you encounter issues with **Docker or WSL**, ensure that your WSL distribution is updated and Docker is running correctly.
- Check the **Rhasspy logs** for errors if the assistant isn’t responding as expected.

---

## Next Steps
- **Test and Refine**: Use the assistant and refine the voice model or intents as needed.
- **Deploy**: If you’re happy with the setup, consider deploying it on a **Raspberry Pi** or a local server for continuous use.

---

# System Architecture: Sex Worker Safety Bot (SWB)

## 1. High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface Layer                     │
│  (Web UI / CLI / Desktop App / Mobile-responsive)            │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                   API Gateway Layer                          │
│  (Auth, Rate Limiting, Request Routing)                      │
└────────────────────┬────────────────────────────────────────┘
                     │
     ┌───────────────┼───────────────┐
     │               │               │
┌────▼────┐  ┌──────▼──────┐  ┌────▼─────┐
│  Core   │  │  Community  │  │ Encrypted │
│  Safety │  │  & Peer     │  │ Messaging │
│  Module  │  │  Network    │  │ Service   │
└────┬────┘  └──────┬──────┘  └─────┬─────┘
     │              │              │
┌────▼──────────────▼──────────────▼──────────┐
│         Local Data Layer (SQLite/PouchDB)   │
│  - User Profiles (encrypted)                │
│  - Safety Plans                             │
│  - Resource Library (cached)                │
│  - Community Data (synced, encrypted)       │
└────┬───────────────────────────────────────┘
     │
┌────▼─────────────────────────────────────┐
│    Sync & Backup Engine (End-to-End      │
│    Encrypted, Optional Cloud)             │
└───────────────────────────────────────────┘
```

---

## 2. Core Modules
- **Safety Planning & Client Research**: Risk assessment, public records helper, peer network integration, and documentation tools.
- **Resource Library**: Legal, health, and community resources.
- **Communication & Screening**: Messaging templates, encrypted messaging, and screening workflows.
- **Community & Peer Network**: Peer verification, anonymous sharing, and community governance.
- **Privacy & Security**: Encryption, data minimization, access control, and audit logs.

---

## 3. Technology Stack
| Layer          | Technology               | Why                                      |
|----------------|--------------------------|------------------------------------------|
| **Frontend**   | React / Vue.js + Electron| Cross-platform, offline-first capable    |
| **Mobile**     | React Native / Flutter   | iOS & Android support                    |
| **Backend**    | Node.js / Python         | Lightweight, community-friendly          |
| **Database**   | SQLite / PouchDB         | Offline-first, encrypted                |
| **Encryption** | TweetNaCl.js / libsodium | Industry-standard, audited              |
| **Messaging**  | Matrix/Riot API          | Decentralized, E2E encrypted             |
| **Deployment** | Docker / AppImage        | Multi-OS support                        |
