---
title: "SSI Satellites SAMWISE"
type: "Project"
description: "A student-built 2U technology demonstrator launching Transporter 18!"
publishedAt: "2026-03-20"
new: true
heroImage: "/api/content-image?path=samwise/samwise_render.png"
figures:
  - src: "/api/content-image?path=samwise/GroundOps Room.jpg"
    caption: "Ground operations room"
    id: "FIG-001"
  - src: "/api/content-image?path=samwise/LNA replacement.jpg"
    caption: "LNA replacement unit"
    id: "FIG-002"
  - src: "/api/content-image?path=samwise/LNA replacement2.jpg"
    caption: "LNA replacement in-progress"
    id: "FIG-003"
  - src: "/api/content-image?path=samwise/Ground Operations Architecture.jpg"
    caption: "Ground operations architecture"
    id: "FIG-004"
  - src: "/api/content-image?path=samwise/Laser cut.jpg"
    caption: "Laser cut components fixtured in machine"
    id: "FIG-005"
  - src: "/api/content-image?path=samwise/Laser full set.jpg"
    caption: "Flight set of laser cut components"
    id: "FIG-006"
  - src: "/api/content-image?path=samwise/Solar array hinge.png"
    caption: "Improved deployment hinge design"
    id: "FIG-007"
  - src: "/api/content-image?path=samwise/Reaction wheel.png"
    caption: "Reaction wheel structure"
    id: "FIG-008"
  - src: "/api/content-image?path=samwise/Corner rail.png"
    caption: "Milled corner rail"
    id: "FIG-009"
  - src: "/api/content-image?path=samwise/End plate.png"
    caption: "Milled end plate"
    id: "FIG-010"
  - src: "/api/content-image?path=samwise/Block 1.5 complete.jpg"
    caption: "Complete Block 1.5 SAMWISE satellite with new primary structure"
    id: "FIG-011"
  - src: "/api/content-image?path=samwise/Block 1.5 mass verification.jpg"
    caption: "Block 1.5 mass verification (off by <3% from prediction)"
    id: "FIG-012"
  - src: "/api/content-image?path=samwise/Block 1.5 transport.jpg"
    caption: "Block 1.5 unharmed from transportation to test facility"
    id: "FIG-013"
  - src: "/api/content-image?path=samwise/SAMWISE testing.jpg"
    caption: "Example of a random vibration test setup"
    id: "FIG-014"
  - src: "/api/content-image?path=samwise/SAMWISE celebration.jpg"
    caption: "Celebration of a failure-free test!"
    id: "FIG-015"


---
## Overview
Since late 2023 the Stanford Student Space Initiative (SSI) Satellite Team has been developing a 2U technology demonstrator satellite called SAMWISE, which is designed to test an upgraded flight computer, ADCS system, high bandwidth radio communication, and a deployable solar array. As part of this team, I have helped develop ground stations, the solar array deployment hinges, and the milled primary structure in my various team lead roles.

## Roles
- **Ground Station Software Project Lead**: Sept 2023-Mar 2024
- **Mission Control Lead**: Mar 2024-Mar 2025
- **Structures Lead**: Mar 2024-Mar 2025
- **Satellites Team Co-Lead**: Apr 2025-Mar 2026

## Ground Stations
I was the first lead of the new Mission Control sub-team in charge of all command and control (C2) tasks for the satellite. This covered ground control systems, satellite health monitoring, camera tasking, and telemetry and mission data storage and processing.

A major project, and one that is still ongoing, is the design of a 2400 MHz S-band ground station for high-speed photo downlink. It is based on the [CIR-2320](https://rfhamdesign.com/downloads/septum-dish-feed.pdf) septum dish feed custom re-tuned for our 2427 MHz center frequency, paired with a [1.9M mesh dish](https://www.rfhamdesign.com/products/parabolicdishkit/19meterdishkit/). Everything is mounted to a non-penetrating roof mount and an [SPX-03/HR](https://www.rfhamdesign.com/downloads/spx-03-specifications.pdf) high resolution rotator unit. These major components were chosen to allow for easier upgrades compared to our prior UHF system, with the septum specifically chosen for its separate TX/RX feeds to allow for full-duplex operations on future satellites.

Improvements to our existing UHF ground station was also a major contribution. Issues included unresolved ground loops, a high noise floor, intermittent rotator outages, and severe signal fading during inclement weather. The rewiring of our UHF radio, improved single point grounding, and replacement cable harnesses resolved most of these issues (FIG-001). Signal fading was isolated to a failing LNA and N-type connector mounted to the antenna, suffering from water ingress and severe corrosion. Despite attempts to repair both components, they were instead replaced to resolve the problem. (FIG-002, FIG-003)

My final major project was the design of the ground control and data storage architecture laid out here (FIG-004). While it has been modified and expanded since 2024, this design is largely still in place.

## Structures
As a long term member of structures, I have helped to integrate seven satellite engineering and flight models, and led the integration of four where I managed avionics board assembly/testing, cable harnessing, structure component manufacture, and final assembly and checking. On the design side, involvement has been primarily on on the solar panel deployment hinges and primary structure of SAMWISE. 

Our initial design used CNC-router cut 5051 aluminum, bent by hand using a hand brake, to build the primary structure and avionics trays. My first contribution was to redesign these components in mid 2024 to switch to laser cutting (FIG-005, FIG-006) which allowed for more consistent tolerances and a raster graphic indicating bend lines, reducing error when bending the sheet metal. I also added an angle measurement system to our hand brake to reduce error in the final angle of the part. These improvements helped reduce our reject rate of components from 9/10 to 2/10.

I helped increase our use of CNC milling as a team, first by redesigning our solar array deployment hinges (FIG-007) in mid 2024 to prevent binding during deployment, accommodate stronger torsion springs, and allow for cheaper/faster production on a CNC mill. Uprating to 6061 T6 from 5052 helped increase rigidity of the final deployed system as well. In early 2025 I designed our reaction wheel structure (FIG-008), made from 7075 Aluminum, to accommodate four motors allowing for single wheel redundancy. It was again designed for ease of manufacture and assembly.

In early 2026, we discovered a critical flaw in the primary structure that escaped prior test campaigns. The sheet metal bus design, which had flight heritage on our previous Sapling series of 1U CubeSats, is under-constrained in the vertical direction when the length of the spacecraft doubles. This allowed the entire bus to twist under mild but sustained vibration loads outside the range Falcon 9 vibration environment. This issue wasn't identified in earlier test runs since the payload was usually transported inside a test deployer, while for this test it was transported in a Pelican case. This required a complete redesign of the primary structure as milled 7075 aluminum components. I designed the new corner rails (FIG-009) and end plates (FIG-010) as part of this containment. This new design proved to be rigid enough for all transport and launch loads (FIG-011, FIG-012, FIG-013).

## Testing, & Licensing
In all of my roles I have been heavily involved in the testing and licensing of SAMWISE. To be cleared for launch, we must abide by the SpaceX [RPUG](https://storage.googleapis.com/rideshare-static/Rideshare_Payload_Users_Guide.pdf) testing guidelines. While our spacecraft contains no hazardous materials or pressurized equipment, we still have to validate our vehicle through shock and vibe testing according to the Falcon 9 launch profile (Section 6.7). It was my job to design a conforming test series with Exolaunch and our test provider Quanta Labs, to plan the test campaign logistics, to analyze the test data, and to prepare our final report for submission to SpaceX (FIG-014, FIG-015). As of March 2026, SAMWISE was fully cleared for launch!

In parallel, I have been involved in the licensing of SAMWISE along with the SSI Policy team. Since we carry Earth-facing cameras, we are required to get a remote sensing license from NOAA, an FCC license for our EOL demise, and an IARU [coordination letter](https://iaru.amsat-uk.org/formal_detail.php?serialnum=893) for our intended radio frequencies. We take advantage of amateur radio frequency spectrum in UHF (437.400 MHz) and S-Band (2427.000 MHz) for ease of coordination, and as a result SAMWISE and our ground stations carry my callsign KC3WNY. My FCC ULS entry is also updated to include these coordination letters to complete the FCC licensing process.