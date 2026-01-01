---
title: "W6YX-AREDN"
type: "Project"
description: "5 GHz AREDN installation @ W6YX West Tower"
publishedAt: "2025-11-24"
heroImage: "/api/content-image?path=site530-AREDN/site530-AREDN_final-ant.jpg"
figures:
  - src: "/api/content-image?path=site530-AREDN/site530-AREDN_sector-diagram.png"
    caption: "Sector antenna diagram"
    id: "FIG-001"
  - src: "/api/content-image?path=site530-AREDN/site530-AREDN_node-diagram.png"
    caption: "Node network topology"
    id: "FIG-002"
  - src: "/api/content-image?path=site530-AREDN/site530-AREDN_power-diagram.png"
    caption: "Power diagram"
    id: "FIG-003"
  - src: "/api/content-image?path=site530-AREDN/site530-AREDN_mechanical-diagram.png"
    caption: "Node mechanical mockup"
    id: "FIG-004"
  - src: "/api/content-image?path=site530-AREDN/site530-AREDN_sector-install1.jpg"
    caption: "Sector antenna install"
    id: "FIG-005"
  - src: "/api/content-image?path=site530-AREDN/site530-AREDN_install-candid.jpg"
    caption: "Sector antenna install"
    id: "FIG-006"
  - src: "/api/content-image?path=site530-AREDN/site530-AREDN_build1.jpg"
    caption: "On-site node build"
    id: "FIG-007"
  - src: "/api/content-image?path=site530-AREDN/site530-AREDN_build2.jpg"
    caption: "On-site node build"
    id: "FIG-008"
  - src: "/api/content-image?path=site530-AREDN/site530-AREDN_node-build-network.jpg"
    caption: "In-progress networking equipment install"
    id: "FIG-009"
  - src: "/api/content-image?path=site530-AREDN/site530-AREDN_node-build-power.jpg"
    caption: "In-progress power equipment install"
    id: "FIG-010"
  - src: "/api/content-image?path=site530-AREDN/site530-AREDN_node-open.jpg"
    caption: "Completed node internals and tower installation"
    id: "FIG-011"
  - src: "/api/content-image?path=site530-AREDN/site530-AREDN_node-closed.jpg"
    caption: "Completed tower installation"
    id: "FIG-012"
  - src: "/api/content-image?path=site530-AREDN/site530-AREDN_pano.jpg"
    caption: "Sunset @ Site 530 West Tower"
    id: "FIG-013"
  - src: "/api/content-image?path=site530-AREDN/site530-AREDN_LTA-blimp.jpg"
    caption: "LTA blimp in air trials, 11/19/2025"
    id: "FIG-014"
  - src: "/api/content-image?path=site530-AREDN/site530-AREDN_sector-install2.jpg"
    caption: "Sector antenna install, day 2"
    id: "FIG-015"
  - src: "/api/content-image?path=site530-AREDN/site530-AREDN_sector-install3.jpg"
    caption: "Sector antenna install, day 2"
    id: "FIG-016"
  - src: "/api/content-image?path=site530-AREDN/site530-AREDN_axis-candid.png"
    caption: "Axis capture of solar panel installation, 11/23/2025"
    id: "FIG-017"
  - src: "/api/content-image?path=site530-AREDN/site530-AREDN_solar-panels.jpg"
    caption: "Completed solar panel installation"
    id: "FIG-018"
---
## Overview
One of my projects as President of the Stanford Amateur Radio Club (W6YX) has been a collaboration with South County ARES and Bay Area Mesh to install an [AREDN](https://www.arednmesh.org/) (Amateur Radio Emergency Data Network) node on our West Tower at Site 530, traditionally used only for HF communication. While the Bay Area has a growing AREDN system, our transmission site in the Stanford Dish Area offers line-of-sight connections to key nodes like Easter Cross, Kings Mountain, and Palo Alto City Hall while sitting in a dead zone for local mesh coverage. This project involved outfitting our West Tower with three high-power 5 GHz sector antennas to provide omnidirectional data coverage for the Stanford campus and surrounding community, with a backbone 6 GHz link to the Palo Alto City Hall.
## Technical Specifications
- **Frequency**: 5 GHz (Amateur Service)
- **Coverage**: 360° (3x 120° Sectors)
- **Power Source**: Hybrid 120VAC Grid + 200W Solar Backup
- **Platform**: AREDN Firmware on Ubiquiti/MikroTik hardware
- **Backup Capacity**: 50Ah LiFePO4 (approx. 16+ hours runtime without solar)
## Key Features
- **Wide Area Coverage**: Three [Ubiquiti Rocket AC Lite](https://streakwave.com/ubiquiti-networks-r5ac-lite-us-5ghz-rocket-ac-lite-2x2-us) radios paired with 120-degree sector antennas for omnidirectional coverage.
- **Redundant Connectivity**: Dual WAN backhaul paths: a W6YX-managed WISP link to Black Mountain and a direct backbone connection to Palo Alto City Hall.
- **Resilient Power System**: For operation during grid failures, the system includes a [Victron MPPT 100/20](https://www.amazon.com/Victron-SmartSolar-MPPT-Controller-Bluetooth/dp/B075NPQHQK/) solar controller and 200W of PV input charging a 50Ah Bioenno LiFePO4 battery.
- **Remote Management**: A [Ubiquiti UISP Switch](https://streakwave.com/ubiquiti-uisp-s-uisp-switch) allows for per-port remote power cycling and VLAN management, reducing the need for tower climbs for node maintenance.
## Architectural Overview
Power and switching equipment is mounted in two NEMA enclosures at the base of the West Tower. Networking is handled by a [MikroTik hAP AC2](https://www.amazon.com/MikroTik-RBD52G-5HacD2HnD-TC-Dual-Concurrent-802-11a-Ethernet/dp/B079SD8NVQ/), which serves as the tunnel termination point to offload processing from the sector radios.
Power distribution is managed by a [Ubiquiti EdgePower 24V](https://streakwave.com/ubiquiti-networks-ep-24v-72w-edgepower-24v-72w) supply. The system is designed to prioritize solar charging via the Victron controller, which keeps the 50Ah battery topped off for overnight or cloudy operation. All cabling running up the tower is UV-rated CAT6, terminated with DIN-rail surge suppressors at the base to protect the equipment from lightning strikes. An Axis PTZ camera is mounted to the tower for remote viewing of the W6YX antenna farm and greater Stanford Dish Area.
## Status
The build of the AREDN node on-site and installation of antennas and solar panels on the tower was completed between Nov 8th and Nov 23rd, with full commissioning occurring Nov 24th. It now proudly [serves](https://map.bayareamesh.us/#17.24/37.404301/-122.166884) the greater Stanford community and the Peninsula and South Bay regions.