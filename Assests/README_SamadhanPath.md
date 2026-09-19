# SamadhanPath

> \*\*One problem. One entry point. The right department. Tracked resolution.\*\*

SamadhanPath is an AI-assisted government service orchestration and civic grievance platform designed for **Government Platform Integration \& Interoperability**. It provides citizens with a single digital entry point for reporting public-service issues while intelligently routing requests to the correct department or authority.

The platform is designed as a **general-purpose, pan-India solution**. It is not tied to any specific state, municipality, department, or government body and can be adapted for different administrative structures across the country.

\---

## SIH Problem Statement

**Problem Statement Code:** `SIH26129`  
**Title:** Government Platform Integration \& Interoperability

### Problem

Government services are often distributed across independent portals, applications, departments, and databases.

A citizen may need to interact separately with municipal services, electricity, water, roads, sanitation, property services, welfare systems, and other public authorities. These platforms may not communicate effectively with one another.

Citizens should not need to understand the internal structure of government just to report a problem.

### SamadhanPath Approach

```text
Citizen
   ↓
Text / Image / Voice / Location
   ↓
AI Validation \& Classification
   ↓
Duplicate + Priority Detection
   ↓
Department Identification
   ↓
Local Authority + Supervisory Department
   ↓
Officer / Contractor Action
   ↓
Government Verification
   ↓
Citizen Confirmation
   ↓
Complaint Closed / Reopened
   ↓
Analytics, Hotspots \& Preventive Insights
```

The long-term goal is to connect existing government platforms rather than force every department to replace its current system.

\---

## Core Vision

Instead of:

```text
Citizen → Search Department → Find Portal → Register Again → Submit → Follow Up Manually
```

SamadhanPath aims for:

```text
Citizen → Report Problem Once → System Identifies Authority → Routed Automatically → Track Resolution
```

\---

## Key Features

### 1\. AI Complaint Intelligence

* Complaint validation
* Automatic issue classification
* Department identification
* Duplicate complaint detection
* Master Issue creation
* Severity and priority detection
* Emergency issue detection
* Suspicious or low-context complaint indication
* Image-assisted civic issue analysis
* Location-based analysis

### 2\. Unified Citizen Portal

Citizens can:

* Register and log in securely
* Submit complaints
* Add descriptions
* Upload images or evidence
* Share GPS location
* Select a location manually
* Receive a unique complaint ID
* Track complaint status
* View complaint history
* Receive notifications
* View resolution evidence
* Confirm whether an issue is resolved
* Reopen unresolved complaints
* Submit feedback

### 3\. Intelligent Department Routing

SamadhanPath identifies the appropriate department using complaint category, text, location, severity, jurisdiction, and department mappings. Authorized officers can manually correct routing when required.

### 4\. Dual-Level Government Governance

```text
Head Department = Monitor + Supervise
Local Authority  = Act + Resolve
```

This supports local execution together with supervisory monitoring, SLA visibility, escalations, and department performance tracking.

### 5\. Department Dashboards

The platform supports configurable department-specific dashboards, including:

* Electricity
* Road
* Water
* Sanitation
* Drainage
* Public infrastructure
* Other government departments

### 6\. SLA \& Escalation Management

* Priority-based SLA assignment
* SLA countdown
* Delayed complaint alerts
* Automatic escalation
* Higher-authority visibility
* Emergency workflow
* Critical issue prioritization

### 7\. Contractor \& Contract Accountability

Where asset and contract data is available:

```text
Complaint
   ↓
Asset
   ↓
Contract
   ↓
DLP / Maintenance Period
   ↓
Contractor
   ↓
Inspection
```

The platform should only indicate **Potential Contractual Liability — Inspection Required** until responsibility is verified.

### 8\. Verified Resolution

```text
Officer / Contractor Completes Work
                ↓
       Government Inspection
                ↓
        Citizen Confirmation
          ↙             ↘
      Resolved      Not Resolved
         ↓               ↓
       Closed          Reopened
```

### 9\. Civic Hotspot \& Zone Intelligence

The system can analyze complaints across levels such as State → District → City → Zone → Ward → Local Authority.

Possible analytics include complaint density, issue heatmaps, resolution rates, recurring complaints, high-risk zones, department performance, repeated asset failures, and root-cause indicators.

### 10\. Recurring Problem Intelligence

SamadhanPath is designed to move from:

> "Repair the complaint."

to:

> "Understand why this problem keeps happening."

It can support repeated complaint detection, recurring issue timelines, repeated asset failures, maintenance-failure indicators, and preventive-action planning.

\---

## User Roles

|Role|Main Responsibility|
|-|-|
|Citizen|Report, track, verify and provide feedback|
|Field Officer / Engineer|Inspect, update progress and upload evidence|
|Local Authority|Receive, assign, act and resolve|
|Department Admin|Manage department complaints and officers|
|Head Department|Monitor SLAs, escalations and performance|
|Contractor|Handle assigned contractual repair work|
|System Admin|Manage users, roles, departments, rules and configuration|

\---

## Platform Modules

### Public Website

Home, About, Features, How It Works, Departments, Contact, Login / Signup, and general project information.

### Citizen Portal

Dashboard, New Complaint, My Complaints, Complaint Details, Complaint Timeline, Notifications, Verification, Feedback, and Profile.

### Authority Portal

Dashboard, Complaint Queue, Complaint Details, Assignment, Inspection, SLA Monitoring, Escalation, Verification, Analytics, and Department Performance.

### Head Department Dashboard

Department-wide overview, SLA compliance, escalations, zone comparisons, hotspot analytics, recurring issue intelligence, contractor performance, and citizen satisfaction trends.

### Contractor Portal

Assigned work, contract details, DLP context, repair progress, completion evidence, inspection results, and performance history.

### Admin Console

Users, Roles, Departments, Authorities, Geographic Hierarchy, Categories, SLA Rules, Contracts, Audit Logs, and System Settings.

\---

# Technology Stack

## Frontend

### React

Used to build reusable and dynamic interfaces such as dashboards, complaint forms, login screens, and analytics views.

### JavaScript / JSX

Used for application logic, components, events, API communication, and dynamic rendering.

### Vite

Used as the frontend development and build tool with fast local development and optimized production builds.

### Tailwind CSS

Used for responsive layouts, dashboards, typography, spacing, and modern UI design.

### React Router

Used for navigation between application pages and role-based dashboards.

### Axios

Used for communication between the React frontend and backend APIs.

### Leaflet / React-Leaflet

Used for maps, complaint locations, geographic visualization, and hotspot views.

### Recharts

Used for charts such as complaint trends, status distributions, and department performance.

### Framer Motion / GSAP

Used for animations and interactive transitions.

### jsPDF

Used for generating downloadable PDF reports where required.

\---

## Backend

### Python

Used for backend business logic, AI/ML services, data processing, routing intelligence, and API handling.

### Flask

Used as the backend web framework for REST APIs, authentication, complaints, department officers, workers, governance, and notification services.

\---

## Database

### MongoDB / MongoDB Atlas

Used to store:

* Users
* Complaints
* Departments
* Officers
* Workers
* Assignments
* Complaint history
* Notifications
* AI results
* Audit information

MongoDB is suitable because complaint data may contain flexible structures such as text, coordinates, evidence metadata, AI results, and workflow history.

\---

# AI / Machine Learning Stack

### YOLOv8 / Ultralytics

Used for computer-vision experimentation and image-based civic issue recognition.

### PyTorch

Used as a deep-learning foundation for AI/computer-vision models.

### scikit-learn

Used for traditional machine-learning tasks such as classification and sentiment analysis.

### OpenCV

Used for image preprocessing and computer-vision operations.

### NLP / Text Intelligence

Used for complaint text analysis, classification, sentiment analysis, priority calculation, and smart assignment.

\---

# Backend Service Architecture

```text
backend/
│
├── database/
├── models/
├── routes/
├── services/
├── utils/
├── ML model files
└── application entry point
```

### Database Layer

Handles database connection, persistence, and query operations.

### Models

Define logical data entities such as User, Complaint, Department, Worker, Assignment, and Notification.

### Routes

Expose APIs for authentication, complaints, department officers, workers, admins, governance, and notifications.

### Services

Contain reusable business and AI logic such as text AI, image AI, sentiment analysis, priority calculation, and smart worker assignment.

\---

# AI Processing Flow

```text
Citizen Complaint
       ↓
Text / Image / Location
       ↓
Validation
       ↓
Classification
       ↓
Department Prediction
       ↓
Severity / Priority
       ↓
Duplicate Check
       ↓
Routing
       ↓
Authority Dashboard
```

AI recommendations should remain reviewable by authorized government users.

\---

# Complaint Lifecycle

```text
Submitted
   ↓
AI Processing
   ↓
Acknowledged
   ↓
Assigned
   ↓
In Progress
   ↓
Work Completed
   ↓
Government Verified
   ↓
Citizen Confirmation
   ↓
Closed
```

Alternative states may include Reopened, Escalated, Reassigned, Duplicate/Merged, and Emergency.

\---

# Authentication \& Security

The system includes or is designed around:

* Secure login
* OTP authentication
* JWT-based sessions
* Password hashing using Bcrypt
* Role-based access control
* Protected backend routes
* Audit trails
* Action history
* Secure APIs
* HTTPS
* Evidence access restrictions

> Production deployments should keep all credentials, API keys, database URLs, JWT secrets, and service keys in environment variables. Secrets must never be committed to the public repository.

\---

# Interoperability Architecture

A major future direction of SamadhanPath is integration with existing government systems.

```text
Existing Government Portal
         ↕
 SamadhanPath Connector
         ↕
 Common Data Model
         ↕
 Workflow / AI Engine
```

The platform can maintain:

* SamadhanPath complaint ID
* External system request ID
* Department mapping
* Status mapping
* Synchronization history
* API error logs
* Retry queue

\---

# Current Prototype Scope

The prototype demonstrates the core architecture through:

* Public website
* Authentication flow
* Citizen experience
* Department dashboards
* Electricity department
* Road department
* Role-based redirection
* Complaint workflow concepts
* AI-ready processing
* Dashboard analytics
* Mapping
* Government monitoring concepts

Some production-level integrations, datasets, AI accuracy measurements, and analytics may still use prototype/mock data until real government systems and datasets become available.

\---

# Future Scope

SamadhanPath can be expanded with:

* Real government API integrations
* API Setu compatible connectors
* Federated government identity / SSO
* Multilingual complaint processing
* Voice complaint submission
* WhatsApp integration
* IVR support
* Advanced image-based civic defect recognition
* Real-time GIS analytics
* Predictive complaint forecasting
* Digital Asset Passport
* Contractor/DLP integration
* IoT-based automated reporting
* Event-driven government notifications
* Advanced SLA engines
* Data-quality validation
* Department workload prediction
* Root-cause analytics
* Preventive governance dashboards
* National-scale deployment

\---

# Development Lifecycle

```text
Requirement Analysis
        ↓
System Design
        ↓
Implementation
        ↓
Testing
        ↓
Deployment
        ↓
Maintenance
```

\---

# Local Development

## 1\. Clone the Repository

```bash
git clone https://github.com/Shivansh-52/Jansetu.git
cd Jansetu
```

## 2\. Install Frontend Dependencies

From the directory containing `package.json`:

```bash
npm install
npm run dev
```

## 3\. Install Backend Dependencies

Create a virtual environment:

```bash
python -m venv venv
```

### Windows

```bash
venv\\Scripts\\activate
```

### macOS / Linux

```bash
source venv/bin/activate
```

Install requirements:

```bash
pip install -r requirements.txt
```

Run the Flask backend using the repository's application entry point.

## 4\. Configure Environment Variables

Example:

```env
MONGODB\_URI=your\_mongodb\_connection
JWT\_SECRET=your\_secure\_secret
FRONTEND\_URL=your\_frontend\_url
```

Additional environment variables may be required for email, AI services, storage, notifications, or external APIs.

\---

# Deployment

**Live Prototype:**  
https://jansetu-nq8s.onrender.com/

Possible production architecture:

```text
User Browser
     ↓
React Frontend
     ↓
Flask REST API
     ↓
MongoDB Atlas
     ↓
AI Services / Integrations
```

\---

# Project Resources

## Project Documentation

https://drive.google.com/drive/folders/1ehxjJq3JKIvcc8SlHX06TwH5ty1Dhg93?usp=sharing

Includes research, diagrams, feasibility studies, SDLC documents, acceptance criteria, and technical references.

## Live Prototype

https://jansetu-nq8s.onrender.com/

## Prototype Demonstration

https://drive.google.com/drive/folders/1tkv5C6uyZRkYQMvk8dGtS7vpGJ21Ca27?usp=sharing

Contains a walkthrough of the prototype, user flow, dashboards, and main functionality.

\---

# Research \& Reference Resources

## Government Platforms

* CPGRAMS — https://pgportal.gov.in/
* National Government Services Portal — https://services.india.gov.in/
* API Setu — https://apisetu.gov.in/
* National Portal of India — https://www.india.gov.in/

## Public Data \& Standards

* Open Government Data Platform India — https://data.gov.in/
* Metadata \& Data Standards / API Setu Documentation — https://docs.apisetu.gov.in/document-central/mdds/Introduction.html

## AI \& Machine Learning

* Hugging Face Model Hub — https://huggingface.co/models
* Ultralytics YOLO — https://github.com/ultralytics/ultralytics
* Kaggle Datasets — https://www.kaggle.com/datasets

## AI-Assisted Research

* Claude — https://claude.ai/
* Perplexity — https://www.perplexity.ai/

\---

# Project Status

**Stage:** Working Prototype / Hackathon Development

Production deployment would additionally require verified government datasets, authorized API access, formal security review, infrastructure scaling, integration agreements, and operational validation.

\---

# Final Vision

> \*\*SamadhanPath — From fragmented government services to one intelligent path for resolution.\*\*

The platform aims to evolve from reactive grievance handling into an interoperable, accountable, and eventually predictive governance ecosystem.

