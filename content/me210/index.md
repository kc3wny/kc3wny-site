---
title: "JarJar the Table"
type: "Project"
description: "ME 210 Final Project — Autonomous curling robot designed and built in two weeks at Stanford"
publishedAt: "2026-03-07"
heroImage: "/api/content-image?path=ME210/hero-board-crowd.jpg"
figures:
  - src: "/api/content-image?path=ME210/board-with-pucks.jpg"
    caption: "Curling house with red and blue pucks on the board"
    id: "FIG-001"
  - src: "/api/content-image?path=ME210/group-photo.jpg"
    caption: "Competition team photo"
    id: "FIG-002"
  - src: "/api/content-image?path=ME210/checkoff-celebration.png"
    caption: "Team celebrating after checkoff"
    id: "FIG-003"
  - src: "/api/content-image?path=ME210/board.png"
    caption: "Top view and side view of the curling sheet layout"
    id: "FIG-004"
  - src: "/api/content-image?path=ME210/design-full.png"
    caption: "Full CAD perspective view of the redesigned bot"
    id: "FIG-005"
  - src: "/api/content-image?path=ME210/design-front.png"
    caption: "Front CAD view"
    id: "FIG-006"
  - src: "/api/content-image?path=ME210/design-side.png"
    caption: "Side CAD view"
    id: "FIG-007"
  - src: "/api/content-image?path=ME210/bot-on-board.jpg"
    caption: "Built robot on the curling board"
    id: "FIG-008"
  - src: "/api/content-image?path=ME210/puck-deployment-design.png"
    caption: "Puck deployment magazine CAD detail"
    id: "FIG-009"
  - src: "/api/content-image?path=ME210/kicad-global-schematic.png"
    caption: "Global electronic schematic"
    id: "FIG-010"
  - src: "/api/content-image?path=ME210/motor-drive-circuit.png"
    caption: "Motor drive circuit"
    id: "FIG-011"
  - src: "/api/content-image?path=ME210/ultrasound-pinout.png"
    caption: "Ultrasonic sensor pinout"
    id: "FIG-012"
  - src: "/api/content-image?path=ME210/tape-sensor-circuit.png"
    caption: "Representative tape sensor circuit — out node on right"
    id: "FIG-013"
  - src: "/api/content-image?path=ME210/ir-circuit.png"
    caption: "IR circuit (descoped from final design)"
    id: "FIG-014"
  - src: "/api/content-image?path=ME210/power-rail-config.png"
    caption: "Power rail configuration — fuse not shown"
    id: "FIG-015"
  - src: "/api/content-image?path=ME210/top-level-fsm.jpg"
    caption: "Top-level finite state machine"
    id: "FIG-016"
  - src: "/api/content-image?path=ME210/escape-box-fsm.jpg"
    caption: "Escape-box FSM"
    id: "FIG-017"
  - src: "/api/content-image?path=ME210/follow-to-hogline-fsm.jpg"
    caption: "Follow-to-hogline FSM"
    id: "FIG-018"
  - src: "/api/content-image?path=ME210/fire-fsm.jpg"
    caption: "Fire stage FSM — Start → Reversing → Fire Stepper → Fire Done"
    id: "FIG-019"
  - src: "/api/content-image?path=ME210/return-to-start-fsm.jpg"
    caption: "Return-to-start FSM"
    id: "FIG-020"
  - src: "/api/content-image?path=ME210/motor-code.png"
    caption: "Motor control abstraction layer"
    id: "FIG-021"
  - src: "/api/content-image?path=ME210/tape-sensor-code.png"
    caption: "Tape sensor bitmask and crossing detection"
    id: "FIG-022"
  - src: "/api/content-image?path=ME210/ultrasonic-code.png"
    caption: "Ultrasonic sensing with EMA filter and hysteresis"
    id: "FIG-023"
  - src: "/api/content-image?path=ME210/stepper-motor-code.png"
    caption: "Stepper motor test stages"
    id: "FIG-024"
  - src: "/api/content-image?path=ME210/testing-toggle-code.png"
    caption: "Stage-mode testing framework toggle"
    id: "FIG-025"
  - src: "/api/content-image?path=ME210/old1.jpg"
    caption: "Original robot design with IR beacon and pinball machine pusher"
    id: "FIG-026"
  - src: "/api/content-image?path=ME210/old2.jpg"
    caption: "Original robot design — alternate view"
    id: "FIG-027"
  - src: "/api/content-image?path=ME210/new-design1.jpg"
    caption: "Final redesigned droid with acrylic ramp and stepper-driven puck magazine"
    id: "FIG-028"
  - src: "/api/content-image?path=ME210/new-design2.jpg"
    caption: "Final redesigned droid — alternate view"
    id: "FIG-029"
  - src: "/api/content-image?path=ME210/main-changes.png"
    caption: "Comparison of major component changes from original to final design"
    id: "FIG-030"
---
## Overview

The task in ME 210 (Mechatronic Systems Design) was to design an autonomous machine that competes head-to-head in a modified version of curling. Each robot must navigate a playing field (FIG-004), deploy three pucks toward a target (FIG-001), and return to the starting zone for reloading, all without human intervention during the match.

Our robot, **JarJar the Table**, was a full design pivot executed in roughly 60 hours: CAD, manufacture, assembly, programming, and competition. It competed successfully, returning to the starting zone for reloading all three times and delivering nearly all pucks to the target zone on every attempt (FIG-002, FIG-003).

**Team:** Mason Matich (Mechanical/Software), Jackson Kennedy (Mechanical/Electrical), Adam Boswell (Software), Brooke Ruszkiewicz (Mechanical)

## Requirements

- **Random start**: Robot begins in a random orientation within the starting zone
- **Autonomous**: Must operate autonomously beyond manual puck loading; human interference during play incurs penalties
- **Navigation**: Must navigate within bounds of the curling sheet and shoot from anywhere within those bounds
- **Reload**: After deploying three pucks, the robot must fully return to the starting zone to be reloaded
- **Trajectory**: Puck trajectory may not exceed 1 inch of height off the ground after deployment
- **Time limit**: Gameplay automatically ceases after 2 minutes

## Mechanical Design

The redesigned bot was optimized for rapid manufacture and rigidity, and was fully assembled within 24 hours. FIG-005, FIG-006, FIG-007 show the CAD views of the final design; FIG-008 shows the completed robot on the competition floor. An interesting issue discovered during assembly was the rod-and-bore column design was forming an airtight seal, making it function as a crude gas spring. This made it impossible to position the top plate at the right height to install the ramp, as well as nearly impossible to pull apart! A small vent hole drilled in the bore resolved this completely, and thankfully did not require reprinting the entire part.

The ¼" acrylic plates proved rigid, and a ¼-20 bolt pattern allowed for easy modification during testing. Motor mounts used four bolts instead of the two seen on peer designs, reducing off-axis shaft loading and wheel camber while increasing grip. The ramp started as a curve but the linear version proved sufficient and much simpler to manufacture requring no heat forming.

**Puck Deployment Magazine**

A bipolar two-phase stepper motor (1.8° steps) was coupled to a 3D-printed carousel magazine that deploys pucks in open-loop 90° increments (FIG-009). Each rotation advances slotted pucks along a low-friction rail until they drop through the chassis floor onto the ramp. Friction analysis estimated ~172 mN·m of required torque — achievable with stepper motors but marginal. The carousel was designed to minimize required torque, and a boost converter allowed the motor to move pucks reliably at 24V+. The shaft-to-carousel coupler used a cylindrical adapter with two transverse tapped holes: one set screw to clamp the shaft, one socket-head screw with washer to fasten the carousel.

**Mechanical Key Learnings**

- **Supply chain**: Delays in McMaster shipping and issues with the package center severely delayed the start of testing
- **Design around COTS parts**: Use as many COTS parts as possible when budget/time limited
- **Simple is better**: Our second design was much simpler mechanically and structurally, allowing for more rigidity and more breadboard mounting space without an extended test campaign

## Electrical Design

The robot runs on one Arduino Uno R3. A switch to a Mega was considered but deemed unnecessary given the simple control algorithms and efficient pin usage. The full schematic is shown in FIG-010.

**Motor and Drive System**

Two JameCo DC 12V motors (30:1 gear ratio) drive two 2-inch diameter wheels, traversing the length of the board in ~12 seconds with a full puck magazine. Controlled by an L298 H-bridge driver for bidirectional speed control, with two ball caster wheels for rear support (FIG-011). Pin assignments: `ENA=D9 IN1=D7 IN2=D8` (left drive), `ENA=D10 IN1=D12 IN2=D11` (right drive).

**Ultrasonic Sensor (HC-SR04)**

One front-mounted ultrasonic sensor handles environment sensing and navigation out of the starting box (FIG-012). It performed well except at ~45° off-wall-normal at close range, where pulses escaped without reflecting back. Pin assignments: `TRIG=D5 ECHO=D6`.

**Tape Sensors (OPB703WZ)**

Four tape sensors on the front of the chassis define the starting box boundary, support line following, and identify the hog line (FIG-013). We experienced significant difficulty with apparently faulty sensors, which would work before harnessing but fail afterwards suggesting heating damage. The navigation algorithm was adjusted according to compensate for dead sensors. Pin assignments: `LO=A4 LI=A5 RI=A1 RO=A2`.

**IR Circuit (Descoped)**

The original design used an AC-coupled phototransistor amplifier (FIG-014) to detect 909 Hz IR beacons for precise positional awareness via triangulation. It worked well in early testing but was descoped when tape-based line following proved superior and sufficient for navigation.

**Power Delivery**

Three power rails: unregulated battery, 12V regulated, and 5V regulated (FIG-015). The main issue was backfeeding: the 12V supply backfed through the Arduino's 5V regulator while on battery, dragging down output pins and causing logic output to read only 0.3V. Adding a 1N4001 diode on each regulator output resolved the issue.

**Electrical Key Learnings**

- **Verify with multimeters**: Use multimeters to confirm supply voltage is actually being delivered at each known point
- **Boost converter care**: Stalling a motor without appropriate reverse current protection is guarenteed to break things
- **Battery rotation**: Two battery packs sets, one charging, one in use, is an ideal setup when partially relying on unregulated rails
- **Polarity**: Do not plug battery+ into the ground rail, or things will explode

## Software Design

The software is built around a hierarchy of finite state machines (FIG-016). The top-level FSM advances through three major phases: escape the starting box → follow tape to the hog line → fire → return to start. Each phase is its own stage function with one clear end condition and state, making the robot's state behavior easy to tune independently.

**Escape from the Starting Box**

The escape routine is itself a local FSM (FIG-017) combining ultrasonic sensing, tape sensing, and recovery logic. The robot scans for an open direction, drives toward it, aligns to any detected tape line, then re-checks the ultrasonic sensor to distinguish actual exits from false lines. A key design choice was separating "finding tape" from "verifying exit" — after aligning to a detected line, the robot checks the ultrasonic again to confirm the line corresponds to an actual opening rather than a wall. A watchdog state handles the case where the ultrasonic reading stops changing (robot jammed), triggering a backup-and-retry.

**Follow to Hog Line**

The follow-to-hog-line FSM (FIG-018) separates the intercept phase (timing- and geometry-based) from the follow phase (continuous sensor feedback), allowing each to be tuned independently. Outer sensors handle large corrective steering; inner sensors handle nominal tracking. Hog-line detection requires all line following sensors to detect the hog line before initiating a firing transition to cut down on errors.

**Fire and Return**

The fire stage (FIG-019) sequences: Start → Reversing → Fire Stepper → Fire Done. Return to start (FIG-020) chains timed turns, tape-guided motion, and ultrasonic wall-proximity stops, using the line-following controller where tape provides a reference and ultrasonic thresholds where proximity to boundaries matters.

**Motor Control**

A small motor abstraction layer (FIG-021) wraps PWM clamping, direction control, and helpers (`motorsTank()`, `motorsStop()`, `safeMotorsTank()`). A `TEST_ENABLE_MOTORS` flag allows running the full FSM and sensor logic without physically moving the robot — essential for debugging serial output and validating state transitions before enabling motion.

**Tape Sensing and Line Following**

Four sensors (FIG-022) are read as analog values and thresholded into a compact bitmask. Inner sensors provide nominal correction; outer sensors trigger stronger steering when the robot drifts. A `lastTapeSide` variable provides short-term memory for recent tape contact direction. A debounced crossing detector requires multiple sensors to agree for a minimum duration before triggering, reducing spurious hog-line and exit detections.

**Ultrasonic Sensing**

Readings (FIG-023) are filtered with an exponential moving average and wrapped in hysteresis logic to prevent rapid state flipping from noisy measurements. Timeouts are treated as open space, allowing lack of return signal to be interpreted as an open path rather than sensor failure.

**Stepper Testing**

Dedicated test stages (FIG-024) for the swivel motor allowed stepping the motor in 90° increments or performing a single firing action, making it possible to validate pin mappings, step ordering, and motor enable behavior independently from navigation.

**Testing Framework**

Individual subsystems were testable in isolation via a `STAGE_MODE` switch (FIG-025): tape sensing, ultrasonic sensing, timed turns, constant forward drive, swivel motor, line following, box escape, and return-to-start — without running the full autonomous sequence. This dramatically reduced debugging time by separating sensor, motor, and state-machine problems into independent test cases.

**Software Key Learnings**

- **Hardware integration time**: Hardware integration takes substantially more software time than anticipated, even with a clear architecture. Tuning real-world algorithms takes significant iteration
- **Serial debugging**: Serial print statements save enormous debugging time

## Bill of Materials

The total build cost was **$244.57**. Key components and costs:

- **Transparent Acrylic Sheet**: $51.79 — primary chassis material
- **JameCo 12V DC Motors**: $30.00 — two motors, 30:1 gear ratio
- **Arduino Uno R3**: $32.00 — main controller
- **Stepper Motor**: $15.00 — puck carousel drive
- **PLA Filament (3D printing)**: $20.00 — magazine and brackets
- **7.4V Battery Packs**: $14.00 — two packs for rotation
- **L298 Motor Drivers**: $3.00 — two H-bridge drivers
- **Tape Sensors (OPB703WZ)**: $7.20 — four units for line following
- **Ultrasonic Sensor (HC-SR04)**: $6.00 — environment sensing
- **Buck Converter**: $5.00 — voltage regulation

Remaining cost covers wheels, casters, D-shafts, fasteners, breadboards, jumper wires, and passive electronics.

## Project Pivot

Our original design (FIG-026, FIG-027) was significantly more complex: a pinball-machine pusher on a cable-driven ratchet system for variable shooting distance, a solenoid release, a chain-driven puck elevator, and an IR beacon turret for precise positional awareness by triangulation. When a cable drive failure surfaced on the Tuesday before the deadline, we took stock and realized the design was massively overcomplicated for the challenge.

We pivoted to a minimal design: tape-following sensors, an ultrasonic distance sensor, an acrylic ramp, and a stepper-driven carousel magazine. The full redesign, including CAD, manufacture, assembly, programming, and test, took about 60 hours. THe final 26 hours was a continuous work session Thursday into Friday. The final robot (FIG-028, FIG-029) was exceptionally reliable in testing and competition. FIG-030 shows a side-by-side comparison of major component changes between the two designs.

The broad lesson: make the simplest part/assembly that accomplishes the goal, and budget enough time for testing appropriate to the design's complexity. Our original design had many hardware and software edge cases that would have required several additional days of calibration time we didn't have. The simplified design was a far better fit — and had we started with it, we could have executed comfortably within two weeks without the marathon session. The struggle to avoid overengineering is nearly universal in this class; hopefully these notes help future teams calibrate earlier in the design process.
