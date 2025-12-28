---
title: "site530-AREDN"
type: "Project"
description: "5 GHz AREDN installation @ W6YX Site 530"
publishedAt: "2025-11-23"
heroImage: "/api/content-image?path=meshbase/meshbase_complete.jpg"
figures:
  - src: "/api/content-image?path=site530-AREDN/site530-AREDN_001.jpg"
    caption: ""
    id: "FIG-001"
  - src: "/api/content-image?path=site530-AREDN/site530-AREDN_002.jpg"
    caption: ""
    id: "FIG-002"
  - src: "/api/content-image?path=site530-AREDN/site530-AREDN_003.jpg"
    caption: ""
    id: "FIG-003"
  - src: "/api/content-image?path=site530-AREDN/site530-AREDN_004.jpg"
    caption: ""
    id: "FIG-004"
  - src: "/api/content-image?path=site530-AREDN/site530-AREDN_005.jpg"
    caption: ""
    id: "FIG-005"
  - src: "/api/content-image?path=site530-AREDN/site530-AREDN_006.jpg"
    caption: ""
    id: "FIG-006"
  - src: "/api/content-image?path=site530-AREDN/site530-AREDN_007.jpg"
    caption: ""
    id: "FIG-007"
  - src: "/api/content-image?path=site530-AREDN/site530-AREDN_008.jpg"
    caption: ""
    id: "FIG-008"
  - src: "/api/content-image?path=site530-AREDN/site530-AREDN_009.jpg"
    caption: ""
    id: "FIG-009"
  - src: "/api/content-image?path=site530-AREDN/site530-AREDN_010.jpg"
    caption: ""
    id: "FIG-010"
  - src: "/api/content-image?path=site530-AREDN/site530-AREDN_011.jpg"
    caption: ""
    id: "FIG-011"
  - src: "/api/content-image?path=site530-AREDN/site530-AREDN_012.jpg"
    caption: ""
    id: "FIG-012"
  - src: "/api/content-image?path=site530-AREDN/site530-AREDN_013.jpg"
    caption: ""
    id: "FIG-013"
  - src: "/api/content-image?path=site530-AREDN/site530-AREDN_014.jpg"
    caption: ""
    id: "FIG-014"
  - src: "/api/content-image?path=site530-AREDN/site530-AREDN_015.jpg"
    caption: ""
    id: "FIG-015"
  - src: "/api/content-image?path=site530-AREDN/site530-AREDN_016.jpg"
    caption: ""
    id: "FIG-016"

---
## Overview
The Bay Area has several developed mesh networks, including the Meshtastic-based [BayMesh](https://bayme.sh/) in which I've been active for the past two years. This has mainly been through low-cost portable nodes, however due to terrain and node density in the area surrounding Stanford's campus coverage is spotty, especially indoors. To get better reception in my dorm room I built this weatherized base station node, designed with a higher power radio and larger antenna for lower packet loss.
## Technical Specifications
- **Frequency**: 915 MHz (ISM)
- **Preset**: Medium Fast (MF)
- **Designed IP Rating**: IP-67
- **Platform**: Linux (Ubuntu Server 22.xx)
## Key Features
- **Weatherproof Design**: IP-67 rated enclosure with green powder coating ensures reliable outdoor deployment in harsh environmental conditions
- **High Power Transmission**: 1 watt E22P LoRa modem provides improved range and link budget compared to standard handheld nodes in noisy environments
- **POE+ Powered**: Single-cable deployment via PoE eliminates need for separate power supply, allowing for faster deployment and maintenance
- **EMI Shielded**: EMI-shielded enclosure minimizes RF interference and improves signal integrity in electrically noisy environments (like the inside of a college dorm)
## Architectural Overview
This node is based on the [Luckyfox Lyra Ultra](https://wiki.luckfox.com/Luckfox-Lyra/Luckfox-Lyra-Ultra/), which is a highly integrated linux SBC that can be powered over PoE or USB-C. Connected over I2C is an E22P 1 watt LoRa modem on a hat designed by the wonderful [wehooper4](https://github.com/wehooper4/Meshtastic-Hardware/tree/main/Luckfox%20Ultra%20Hat). The antenna is a fairly standard [Alfa AOA-915-5ACM](https://www.alfa.com.tw/products/aoa-915-5acm?variant=36473963020360), though this may be changed to allow for more flexible antenna pointing. All components are placed inside a [McMaster 4270N14](https://www.mcmaster.com/4270N14/) EMI enclosure, which is NEMA 4x and IP-67 rated, along with a frequency reduction of 70 dB @ 1 GHz. The case was custom powdercoated and modified to fit the IP-67 rated [RJ-45](https://www.mouser.com/ProductDetail/200-SCRESG00.25DC5E), [USB-C](https://www.mouser.com/ProductDetail/200-BPCU-CS-025-UC-P), and [N-type](https://store.rokland.com/products/uflipex-ipx-mini-pci-to-n-female-bulkhead-pigtail-cable-extension-rg178) connectors. 
## Status
Deployed over POE+ with secure remote access enabled. Further qualification ongoing, but preliminary results show low (<10%) packet loss across BayMesh network