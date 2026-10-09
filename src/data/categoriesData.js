// Business Categories with OSM filters, business name generators, and metadata

export const categoriesList = [
  {
    id: "all",
    label: "All Business Sectors (Broad Search)",
    osmFilter: '["name"]',
    tagMatch: null,
    namePrefixes: ["Apex", "Vertex", "Summit", "Nexus", "Pinnacle", "Vanguard", "Horizon", "Prime", "Sterling", "Beacon"],
    nameSuffixes: ["Enterprises", "Group", "Holdings", "Global", "Solutions", "Services", "Hub", "Partners", "Ventures"]
  },
  {
    id: "tech_software",
    label: "Software & Technology Companies",
    osmFilter: '["office"~"it|telecommunication|company|software",i]',
    tagMatch: ["office", "craft"],
    namePrefixes: ["CloudScale", "ByteWave", "DataCore", "InnoSphere", "NextGen", "CyberPulse", "CodeCraft", "Synapse", "QuantumSoft", "AlphaTech", "OmniLogic"],
    nameSuffixes: ["Technologies", "Labs", "Software", "Digital Solutions", "Systems", "AI Labs", "Tech Studio", "Software Group"]
  },
  {
    id: "it_agencies",
    label: "IT Services, Cloud & Web Agencies",
    osmFilter: '["office"~"it|advertising|web",i]',
    tagMatch: ["office"],
    namePrefixes: ["PixelPoint", "BlueSky", "CyberNest", "WebForge", "DevMatrix", "CodeBridge", "HyperSync", "InfraCloud", "NetWorks Pro"],
    nameSuffixes: ["IT Solutions", "Cloud Services", "Digital Agency", "Web Innovations", "Networks", "IT Consulting"]
  },
  {
    id: "restaurants_cafes",
    label: "Restaurants, Bistros & Cafes",
    osmFilter: '["amenity"~"restaurant|cafe|fast_food|bar|bistro",i]',
    tagMatch: ["amenity"],
    namePrefixes: ["The Rustic", "Artisan", "Golden Spoon", "Olive & Basil", "Copper Kettle", "Urban Spice", "Velvet Fork", "Saffron", "Coastal Table", "The Roastery"],
    nameSuffixes: ["Bistro", "Restaurant & Lounge", "Cafe & Roastery", "Kitchen & Bar", "Gourmet Grill", "Eatery", "Trattoria", "Dining Room"]
  },
  {
    id: "hospitality_hotels",
    label: "Hotels, Resorts & Hospitality",
    osmFilter: '["tourism"~"hotel|motel|guest_house|resort",i]',
    tagMatch: ["tourism"],
    namePrefixes: ["Grand Palace", "Royal Orchid", "The Kensington", "Emerald Bay", "Crown Regency", "Silverstone", "Ambassador", "The Heritage", "Metropolitan"],
    nameSuffixes: ["Hotel & Suites", "Resort & Spa", "Boutique Hotel", "Inn & Suites", "Grand Hotel", "International Hotel", "Lodge"]
  },
  {
    id: "real_estate",
    label: "Real Estate & Property Consultants",
    osmFilter: '["office"~"estate_agent|property|realtor",i]',
    tagMatch: ["office"],
    namePrefixes: ["Cornerstone", "Prestige", "Urban Living", "Landmark", "MetroRealty", "PrimeSpace", "Signature", "Evergreen", "Compass", "KeyStone"],
    nameSuffixes: ["Properties", "Real Estate", "Realty Group", "Estates", "Property Advisors", "Developments", "Commercial Real Estate"]
  },
  {
    id: "healthcare_clinics",
    label: "Hospitals, Clinics & Medical Centers",
    osmFilter: '["amenity"~"hospital|clinic|doctors|health_post",i]',
    tagMatch: ["amenity"],
    namePrefixes: ["CareFirst", "Lifeline", "MetroHealth", "Genesis", "Apex Medical", "Nova", "St. Jude", "Trinity", "Pulse", "HealthWell"],
    nameSuffixes: ["Medical Center", "Clinic & Diagnostics", "Specialty Hospital", "Healthcare Group", "Family Medicine", "Wellness Center"]
  },
  {
    id: "dental_clinics",
    label: "Dental Clinics & Orthodontics",
    osmFilter: '["amenity"="dentist"]',
    tagMatch: ["amenity"],
    namePrefixes: ["SmileCraft", "Pearl White", "DentalCare Pro", "BrightSmile", "Crown & Root", "Aesthetic Smiles", "Optima Dental", "Gentle Dental"],
    nameSuffixes: ["Dental Clinic", "Orthodontics & Implants", "Dental Studio", "Oral Care Center", "Family Dental Practice"]
  },
  {
    id: "legal_attorneys",
    label: "Legal Firms & Corporate Attorneys",
    osmFilter: '["office"~"lawyer|legal|advocate|attorney",i]',
    tagMatch: ["office"],
    namePrefixes: ["Sterling & Sterling", "Vanguard Law", "Justice Alliance", "Lexington Legal", "Blackwood & Partners", "Capitol Advocates", "Apex Law"],
    nameSuffixes: ["Legal LLP", "Attorneys at Law", "Law Firm", "Advocates & Solicitors", "Corporate Legal Counsel", "Partners"]
  },
  {
    id: "finance_accounting",
    label: "Accounting, Tax & Financial Advisory",
    osmFilter: '["office"~"accountant|financial|tax_advisor|finance",i]',
    tagMatch: ["office"],
    namePrefixes: ["ClearView", "Prudential", "Equinox", "BalanceSheet Pro", "WealthCraft", "Crest Financial", "Ledger & Co.", "Summit Capital"],
    nameSuffixes: ["Financial Advisory", "Accountants & CPAs", "Capital Partners", "Wealth Management", "Tax Consultants", "Audit & Advisory"]
  },
  {
    id: "retail_stores",
    label: "Retail Stores, Marts & Supermarkets",
    osmFilter: '["shop"~"supermarket|convenience|department_store|mall|clothes",i]',
    tagMatch: ["shop"],
    namePrefixes: ["Urban Mart", "Metro Bazaar", "FreshChoice", "Prime Grocers", "Daily Essentials", "MegaStore", "TrendWear", "Lifestyle Emporium"],
    nameSuffixes: ["Supermarket", "Hypermarket", "Retail Outlets", "Department Store", "Provisions", "Boutique", "Emporium"]
  },
  {
    id: "fitness_gyms",
    label: "Gyms, Fitness Centers & Yoga Studios",
    osmFilter: '["leisure"~"fitness_centre|sports_centre",i]',
    tagMatch: ["leisure"],
    namePrefixes: ["IronPulse", "PureFit", "Titan Gym", "Velocity", "FlexZone", "Peak Performance", "CoreStrength", "ZenFlow", "BodyTransform"],
    nameSuffixes: ["Fitness Club", "Gym & CrossFit", "Health & Wellness", "Yoga Studio", "Athletic Club", "Fitness Arena"]
  },
  {
    id: "salons_spas",
    label: "Beauty Salons, Spas & Wellness",
    osmFilter: '["shop"~"hairdresser|beauty|massage",i]',
    tagMatch: ["shop"],
    namePrefixes: ["Luxe Glow", "Aura", "Serenity", "Glamour Touch", "Silk & Stone", "Velvet Salon", "Elegance", "Bella", "Nirvana"],
    nameSuffixes: ["Hair & Beauty Salon", "Day Spa & Wellness", "Aesthetics Lounge", "Nail & Skin Studio", "Beauty Bar"]
  },
  {
    id: "automotive",
    label: "Automotive Dealers & Repair Garages",
    osmFilter: '["shop"~"car|car_repair|car_parts",i]',
    tagMatch: ["shop"],
    namePrefixes: ["Precision Auto", "Apex Motors", "DriveWell", "TurboWorks", "Premier Auto Care", "Velocity Garage", "AutoStar", "ProMechanic"],
    nameSuffixes: ["Auto Repair & Service", "Motors & Dealership", "Car Care Center", "Automotive Garage", "Tire & Brake Pro"]
  },
  {
    id: "construction_contractors",
    label: "Construction, Architecture & Engineering",
    osmFilter: '["office"~"architect|construction|engineer",i]',
    tagMatch: ["office"],
    namePrefixes: ["BuildCorp", "SolidFoundation", "Blueprint", "Apex Structural", "TerraForge", "Skyline Developers", "SteelCraft", "Urban Build"],
    nameSuffixes: ["Construction LLC", "Architects & Engineers", "Building Contractors", "Design-Build Studio", "Infrastructure Group"]
  },
  {
    id: "logistics_freight",
    label: "Logistics, Freight & Warehousing",
    osmFilter: '["office"~"logistics|freight|courier",i]',
    tagMatch: ["office"],
    namePrefixes: ["GlobalTrans", "SpeedX Cargo", "Apex Logistics", "SwiftRoute", "CrossContinental", "TransOceanic", "Harbor Freight", "DirectMove"],
    nameSuffixes: ["Logistics & Supply Chain", "Freight Forwarders", "Express Cargo", "Warehousing & Distribution", "Transport Services"]
  },
  {
    id: "marketing_media",
    label: "Digital Marketing, SEO & PR Agencies",
    osmFilter: '["office"~"advertising|marketing|media",i]',
    tagMatch: ["office"],
    namePrefixes: ["BrandSphere", "Elevate Media", "OmniGrowth", "ReachSpark", "Catalyst Digital", "Impact PR", "ViralScale", "AdVantage"],
    nameSuffixes: ["Marketing Group", "Digital Media Agency", "Growth & SEO", "Creative Studio", "Communications & PR"]
  },
  {
    id: "education_academies",
    label: "Schools, Universities & Training Academies",
    osmFilter: '["amenity"~"school|college|university|language_school",i]',
    tagMatch: ["amenity"],
    namePrefixes: ["Oakridge", "Beacon Academy", "Cambridge Prep", "Apex Institute", "St. Andrews", "Pinnacle Learning", "Westminster", "Horizon"],
    nameSuffixes: ["Academy", "International School", "Training Institute", "Learning Center", "College & Prep", "Skills Academy"]
  },
  {
    id: "pharmacy_biotech",
    label: "Pharmacies & Medical Supplies",
    osmFilter: '["amenity"="pharmacy"]',
    tagMatch: ["amenity"],
    namePrefixes: ["MediCare Plus", "LifePharma", "Wellness Chemist", "Apex Pharmacy", "HealthFirst Rx", "NovaCare", "GreenCross", "Express Chemist"],
    nameSuffixes: ["Pharmacy & Drugstore", "Chemists", "Medical Supplies", "Pharmaceuticals", "Wellness Pharmacy"]
  },
  {
    id: "solar_energy",
    label: "Solar, Renewable Energy & Electrical",
    osmFilter: '["office"~"energy|solar|electric",i]',
    tagMatch: ["office"],
    namePrefixes: ["SunPower Systems", "EcoVolt", "Solaris Pro", "GreenGrid", "Photon Energy", "ClearSun", "TerraEnergy", "SunBright"],
    nameSuffixes: ["Solar Solutions", "Renewable Energy LLC", "CleanTech Power", "Solar Installations", "Energy Systems"]
  }
];
