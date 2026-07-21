---
title: "meshworks"
type: "Hackathon"
description: "NLP LoRa Mesh Network for Emergency Response (TreeHacks 2024)"
publishedAt: "2024-02-18"
heroImage: "/api/content-image?path=meshworks/meshworks_device-nodes.jpg"
award: "1st Place — Intel: Best Use of Intel Developer Cloud"
figures:
  - src: "/api/content-image?path=meshworks/meshworks_architecture.png"
    caption: "Meshworks system architecture"
    id: "FIG-001"
  - src: "/api/content-image?path=meshworks/meshworks_command-ui.jpg"
    caption: "Command UI speech to text and NLP"
    id: "FIG-002"
  - src: "/api/content-image?path=meshworks/meshworks_satellite-damage-assessment.jpg"
    caption: "Command UI Al satellite imagery damage assessment and automatic network notification demo"
    id: "FIG-003"
  - src: "/api/content-image?path=meshworks/meshworks_group-photo.jpg"
    caption: "Group photo"
    id: "FIG-004"
  - src: "/api/content-image?path=meshworks/meshworks_white-board.jpg"
    caption: "Near-final architecture"
    id: "FIG-005"
  - src: "/api/content-image?path=meshworks/meshworks_device-node-demo.jpg"
    caption: "Device node demo"
    id: "FIG-006"
  - src: "/api/content-image?path=meshworks/meshworks_build.jpg"
    caption: "In-progress build"
    id: "FIG-007"
  - src: "/api/content-image?path=meshworks/meshworks_lora-testbed.jpg"
    caption: "LoRa testbed"
    id: "FIG-008"
  - src: "/api/content-image?path=meshworks/meshworks_lora-first-light.jpg"
    caption: "First LoRa message over custom driver"
    id: "FIG-009"
  - src: "/api/content-image?path=meshworks/meshworks_first-architecture.jpg"
    caption: "Initial project idea and architecture (approx 1 hour into TreeHacks)"
    id: "FIG-010"
---
## Overview
In times of disaster, the capacity of rigid networks like cell service and internet dramatically decreases at the same time demand increases as people try to get information and contact loved ones. This can lead to crippled telecom services which can significantly impact first responders in disaster struck areas, especially in dense urban environments where traditional radios don't work well.

Meshworks addresses this problem by creating a resilient, self-healing mesh network using LoRa radio technology. Device nodes in the field network to each other and to the command node through LoRa to send messages, which increases range and resiliency as more device nodes join. The command & control center receives summarized reports from the field, visualized on an interactive map.
## Technical Specifications
- **Frequency**: 915 MHz (ISM)
- **Hardware**: Wio Terminal, LoRa modules (Seeed Studio), magnetometer
- **Language**: CircuitPython, Python, Flask
- **AI/ML**: Whisper (STT), Prediction Guard (NLP), PyTorch, Intel Extension for PyTorch
## Key Features
- **LoRa Mesh Networking**: Custom packet routing and priority protocol enables long-range, resilient communication between nodes
- **Speech-to-Text**: Whisper integration for voice message transcription in the field
- **NLP Summarization**: Prediction Guard LLM provides summarization, keyword extraction, and command extraction from field reports
- **Satellite Imagery Analysis**: Neural network trained on Intel Developer Cloud performs binary image classification to distinguish damaged and undamaged buildings
- **Direction Sensing**: Integrated magnetometer to demo telemetry as a stand in for GNSS
## Architectural Overview
The system consists of two main components: distributed device nodes and a central command node/server.

**Device Nodes**: Built using Wio Terminals with LoRa modules and magnetometers. I architected the mesh network system and wrote the node firmware in CircuitPython, including custom magnetometer and LoRa modem drivers, the packet routing and priority protocol, and the protocol to interface with the Command node. I also soldered the modules together and designed the enclosure in Fusion360.

**Command Node**: A Flask-based web dashboard running on Ubuntu Server that receives, processes, and visualizes field reports. Uses Intel-optimized AI models for efficient speech-to-text processing and natural language understanding.
## Challenges
The limited RAM and storage of microcontrollers made it more difficult to record audio and run TinyML as we intended. Many modules, especially the LoRa and magnetometer, did not have existing CircuitPython libraries so these needed to be written from scratch by reading datasheets, which added significant complexity to the project given the short hackathon timeline.
## Future Work
- Improve audio quality captured by the Wio Terminal and move edge-processing of speech-to-text to increase transmission speed and reduce bandwidth use
- Add a high-speed 2.4 GHz LoRa network to allow for voice communication between first responders in a localized area
- Integrate the microcontroller and LoRa modules onto a single board with GPS to improve ease of transportation and reliability
## Status
**COMPLETE** — 1st Place, Intel: Best Use of Intel Developer Cloud at TreeHacks 2024 ([Devpost](https://devpost.com/software/meshworks-nlp-lora-mesh-network-for-emergency-response))
