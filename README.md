# VidyaVistaar

<p align="center">
  <strong>An AI-powered educational platform for a smarter and more interactive learning experience.</strong>
</p>

<p align="center">
  <a href="https://github.com/sainithinreddy06/VidyaVistaar">
    <img src="https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github" alt="GitHub Repository">
  </a>
  <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.8-blue?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-6-purple?style=for-the-badge&logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/Google%20Gemini-AI-orange?style=for-the-badge&logo=google" alt="Google Gemini">
</p>

---

## Overview

**VidyaVistaar** is a modern web-based educational platform designed to create a more engaging, accessible, and intelligent learning experience for students.

The platform combines a responsive React interface with AI capabilities to create an interactive educational environment. It is designed with a modular component-based architecture, making the application easy to maintain, extend, and integrate with additional educational services.

The project focuses on combining:

- Modern web development
- Artificial Intelligence
- Interactive educational experiences
- Data visualization
- Responsive UI design
- Modular frontend architecture

---

## Key Highlights

- AI-powered educational experience
- Modern and responsive user interface
- Interactive data visualizations
- Component-based React architecture
- Type-safe development with TypeScript
- Fast development and production builds using Vite
- Google Gemini API integration
- Reusable and scalable frontend components
- Modern web application structure
- Environment-based API key configuration

---

## Features

### AI-Powered Learning

VidyaVistaar integrates Google's Generative AI capabilities to provide intelligent educational interactions.

The AI layer can be extended to support:

- Intelligent question answering
- Educational assistance
- Personalized learning support
- Content generation
- Student guidance
- Interactive learning workflows

---

### Interactive User Interface

The application is designed with a modern frontend architecture that focuses on:

- Clean layouts
- Responsive components
- Interactive elements
- Easy navigation
- Reusable UI components
- Consistent user experience

---

### Data Visualization

The project includes **Recharts** for building interactive data visualizations.

This allows the platform to represent educational or student-related information through:

- Charts
- Graphs
- Statistical visualizations
- Progress information
- Interactive data representations

---

### Responsive Design

VidyaVistaar is structured as a modern web application and can be extended to support:

- Desktop devices
- Laptops
- Tablets
- Mobile devices

The component-based architecture makes responsive improvements easier to implement across the application.

---

## Technology Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| React | User interface development |
| TypeScript | Type-safe application development |
| Vite | Development server and build tool |
| React DOM | Rendering React applications |
| Recharts | Data visualization |

### Artificial Intelligence

| Technology | Purpose |
|------------|---------|
| Google Gemini | Generative AI capabilities |
| `@google/genai` | Gemini API integration |

### Development Tools

| Tool | Purpose |
|------|---------|
| Node.js | JavaScript runtime |
| npm | Package management |
| Git | Version control |
| GitHub | Source code hosting |
| VS Code | Development environment |

---

## Architecture

VidyaVistaar follows a modular frontend architecture.

```text
                    ┌─────────────────────┐
                    │       User          │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    React Frontend   │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
       ┌────────────┐   ┌────────────┐   ┌────────────┐
       │ Components │   │   Charts   │   │  Services  │
       └────────────┘   └────────────┘   └──────┬─────┘
                                                │
                                                ▼
                                      ┌──────────────────┐
                                      │ Google Gemini AI │
                                      └──────────────────┘
