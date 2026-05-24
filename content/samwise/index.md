---
title: "SSI Satellites SAMWISE"
type: "Project"
description: "A student-build 2U technology demonstrator"
publishedAt: "2026-03-20"
heroImage: "/api/content-image?path=samwise/samwise_render.png"
figures:


---
## Overview
Since late 2023 the Stanford Student Space Initiative (SSI) Satellite Team has been developing a 2U technology demonstrator satellite called SAMWISE, which is designed to test an upgraded flight computer, ADCS system, high bandwidth radio communication, and a deployable solar array. As part of this team, I have helped develop ground stations, the solar array deployment hinges, and the milled primary structure in my various team lead roles.


## Ground Stations
From March 2024 to March 2025 I was the first Mission Control Lead, a new subteam in charge of all command and control (C2) tasks for the satellite. This covered ground control systems, satellite health monitoring, camera tasking, and telemetry and mission data storage and processing.

A major project, and one that is still ongoing, is the design of a 2400 MHz S-band ground station for high-speed photo downlink. It is based on the [CIR-2320](https://rfhamdesign.com/downloads/septum-dish-feed.pdf) septum dish feed custom retuned for our 2427 MHz center frequency, paired with a [1.9M mesh dish](https://www.rfhamdesign.com/products/parabolicdishkit/19meterdishkit/). Everything is mounted to a non-penetrating roof mount and an [SPX-03/HR](https://www.rfhamdesign.com/downloads/spx-03-specifications.pdf) high resolution rotator unit. These major components were chosen to allow for easier upgrades compared to our prior UHF system, with the septum specifically chosen for it's separate TX/RX feeds to allow for full-duplex operations on future satellites.

Improvements to our existing UHF ground station was also a major contribution. Issues included unresolved ground loops, a high noise floor, intermittent rotator outages, and severe signal fading during inclimate weather. The rewiring of our UHF radio, improved single point grounding, and replacement cable harnesses resolved most of these issues. Signal fading was isolated to a failing LNA and N-type connector mounted to the antenna, suffering from water ingress and severe corrosion. Despite attemps to repair both components, they were instead replaced to resolve the problem.


 reliability improvements to the UHF ground station, and the ground control and data storage architecture