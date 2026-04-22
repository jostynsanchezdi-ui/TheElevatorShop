export interface MockProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  subcategory: string;
  description: string;
  stock: number;
  price: number;
  rating: number;
  reviewCount: string;
  icon: string;
  image: string;
}

export const MOCK_PRODUCTS: MockProduct[] = [
  { id: "1",  name: "Hydraulic Power Unit",    sku: "HPU-3000", category: "Elevator Components", subcategory: "Load Weighing",       description: "High-performance hydraulic power unit for elevator systems.",           stock: 5,  price: 189900, rating: 4.8, reviewCount: "1.2k", icon: "package", image: "" },
  { id: "2",  name: "Door Operator Motor",     sku: "DOM-500",  category: "Electrical",           subcategory: "Power Supplies",      description: "Reliable door operator motor for smooth elevator door control.",         stock: 12, price: 34500,  rating: 5.0, reviewCount: "892",  icon: "package", image: "" },
  { id: "3",  name: "Safety Gear Assembly",    sku: "SGA-100",  category: "Safety & PPE",         subcategory: "Personal Protection", description: "Complete safety gear assembly for elevator fall protection.",            stock: 8,  price: 89900,  rating: 4.4, reviewCount: "341",  icon: "package", image: "" },
  { id: "4",  name: "Main Control Board",      sku: "MCB-7200", category: "Electrical",           subcategory: "Power Supplies",      description: "Central control board for elevator logic and drive management.",        stock: 3,  price: 124900, rating: 4.8, reviewCount: "654",  icon: "package", image: "" },
  { id: "5",  name: "Encoder Speed Sensor",    sku: "ESS-200",  category: "Elevator Components",  subcategory: "Limit Switches",      description: "Precision encoder speed sensor for elevator positioning systems.",      stock: 20, price: 12900,  rating: 5.0, reviewCount: "1.1k", icon: "package", image: "" },
  { id: "6",  name: "Guide Rail Section (T)",  sku: "GRS-T50",  category: "Fasteners",            subcategory: "Bolts & Screws",      description: "T-profile guide rail section for elevator car and counterweight.",      stock: 7,  price: 29900,  rating: 4.7, reviewCount: "2.4k", icon: "package", image: "" },
  { id: "7",  name: "Buffer Spring Assembly",  sku: "BSA-50",   category: "Safety & PPE",         subcategory: "Lifting & Rigging",   description: "Heavy-duty buffer spring assembly for elevator pit safety.",            stock: 15, price: 15900,  rating: 4.9, reviewCount: "876",  icon: "package", image: "" },
  { id: "8",  name: "Landing Door Panel",      sku: "LDP-SS",   category: "Elevator Components",  subcategory: "Car Equipment",       description: "Stainless steel landing door panel for elevator hoistway entrances.",   stock: 4,  price: 67900,  rating: 4.6, reviewCount: "432",  icon: "package", image: "" },
  { id: "9",  name: "Car Operating Panel",     sku: "COP-12",   category: "Elevator Components",  subcategory: "Car Equipment",       description: "12-button car operating panel with LED indicators and emergency call.", stock: 6,  price: 45900,  rating: 4.8, reviewCount: "765",  icon: "package", image: "" },
  { id: "10", name: "Pump Solenoid Valve",     sku: "PSV-80",   category: "Conduit & Fittings",   subcategory: "Conduit Accessories", description: "Hydraulic pump solenoid valve for elevator fluid flow control.",        stock: 25, price: 8900,   rating: 4.5, reviewCount: "1.8k", icon: "package", image: "" },
  { id: "11", name: "Leveling Sensor Kit",     sku: "LSK-10",   category: "Elevator Components",  subcategory: "Limit Switches",      description: "Floor leveling sensor kit for accurate elevator door zone detection.",  stock: 9,  price: 6900,   rating: 4.7, reviewCount: "543",  icon: "package", image: "" },
  { id: "12", name: "Emergency Battery Unit",  sku: "EBU-24",   category: "Electrical",           subcategory: "Power Supplies",      description: "24V emergency battery unit providing backup power during outages.",     stock: 11, price: 22900,  rating: 4.9, reviewCount: "321",  icon: "package", image: "" },
];

export const CATEGORIES = [
  { id: "all", label: "All Parts" },
  { id: "hydraulic", label: "Hydraulic" },
  { id: "electrical", label: "Electrical" },
  { id: "mechanical", label: "Mechanical" },
  { id: "safety", label: "Safety" },
  { id: "controls", label: "Controls" },
];

export const RECOMMENDATIONS: MockProduct[] = MOCK_PRODUCTS.slice(0, 6);
