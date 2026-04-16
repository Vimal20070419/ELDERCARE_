# ElderCare: Clinical Medication Adherence Platform

**ElderCare** is a production-grade MERN stack application designed to monitor and improve medication adherence for elderly patients. It provides a centralized ecosystem where clinicians (doctors), caregivers, and patients collaborate to ensure safety, consistency, and proactive health management.

---

## 🚀 Vision
The platform aims to bridge the gap between prescribed treatment and actual medication intake by leveraging automated reminders, AI-driven risk analysis, and clinical oversight. It identifies high-risk patients before complications arise and provides tools for immediate intervention.

---

## 🛠️ Technology Stack
- **Frontend**: React (Vite), Tailwind CSS (Vanilla CSS Custom Theme), Lucide Icons.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose).
- **Communication**: Simulated SMS Gateway with interactive response triggers.
- **Analytics**: Recharts for adherence visualization.
- **Architecture**: Modular, plugin-based (Immutable Core).

---

## ✨ Key Features

### 1. Multi-Role Ecosystem
- **Doctor Dashboard**: Clinic-wide oversight, patient directory, and high-level clinical risk monitoring.
- **Caregiver Dashboard**: Focused management for assigned patients, real-time alert feed, and medication scheduling.
- **Patient Interface**: Simplified medication checklist, wellness check-ins, and scheduled reminders.

### 2. Intelligent Monitoring & AI Oversight
- **AI Health Risk Scoring**: Proactively calculates a 0-100 risk score based on adherence patterns.
- **Pattern Detection**: Automatically flags 3+ consecutive missed doses or weekly adherence drops below 60%.
- **Clinical Insights**: Generates AI-driven behavioral analysis to help clinicians understand why a patient might be missing doses.

### 3. Interactive Medication Reminders (Extension Layer)
- **Two-Way SMS**: Reminders include interactive prompts ("Reply 1 for Taken, 2 for Missed").
- **Automatic Logging**: SMS replies are automatically synchronized with the patient's adherence log.
- **Escalation Protocol**: If a patient fails to respond within 15 minutes, an automated alert is escalated to their emergency contact.

### 4. Safety & Adherence Tools
- **Drug Interaction Check**: Powered by OpenFDA integration to flag potential conflicts during medication addition.
- **Notification Center**: Real-time bell alerts for clinicians and caregivers.
- **Weekly Reporting**: Comprehensive adherence reports and trend analysis.

---

## 📂 Project Structure
```text
├── backend
│   ├── src
│   │   ├── core         # Server & Express initialization
│   │   ├── modules      # Modular business logic (Auth, Patient, Med, etc.)
│   │   ├── extensions   # Pluggable features (Interactive Reminders)
│   │   ├── services     # External integrations (AI, SMS, OpenFDA)
│   │   └── middleware   # Security and Auth guards
└── frontend
    ├── src
    │   ├── components   # Reusable UI components
    │   ├── pages        # Dashboard views and layouts
    │   ├── hooks        # Context and Auth hooks
    │   └── services     # API communication layers
```

---

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or Atlas)

### Setup
1. **Clone the repository**
2. **Backend**:
   ```bash
   cd backend
   npm install
   # Create .env with MONGO_URI, JWT_SECRET, etc.
   npm run dev
   ```
3. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Default Credentials (for testing)
- **Default Password for New Patients**: `123456`
- **Default Port**: `5173` (Frontend), `5000` (Backend)
