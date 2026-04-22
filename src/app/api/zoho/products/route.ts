import { NextResponse } from "next/server";
import { getZohoAccessToken } from "@/lib/zoho-token";
import type { MockProduct } from "@/lib/mock-data";
import fs from "fs";
import path from "path";

const PRODUCTS_CACHE_FILE = process.env.NETLIFY
  ? path.join("/tmp", "zoho-products.json")
  : path.join(process.cwd(), ".next", "zoho-products.json");
const CACHE_TTL_MS = 10 * 60 * 1000;

interface ProductsCache { fetched_at: number; items: MockProduct[] }

function readProductsCache(): MockProduct[] | null {
  try {
    const raw = fs.readFileSync(PRODUCTS_CACHE_FILE, "utf8");
    const cache = JSON.parse(raw) as ProductsCache;
    if (Date.now() - cache.fetched_at < CACHE_TTL_MS) return cache.items;
    return null;
  } catch { return null; }
}

function writeProductsCache(items: MockProduct[]) {
  try {
    fs.mkdirSync(path.dirname(PRODUCTS_CACHE_FILE), { recursive: true });
    fs.writeFileSync(PRODUCTS_CACHE_FILE, JSON.stringify({ fetched_at: Date.now(), items }));
  } catch {}
}

function categorize(name: string): { category: string; subcategory: string } {
  const n = name.toUpperCase();

  // ── Conduit & Fittings ──────────────────────────────────────────────────
  if (n.includes("EMT CONDUIT TUBING") || (n.includes("FLEXIBLE METAL CONDUIT")) || n.includes("GREENFIELD"))
    return { category: "Conduit & Fittings", subcategory: "Conduit" };
  if (n.includes("EMT") && (n.includes("ELBOW") || n.includes("SET SCREW CONNECTOR") || n.includes("SET SCREW COUPLING") || n.includes("1 HOLE STRAP")))
    return { category: "Conduit & Fittings", subcategory: "EMT Fittings" };
  if (n.includes("SQUEEZE") && (n.includes("CONNECTOR") || n.includes("COUPLING")))
    return { category: "Conduit & Fittings", subcategory: "EMT Fittings" };
  if (n.includes("FLEX STRAIGHT SQUEEZE") || n.includes("90 SQUEEZE FLEX"))
    return { category: "Conduit & Fittings", subcategory: "EMT Fittings" };
  if (n.includes("CONDUIT BODY") || n.includes("LB TYPE") || n.includes("LL TYPE") || n.includes("LR TYPE"))
    return { category: "Conduit & Fittings", subcategory: "Conduit Bodies" };
  if (n.includes("JUNCTION BOX") || n.includes("PULLBOX") || n.includes("HANDY BOX") || n.includes("1900 BOX") || n.includes("AUXILIARY CAR BOX"))
    return { category: "Conduit & Fittings", subcategory: "Electrical Boxes" };
  if (n.includes("KNOCKOUT SEAL") || n.includes("PLASTIC BUSHING") || n.includes("ANTI SHORT BUSHING") || n.includes("CHASE NIPPLE") || n.includes("THREADED GAL COUPLING"))
    return { category: "Conduit & Fittings", subcategory: "Conduit Accessories" };
  if (n.includes("STRUT CHANNEL") || n.includes("STRUT CLAMP") || n.includes("TROUGH") || n.includes("5-HOLE ANGLE CONNECTOR") || n.includes("KINDORF"))
    return { category: "Conduit & Fittings", subcategory: "Strut & Trough" };

  // ── Wire & Cable ────────────────────────────────────────────────────────
  if (n.includes("THHN") || n.includes("AWG"))
    return { category: "Wire & Cable", subcategory: "THHN Wire" };
  if (n.includes("MULTI CABLE") || n.includes("HOISTWAY CABLE"))
    return { category: "Wire & Cable", subcategory: "Hoistway Cable" };
  if (n.includes("TRAVELING CABLE") || n.includes("TRAVEL CABLE") || n.includes("JUTE CORE"))
    return { category: "Wire & Cable", subcategory: "Traveling Cable" };
  if (n.includes("DOOR LOCK WIRE") || n.includes("RADIX"))
    return { category: "Wire & Cable", subcategory: "Control & Door Wire" };
  if (n.includes("CAT-5") || n.includes("ETHERNET CABLE"))
    return { category: "Wire & Cable", subcategory: "Data Cable" };
  if (n.includes("WIRE HANGER") || n.includes("KELLEMS"))
    return { category: "Wire & Cable", subcategory: "Cable Management" };

  // ── Fasteners ───────────────────────────────────────────────────────────
  if (n.includes("HEX TAP BOLT") || n.includes("HEX CAP SCREW") || n.includes("SELF DRILLING SCREW") || n.includes("WOOD SCREW"))
    return { category: "Fasteners", subcategory: "Bolts & Screws" };
  if (n.includes("HEX NUT") || n.includes("LOCK NUT") || n.includes("FLANGE HEX") || n.includes("FLAT WASHER") || n.includes("LOCK WASHER") || n.includes("SPLIT LOCK WASHER"))
    return { category: "Fasteners", subcategory: "Nuts & Washers" };
  if (n.includes("WEDGE ANCHOR") || n.includes("PLASTIC ANCHOR"))
    return { category: "Fasteners", subcategory: "Anchors" };

  // ── Elevator Components ─────────────────────────────────────────────────
  if (n.includes("LIMIT SWITCH") || n.includes("NC LIMIT") || n.includes("ROLLER PLUNGER") || n.includes("ROLLER SAFETY") || n.includes("SAFETY INTERLOCK"))
    return { category: "Elevator Components", subcategory: "Limit Switches" };
  if (n.includes("LOAD WEIGHING"))
    return { category: "Elevator Components", subcategory: "Load Weighing" };
  if (n.includes("WIRE ROPE CLIP") || n.includes("WIRE ROPE FASTENER") || n.includes("PIANO WIRE") || n.includes("LIFELINE"))
    return { category: "Elevator Components", subcategory: "Wire Rope & Clips" };
  if (n.includes("TEMPORARY RUN") || n.includes("RUN STATION") || n.includes("RUN BOX") || n.includes("TOGGLE PIT SWITCH") || n.includes("INSPECTION STATION"))
    return { category: "Elevator Components", subcategory: "Run Stations & Controls" };

  // ── Electrical ──────────────────────────────────────────────────────────
  if (n.includes("48VDC") || n.includes("POWER SUPPLY") || n.includes("UPS") || n.includes("450VA") || n.includes("BATTERY BACKUP"))
    return { category: "Electrical", subcategory: "Power Supplies & UPS" };
  if (n.includes("ETHERNET SWITCH") || n.includes("2N ETHERNET") || n.includes("PORT ETHERNET"))
    return { category: "Electrical", subcategory: "Network & Data" };
  if (n.includes("125VAC") || n.includes("ELECTRIC PLUG") || n.includes("GFCI") || n.includes("EXTENSION CORD") || n.includes("TRIPLE TAP"))
    return { category: "Electrical", subcategory: "Power & Outlets" };

  // ── Tools ───────────────────────────────────────────────────────────────
  if (n.includes("ANNULAR CUTTER"))
    return { category: "Tools", subcategory: "Hole Cutters" };
  if (n.includes("HOLE SAW") || n.includes("TUNGSTEN CARBIDE TIPPED HOLE"))
    return { category: "Tools", subcategory: "Hole Saws" };
  if (n.includes("DRILL BIT") && n.includes("SDS"))
    return { category: "Tools", subcategory: "Hammer Drill Bits" };
  if (n.includes("DRILL BIT"))
    return { category: "Tools", subcategory: "Drill Bits" };
  if (n.includes("RECIPROCATING SAW") || n.includes("SAWZALL") || n.includes("GRINDING WHEEL") || n.includes("CUTTING DISC"))
    return { category: "Tools", subcategory: "Cutting Tools" };
  if (n.includes("MAGNETIC LEVEL") || n.includes("PLUMB BOB"))
    return { category: "Tools", subcategory: "Levels & Measuring" };
  if (n.includes("EXTENSION LADDER"))
    return { category: "Tools", subcategory: "Ladders & Access" };
  if (n.includes("WORK LIGHT") || n.includes("LIGHT BULB CAGE"))
    return { category: "Tools", subcategory: "Work Lighting" };

  // ── Safety & PPE ────────────────────────────────────────────────────────
  if (n.includes("SAFETY GLASSES") || n.includes("SAFETY HARNESS") || n.includes("WORK GLOVES") || n.includes("NITRILE"))
    return { category: "Safety & PPE", subcategory: "Personal Protection" };
  if (n.includes("SLING STRAP") || n.includes("LIFT SLING"))
    return { category: "Safety & PPE", subcategory: "Lifting & Rigging" };
  if (n.includes("CAUTION TAPE") || n.includes("STENCIL") || n.includes("PERMANENT MARKER") || n.includes("SPRAY PAINT"))
    return { category: "Safety & PPE", subcategory: "Marking & Signage" };
  if (n.includes("MASTER LOCK") || n.includes("SAFETY GLASSES"))
    return { category: "Safety & PPE", subcategory: "Lockout / Tagout" };

  // ── Supplies ────────────────────────────────────────────────────────────
  if (n.includes("ELECTRICAL TAPE"))
    return { category: "Supplies", subcategory: "Electrical Tape" };
  if (n.includes("WD 40") || n.includes("SIMPLE GREEN"))
    return { category: "Supplies", subcategory: "Lubricants & Cleaners" };

  return { category: "Supplies", subcategory: "General Supplies" };
}

function describeProduct(name: string): string {
  const n = name.toUpperCase();

  // Conduit
  if (n.includes("EMT CONDUIT TUBING"))        return `Galvanized steel EMT conduit tubing${extractSize(name)} for routing electrical wiring in elevator hoistways and machine rooms. Meets UL 797 standard.`;
  if (n.includes("FLEXIBLE METAL CONDUIT") || n.includes("GREENFIELD")) return `Flexible metal conduit (Greenfield)${extractSize(name)} for connections requiring movement or vibration resistance. Ideal for elevator motor and control wiring.`;
  if (n.includes("EMT") && n.includes("ELBOW")) return `Steel EMT 90° elbow${extractSize(name)} for making right-angle turns in conduit runs. Pre-galvanized finish resists corrosion in hoistway environments.`;
  if (n.includes("SET SCREW CONNECTOR"))        return `Steel EMT set screw connector${extractSize(name)} for securing conduit to junction boxes and enclosures. Quick installation with a single set screw.`;
  if (n.includes("SET SCREW COUPLING"))         return `Steel EMT set screw coupling${extractSize(name)} for joining two sections of EMT conduit end-to-end. Durable zinc-plated finish.`;
  if (n.includes("SQUEEZE FLEX CONNECTOR") || n.includes("FLEX STRAIGHT SQUEEZE")) return `Squeeze-type flex connector${extractSize(name)} for attaching flexible metal conduit to boxes and fittings without tools. Fast installation, secure fit.`;
  if (n.includes("90 SQUEEZE FLEX"))            return `90° squeeze flex connector${extractSize(name)} for right-angle flexible conduit terminations. Ideal for tight spaces in elevator control panels.`;
  if (n.includes("EMT TO FLEX") && n.includes("COUPLING")) return `EMT-to-flex coupling${extractSize(name)} for transitioning between rigid EMT and flexible metal conduit. Set-screw and squeeze design.`;
  if (n.includes("LB TYPE CONDUIT BODY"))       return `LB-type conduit body${extractSize(name)} with removable cover and gasket. Used for 90° changes in conduit direction, accessible for wire pulling.`;
  if (n.includes("LL TYPE CONDUIT BODY"))       return `LL-type conduit body${extractSize(name)} with cover and gasket for left-hand 90° conduit turns. Provides pull point for wire installation.`;
  if (n.includes("LR TYPE CONDUIT BODY"))       return `LR-type conduit body${extractSize(name)} with cover and gasket for right-hand 90° conduit turns. Steel construction for elevator wiring applications.`;
  if (n.includes("CHASE NIPPLE"))               return `Threaded conduit chase nipple${extractSize(name)} for connecting conduit through panel knockouts and box walls. Zinc-plated steel.`;
  if (n.includes("KNOCKOUT SEAL"))              return `Snap-in knockout seal${extractSize(name)} for closing unused knockouts in electrical boxes and panels. Prevents debris entry and maintains NEC compliance.`;
  if (n.includes("PLASTIC BUSHING"))            return `Plastic conduit bushing${extractSize(name)} for protecting wire insulation at conduit ends. Snap-in installation, resistant to moisture and corrosion.`;
  if (n.includes("ANTI SHORT BUSHING"))         return `Anti-short bushing for flexible conduit ends. Protects wire insulation from sharp metal edges during installation.`;
  if (n.includes("1 HOLE STRAP"))               return `Single-hole steel EMT strap${extractSize(name)} for securing conduit to walls, ceilings, and strut channel. Pre-punched for fast fastening.`;
  if (n.includes("THREADED GAL COUPLING"))      return `Threaded galvanized coupling${extractSize(name)} for joining rigid conduit sections. Hot-dip galvanized for long-term corrosion resistance.`;
  if (n.includes("JUNCTION BOX") || n.includes("PULLBOX")) return `Steel electrical junction/pull box${extractSize(name)} with knockouts for multiple conduit entries. NEMA 1 rated for indoor elevator rooms.`;
  if (n.includes("HANDY BOX") && n.includes("COVER")) return `Blank cover for 2×4 handy box. Steel construction provides a clean, secure closure for unused outlet boxes.`;
  if (n.includes("HANDY BOX"))                  return `2×4 handy box (single-gang electrical box) for mounting devices and making wire connections in elevator machine rooms.`;
  if (n.includes("1900 BOX") && n.includes("COVER")) return `Blank steel cover for 4" square (1900) electrical box. Closes unused boxes and provides a flush finished surface.`;
  if (n.includes("1900 BOX"))                   return `4" square (1900) steel electrical box for wiring connections in elevator control and machine room installations.`;
  if (n.includes("STRUT CHANNEL") && n.includes("1 1/2")) return `1-1/2" × 1-1/2" steel strut channel (Unistrut-style) for mounting conduit, equipment, and cable trays in elevator hoistways.`;
  if (n.includes("STRUT CHANNEL"))              return `Steel strut channel for supporting conduit runs and equipment. Slotted design accepts standard strut hardware for flexible positioning.`;
  if (n.includes("STRUT CLAMP") && n.includes("EMT")) return `Universal strut clamp${extractSize(name)} for securing EMT or rigid conduit to strut channel. Zinc-plated for corrosion resistance.`;
  if (n.includes("TROUGH") && n.includes("ELBOW TYPE C")) return `Type C 90° trough elbow for changing direction in metal wire trough runs. Provides clean, organized cable routing.`;
  if (n.includes("TROUGH") && n.includes("ELBOW TYPE D")) return `Type D 90° trough elbow for wire trough systems. Compatible with standard trough channel for elevator hoistway cable management.`;
  if (n.includes("TROUGH") && n.includes("TEE"))          return `Type D trough tee fitting for splitting or branching wire trough runs. Essential for multi-direction cable distribution.`;
  if (n.includes("TROUGH W/COVER"))             return `Steel wire trough with cover for protecting and organizing multiple conductors in elevator machine rooms and hoistways.`;
  if (n.includes("5-HOLE ANGLE CONNECTOR"))     return `5-hole angle connector for joining strut channel at 90°. Provides a rigid, secure corner connection in strut framing systems.`;
  if (n.includes("KINDORF SPRING NUT"))         return `Kindorf spring nut${extractSize(name)} for strut channel. Spring-loaded design snaps into strut slots for quick, tool-free positioning before tightening.`;

  // Wire & Cable
  if (n.includes("THHN") && n.includes("BLACK") && n.includes("#12"))  return `AWG #12 black THHN copper stranded wire. 600V rated, suitable for branch circuits in elevator machine rooms and control wiring.`;
  if (n.includes("THHN") && n.includes("GREEN") && n.includes("#12"))  return `AWG #12 green THHN copper stranded wire for grounding elevator equipment and conduit systems. Meets NEC grounding requirements.`;
  if (n.includes("THHN") && n.includes("WHITE") && n.includes("#12"))  return `AWG #12 white THHN copper stranded wire for neutral conductors in elevator power circuits. 600V, heat-resistant insulation.`;
  if (n.includes("THHN") && n.includes("#18"))  return `AWG #18 THHN copper stranded control wire. Used for low-voltage elevator control circuits, sensors, and signal wiring.`;
  if (n.includes("THHN") && n.includes("#3"))   return `AWG #3 black THHN copper stranded wire for heavy-duty elevator feeder and motor circuits. 600V rated with heat and moisture resistance.`;
  if (n.includes("THHN") && n.includes("#4"))   return `AWG #4 THHN copper stranded wire for elevator motor feeds and large branch circuits. High ampacity with durable THHN insulation.`;
  if (n.includes("THHN") && n.includes("#6"))   return `AWG #6 THHN copper stranded wire for elevator power distribution and grounding. Flexible stranded construction for easy routing.`;
  if (n.includes("THHN") && n.includes("#8"))   return `AWG #8 green THHN copper stranded wire for equipment grounding conductors in elevator installations.`;
  if (n.includes("MULTI CABLE") || n.includes("HOISTWAY CABLE")) {
    const conductors = name.match(/(\d+)\s*CONDUCTOR/i)?.[1] ?? "";
    return `${conductors}-conductor hoistway traveling cable for elevator car wiring. Designed to withstand continuous flexing, oil exposure, and the demanding conditions of elevator shafts.`;
  }
  if (n.includes("JUTE CORE TRAVEL CABLE") || n.includes("ROVER MULTICABLE")) return `10-conductor jute core traveling cable for elevator car communication and control. Jute core provides flexibility and dampens oscillation during operation.`;
  if (n.includes("TRAVELING CABLE TCSX57"))     return `TCSX57 steel core combination traveling cable for elevator applications. Steel core provides superior support and reduces stretch for high-rise installations.`;
  if (n.includes("DOOR LOCK WIRE") || n.includes("RADIX")) return `High-temperature door lock wire (Radix-compatible) AWG #18. Rated for elevator door interlock circuits where heat resistance is required.`;
  if (n.includes("CAT-5") && n.includes("15FT"))  return `Cat-5 Ethernet patch cable, 15 ft. For connecting elevator controllers, dispatch systems, and monitoring equipment in machine rooms.`;
  if (n.includes("CAT-5") && n.includes("25FT"))  return `Cat-5 Ethernet patch cable, 25 ft. Ideal for longer runs between elevator network equipment and control panels.`;
  if (n.includes("WIRE HANGER KELLEMS") && n.includes("1.25")) return `Kellems wire mesh grip hanger for cables 1.25"–1.49" diameter. Supports and strain-relieves traveling cables at the overhead hitch point.`;
  if (n.includes("WIRE HANGER KELLEMS"))        return `Kellems wire mesh grip hanger for traveling cable support. Distributes load evenly and prevents cable damage at suspension points.`;

  // Fasteners
  if (n.includes("HEX TAP BOLT"))               return `Hex tap bolt${extractSize(name)} full thread, zinc-plated. General-purpose fastener for elevator bracket mounting, guide rail clips, and structural connections.`;
  if (n.includes("HEX CAP SCREW"))              return `Hex cap screw${extractSize(name)} zinc-plated. High-strength fastener for elevator structural and mechanical connections requiring a partially threaded grip.`;
  if (n.includes("SELF DRILLING SCREW FLAT"))   return `Flat-head Phillips self-drilling screw, 10×3/4". Drills its own pilot hole in sheet metal — ideal for attaching brackets and panels in elevator rooms.`;
  if (n.includes("SELF DRILLING SCREW HEX"))    return `Hex-head self-drilling screw, 10×3/4". For fast attachment to steel framing and strut without pre-drilling. Used in elevator panel and bracket installation.`;
  if (n.includes("WOOD SCREW"))                 return `2-1/2" wood screw for securing elevator equipment to wooden blocking, sills, and framing in pit and machine room installations.`;
  if (n.includes("HEX NUT") && n.includes("1/2"))  return `1/2" zinc hex nut. Standard fastener used throughout elevator installations for securing bolts on guide rail brackets, sill supports, and structural connections.`;
  if (n.includes("HEX NUT") && n.includes("3/4"))  return `3/4" zinc hex nut for heavy-duty elevator structural bolting applications including machine beams, guide rail brackets, and anchor bolts.`;
  if (n.includes("HEX NUT"))                    return `Zinc hex nut${extractSize(name)} for general elevator installation fastening. Pairs with hex tap bolts and cap screws for secure mechanical connections.`;
  if (n.includes("FLANGE HEX LOCK NUT"))        return `Serrated flange hex lock nut${extractSize(name)} zinc. The serrated flange bites into the mating surface to prevent loosening under vibration — ideal for elevator equipment.`;
  if (n.includes("FLAT WASHER"))                return `Zinc flat washer${extractSize(name)} for distributing load under bolt heads and nuts in elevator structural and mechanical connections.`;
  if (n.includes("SPLIT LOCK WASHER"))          return `Zinc split lock washer${extractSize(name)} for preventing bolt loosening due to vibration in elevator equipment installations.`;
  if (n.includes("WEDGE ANCHOR"))               return `Zinc wedge anchor${extractSize(name)} for securing elevator guide rail brackets, machine bases, and buffer channels to concrete pits and floors.`;
  if (n.includes("PLASTIC ANCHOR"))             return `Plastic anchor kit for light-duty fastening into concrete and masonry. Used for mounting cable trays, conduit straps, and small fixtures in elevator rooms.`;

  // Elevator Components
  if (n.includes("ROLLER PLUNGER SAFETY LIMIT SWITCH")) return `Roller plunger safety limit switch for elevator hoistway position detection. Activates on contact with a cam for precise stopping and slowdown zones.`;
  if (n.includes("ROLLER SAFETY SUNS LIMIT SWITCH"))    return `Roller-type safety limit switch (SUNS) for elevator travel limit detection. Provides reliable open/close contacts for safety circuit interruption.`;
  if (n.includes("S3-1370L NC LIMIT SWITCH"))           return `S3-1370L normally-closed limit switch for elevator pit and overhead travel limiting. Complies with ASME A17.1 safety code requirements.`;
  if (n.includes("SAFETY INTERLOCK PULL OUT SWITCH"))   return `Safety interlock pull-out switch for elevator hoistway door and gate interlocks. Interrupts the safety circuit when the door is opened during operation.`;
  if (n.includes("LOAD WEIGHING EMCO"))                 return `EMCO VK3V-110 load weighing device for elevator cars. Measures car load to optimize dispatching, prevent overloads, and enable releveling.`;
  if (n.includes("LOAD WEIGHING SWK"))                  return `SWK rope sensor load weighing system for traction elevators. Measures suspension rope tension for accurate load detection without modifying the car structure.`;
  if (n.includes("PIANO WIRE") && n.includes("1320"))   return `Piano wire 0.029" gauge, 1,320 ft roll. Used as a plumb line for aligning elevator guide rails and checking hoistway plumb during installation.`;
  if (n.includes("PIANO WIRE") && n.includes("2200"))   return `Piano wire 0.029" gauge, 2,200 ft roll. Extended-length roll for tall hoistway plumbing and alignment on high-rise elevator installations.`;
  if (n.includes("WIRE ROPE CLIP"))                     return `3/8" wire rope clip (U-bolt type) for securing elevator wire rope terminations and lifeline anchors. Meets ASME B30.26 standards.`;
  if (n.includes("WIRE ROPE FASTENER CLIP"))            return `Elevator wire rope fastener clip for securing governor ropes and compensating cables. Prevents rope slippage at anchor points.`;
  if (n.includes("LIFELINE"))                           return `3/8" × 150 ft lifeline for personal fall protection in elevator hoistways and on top of cars. Meets OSHA fall arrest requirements.`;
  if (n.includes("TEMPORARY RUN") || n.includes("RUN BOX BUTTON")) return `Temporary run station / run box for elevator inspection and maintenance operation. Provides UP, DOWN, and STOP controls for top-of-car and pit service.`;
  if (n.includes("TOGGLE PIT SWITCH"))                  return `Pit stop toggle switch for interrupting the elevator safety circuit from the pit. Required by ASME A17.1 for safe access during pit maintenance.`;
  if (n.includes("INSPECTION STATION") && n.includes("FIRE BELL")) return `Elevator inspection station with integrated fire bell for machine room monitoring. Includes run/stop controls and audible alarm for emergency notification.`;
  if (n.includes("AUXILIARY CAR BOX") && n.includes("GFCI"))       return `Auxiliary car box with GFCI outlet for providing ground-fault protected power on top of the elevator car during maintenance and inspection.`;

  // Electrical
  if (n.includes("48VDC POWER SUPPLY"))         return `48VDC power supply adapter for elevator door operators, intercom systems, and low-voltage control equipment. Regulated output with overcurrent protection.`;
  if (n.includes("BATTERY BACKUP UPS 450VA"))   return `450VA UPS battery backup for elevator controllers and monitoring systems. Provides seamless power during outages to prevent data loss and enable safe shutdown.`;
  if (n.includes("5 PORT ETHERNET SWITCH"))     return `5-port unmanaged Ethernet switch for connecting elevator dispatch, monitoring, and remote access systems on a local network.`;
  if (n.includes("2N ETHERNET") && n.includes("TWO WIRE")) return `2N Ethernet-to-two-wire adapter with power supply for connecting IP-based elevator intercoms to existing two-wire building intercom wiring.`;
  if (n.includes("125VAC ELECTRIC PLUG"))       return `125VAC electric plug connector for wiring power cords and temporary connections in elevator machine rooms. Rated for standard branch circuits.`;
  if (n.includes("EXTENSION CORD") && n.includes("100FT")) return `100 ft, 120VAC, 12/3 electrical extension cord for powering tools during elevator installation and maintenance. Heavy-gauge wire handles high-current loads.`;
  if (n.includes("EXTENSION CORD") && n.includes("50FT"))  return `50 ft, 120VAC, 12/3 electrical extension cord for temporary power during elevator service. Suitable for power tools and work lights.`;
  if (n.includes("TRIPLE TAP GFCI"))            return `3-outlet GFCI extension cord, 3 ft. Provides ground-fault protected power on elevator car tops and in pits where OSHA requires GFCI protection.`;

  // Tools
  if (n.includes("ANNULAR CUTTER"))             return `Annular cutter${extractSize(name)} for magnetic drill presses. Cuts clean, burr-free holes in steel sill angles, machine beams, and brackets faster than twist bits.`;
  if (n.includes("BI METAL HOLE SAW"))          return `Bi-metal hole saw${extractSize(name)} for cutting clean holes in electrical boxes, panels, and sheet metal. High-speed steel teeth cut through steel without dulling.`;
  if (n.includes("TUNGSTEN CARBIDE TIPPED HOLE CUTTER")) return `Tungsten carbide tipped hole cutter${extractSize(name)} for drilling through hard materials including stainless steel panels and elevator sill angles.`;
  if (n.includes("HAMMER DRILL BIT") && n.includes("SDS")) return `SDS-Plus hammer drill bit${extractSize(name)} for drilling into concrete pits, walls, and floors during elevator anchor and bracket installation.`;
  if (n.includes("METAL HD/HSS") && n.includes("COBALT")) return `Cobalt HSS metal drill bit${extractSize(name)} for drilling through hardened steel, stainless, and heat-treated materials in elevator installations.`;
  if (n.includes("METAL HD/HSS") && n.includes("TITANIUM")) return `Titanium-coated HSS drill bit${extractSize(name)} for drilling steel, aluminum, and iron. The titanium coating extends bit life and reduces heat buildup.`;
  if (n.includes("METAL HD/HSS") && n.includes("BLACK OXIDE")) return `Black oxide HSS drill bit${extractSize(name)} for general metal drilling in elevator brackets, straps, and steel plates.`;
  if (n.includes("RECIPROCATING SAW") && n.includes("METAL")) return `Metal-cutting reciprocating saw blade${extractSize(name)} (Sawzall-compatible). For cutting conduit, strut, and structural steel during elevator installation.`;
  if (n.includes("RECIPROCATING SAW") && n.includes("WOOD")) return `Wood-cutting reciprocating saw blade${extractSize(name)} (Sawzall-compatible). For cutting blocking, sills, and wooden framing in elevator pit and machine room work.`;
  if (n.includes("GRINDING WHEEL") || n.includes("CUTTING DISC")) return `4-1/2" grinding/cutting disc for angle grinders. For cutting and deburring steel conduit, strut, sill angles, and structural components.`;
  if (n.includes("MAGNETIC LEVEL") && n.includes("1FT"))  return `1 ft magnetic level for checking plumb and level on elevator guide rails, brackets, and sill angles. Magnetic base holds to steel surfaces hands-free.`;
  if (n.includes("MAGNETIC LEVEL") && n.includes("2FT"))  return `2 ft magnetic level for verifying plumb of elevator guide rail sections and door frames. Strong magnetic base adheres to steel without clamps.`;
  if (n.includes("MAGNETIC LEVEL") && n.includes("3FT"))  return `3 ft magnetic level for checking hoistway door sill alignment and guide rail plumb over longer spans.`;
  if (n.includes("MAGNETIC LEVEL") && n.includes("4FT"))  return `4 ft magnetic level for verifying plumb across multiple elevator guide rail sections and landing door headers.`;
  if (n.includes("MAGNETIC LEVEL") && n.includes("6FT"))  return `6 ft magnetic level for long-span plumb checks on elevator guide rail runs and tall sill angles. Ideal for initial hoistway layout.`;
  if (n.includes("PLUMB BOB") && n.includes("16OZ"))       return `16 oz plumb bob for establishing true vertical reference lines when aligning elevator guide rails, templates, and hoistway layout.`;
  if (n.includes("PLUMB BOB") && n.includes("8OZ"))        return `8 oz plumb bob for elevator guide rail and template alignment. Lighter weight allows use in standard hoistway heights with minimal swing.`;
  if (n.includes("EXTENSION LADDER") && n.includes("16FT")) return `16 ft extension ladder for accessing elevator pit equipment, overhead brackets, and machine room fixtures during installation and maintenance.`;
  if (n.includes("EXTENSION LADDER") && n.includes("20FT")) return `20 ft extension ladder for reaching overhead hoistway entrances, machine room equipment, and top-of-car access points.`;
  if (n.includes("LED TEMPORARY HANGING WORK LIGHT"))       return `100W LED temporary hanging work light for illuminating elevator pits and hoistways during installation. Bright, energy-efficient, and durable.`;
  if (n.includes("LIGHT BULB CAGE"))                        return `Metal lamp guard (bulb cage) for protecting incandescent and LED bulbs in elevator pits and machine rooms from accidental breakage.`;

  // Safety & PPE
  if (n.includes("SAFETY GLASSES"))             return `ANSI Z87.1-rated safety glasses for eye protection during elevator installation and maintenance. Lightweight frame with impact-resistant polycarbonate lenses.`;
  if (n.includes("SAFETY HARNESS"))             return `Full-body safety harness for fall protection when working on top of elevator cars, in hoistways, and on scaffolding. Meets ANSI/ASSE Z359 standards.`;
  if (n.includes("NITRILE WORK GLOVES"))        return `Cut-resistant nitrile work gloves (ANSI A1) for handling conduit, wire rope, and sheet metal during elevator installation. Improves grip and protects hands.`;
  if (n.includes("SLING STRAP") && n.includes("2-PLY")) return `2-ply polyester lift sling${extractSize(name)} for rigging heavy elevator components including motors, machines, and car frames. Rated for overhead lifting.`;
  if (n.includes("SLING STRAP"))                return `Polyester lift sling${extractSize(name)} for rigging elevator equipment during installation. Soft loop design protects finished surfaces from damage.`;
  if (n.includes("CAUTION TAPE"))               return `3" × 1,000 ft caution tape roll for marking restricted areas, open pits, and active work zones during elevator installation and maintenance.`;
  if (n.includes("MASTER LOCK"))                return `Brass combination padlock for securing elevator machine room doors, pit access hatches, and lockout/tagout procedures during service.`;

  // Supplies
  if (n.includes("ELECTRICAL TAPE") && n.includes("BLACK"))  return `Black electrical tape (premium grade) for insulating wire splices, terminal connections, and conduit ends in elevator control and power wiring.`;
  if (n.includes("ELECTRICAL TAPE") && n.includes("RED"))    return `Red electrical tape for phase identification and color-coding electrical conductors in elevator power panels and junction boxes.`;
  if (n.includes("ELECTRICAL TAPE") && n.includes("WHITE") && n.includes("3M 35")) return `White 3M Scotch 35 electrical tape for neutral conductor identification and insulating connections in elevator wiring systems.`;
  if (n.includes("ELECTRICAL TAPE") && n.includes("YELLOW") && n.includes("3M 35")) return `Yellow 3M Scotch 35 electrical tape for color-coding control wiring in elevator systems. Excellent adhesion and electrical insulation.`;
  if (n.includes("ELECTRICAL TAPE") && n.includes("BLUE"))   return `Blue electrical tape for phase and circuit identification in elevator electrical panels and multi-conductor wiring systems.`;
  if (n.includes("WD 40"))                      return `WD-40 multi-use spray lubricant, 12 oz. For loosening seized bolts, displacing moisture, and protecting metal elevator components from rust during installation.`;
  if (n.includes("SIMPLE GREEN"))               return `Simple Green all-purpose cleaner for degreasing elevator mechanical components, machine room floors, and equipment surfaces before inspection or paint.`;
  if (n.includes("SPRAY PAINT ORANGE"))         return `Rust-Oleum 2X Ultra Cover orange spray paint, 12 oz. For marking elevator components and touch-up painting of guide rail brackets and structural steel.`;
  if (n.includes("SPRAY PAINT YELLOW"))         return `Yellow spray paint for marking safety zones, pit floors, and elevator equipment per ASME and OSHA color-coding standards.`;
  if (n.includes("STENCIL"))                    return `6" stencil set (letters and numbers) for marking elevator floors, equipment, and hoistway walls with floor designations and safety labels.`;
  if (n.includes("PERMANENT MARKER"))           return `Fine-tip permanent markers for labeling wire conductors, conduit runs, terminals, and components during elevator installation and maintenance.`;

  // Misc
  if (n.includes("ELECTRICAL EXTENSION CORD"))  return `Heavy-duty electrical extension cord for temporary power supply during elevator service and installation work.`;

  return `Professional-grade elevator component. Built for reliable performance in elevator installation and maintenance applications.`;
}

function extractSize(name: string): string {
  const m = name.match(/[\d]+[\d/]*["′]?(?:\s*[Xx×]\s*[\d/"′]+)?/);
  return m ? ` (${m[0].trim()})` : "";
}

function stableRating(id: string): number {
  const n = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return Math.round((4.0 + (n % 11) / 10) * 10) / 10;
}

function stableReviewCount(id: string): string {
  const n = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const count = 100 + (n % 1900);
  return count >= 1000 ? `${(count / 1000).toFixed(1)}k` : String(count);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapItem(item: any): MockProduct {
  const { category, subcategory } = categorize(item.item_name ?? "");
  const name = item.item_name ?? "Unknown Item";
  return {
    id: String(item.item_id),
    name,
    sku: item.sku || String(item.item_id),
    category,
    subcategory,
    description: describeProduct(name),
    stock: Math.round(item.available_stock ?? item.actual_available_stock ?? 0),
    price: Math.round((item.rate ?? 0) * 100),
    rating: stableRating(String(item.item_id)),
    reviewCount: stableReviewCount(String(item.item_id)),
    icon: "package",
    image: item.image_document_id ? `/api/zoho/image/${item.item_id}` : "",
  };
}

export async function GET() {
  const cached = readProductsCache();
  if (cached) {
    return NextResponse.json(cached, {
      headers: { "Cache-Control": "s-maxage=600, stale-while-revalidate=60", "X-Cache": "HIT" },
    });
  }

  try {
    const token = await getZohoAccessToken();
    const base = process.env.ZOHO_API_BASE_URL!;
    const orgId = process.env.ZOHO_ORGANIZATION_ID!;
    let allItems: MockProduct[] = [];
    let page = 1;

    while (true) {
      const res = await fetch(
        `${base}/items?organization_id=${orgId}&status=active&per_page=200&page=${page}`,
        { headers: { Authorization: `Zoho-oauthtoken ${token}` } }
      );
      const data = await res.json();
      const items = data.items ?? [];
      allItems = allItems.concat(items.map(mapItem));
      if (items.length < 200) break;
      page++;
    }

    writeProductsCache(allItems);
    return NextResponse.json(allItems, {
      headers: { "Cache-Control": "s-maxage=600, stale-while-revalidate=60", "X-Cache": "MISS" },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
