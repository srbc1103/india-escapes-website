import icon from './public/icon.png'
import logo from './public/logo.png'
import logo_white from './public/logo_white.png'
import hero_bg from './public/hero_bg.png'
import footer_bg from './public/footer_bg.png'
import about_page_img from './public/about_page_img.png'
import about_page_top_img from './public/about_page_top_img.png'
import placeholder from './public/placeholder.jpg'
import call from './public/call.png'
import more from './public/more-regions.png'
import north from './public/north.png'
import south from './public/south.png'
import hptdc from './public/hptdc1.png'
import get_your_guide from './public/get_your_guide.png'
import trip_advisor from './public/trip_advisor.png'
import we_travel from './public/we_travel.png'
import tour_radar from './public/tour_radar.png'
import viator from './public/viator.png'
import nidhi from './public/nidhi.png'
import travel_for_life from './public/travel_for_life.png'
import ministry_of_tourism from './public/ministry_of_tourism.png'
import tts_bg from './public/tts_bg.png'
import white_strip from './public/white_strip.png'
import west from './public/west-central.png'
import packages_page_top_img from './public/packages_page_top_img.png'
import partners from './public/partners.png'
import booking_page_bg_img from './public/booking_page_bg_img.png'
import doc from './public/doc.png'
import trip_advisor_logo from './public/trip_advisor_logo.png'
import review_graphic from './public/review_graphic.webp'
import { Bath, BedDouble, Binoculars, Bus, Car, CircleX, DoorOpen, HandPlatter, Info, MapPinHouse, MapPinned, PlaneTakeoff, ShieldHalf, ShoppingCart, Ticket, User, Wine } from "lucide-react";

export const IMAGES = {
  logo, logo_white, hero_bg, footer_bg, about_page_img, about_page_top_img, placeholder, call, packages_page_top_img, partners, booking_page_bg_img, icon, tts_bg, white_strip, hptdc, get_your_guide, trip_advisor, we_travel, tour_radar, viator, nidhi, travel_for_life, ministry_of_tourism, doc, review_graphic, trip_advisor_logo
}

export const REGIONS = [
  {id:'North India',name:'North India',slug:'north-india',img:north},
  {id:'South India',name:'South India',slug:'south-india',img:south},
  {id:'West & Central India',name:'West & Central India',slug:'west-central-india',img:west},
  {id:'More Regions',name:'More Regions',slug:'more-regions',img:more},
]

export const COLLECTIONS = {
    ITINERARY:'itinerary',
    PACKAGES:'packages',
    BUCKET_ID:'6944523e002d70d78c2e',
    MEDIA_METADATA:'media_metadata',
    LOCATIONS:'locations',
    ACTIVITIES:'activities',
    ACCOMMODATIONS:'accommodations',
    TAGS:'tags',
    DEALS:'deals',
    DESTINATIONS:'destinations',
    CATEGORIES:'categories',
    USERS:'users',
    EXPENSES:'package_expenses',
    QUERIES:'queries',
    LABELS:'labels',
    BLOGS:'blogs',
    FAQ:'faq',
    SETTINGS: 'settings',
    INCLUSIONS: 'package_inclusions',
    EXCLUSIONS: 'package_exclusions',
    INFO: 'package_important_informaion',
    FEATURED_IMAGE: 'featured_image',
    REVIEWS: 'reviews_stats',
}

export const FEATURED_IMAGE_PAGE_MAP = {
  about_us:'6944442864a85a5616f8',
  blogs:'6944442864a7634ef0f2',
  contact_us:'6944442864a67a5ce9e9',
  destinations:'6944442864a487bff800',
  faq:'6944442864a3851a412e',
  deals:'6944442864a57d95bc23',
  north_india:'6944442864a1c6f2d932',
  south_india:'6944442864a0cf08f129',
  west_central_india:'69444428649fd9aea6e2',
  more_regions:'69444428649efaa3acf1',
  privacy_policy:'6944442864a2b439d086',
  categories:'69444428649ddb663888',
  tours:'69444428649c3819b852',
  tnc:'69444428649096f70115'
}

export const ICON_MAP = {
  // Inclusions
  accommodation: BedDouble,
  hotel: BedDouble,
  stay: BedDouble,
  lodging: BedDouble,

  flight: PlaneTakeoff,
  flights: PlaneTakeoff,
  airfare: PlaneTakeoff,

  meal: HandPlatter,
  meals: HandPlatter,
  breakfast: HandPlatter,
  lunch: HandPlatter,
  dinner: HandPlatter,
  dining: HandPlatter,
  food: HandPlatter,

  transport: Bus,
  transportation: Bus,
  transfer: Bus,
  cab: Car,
  vehicle: Bus,

  guide: MapPinned,
  tour: MapPinHouse,
  sightseeing: Binoculars,
  entry: DoorOpen,
  tickets: Ticket,

  // Exclusions
  insurance: ShieldHalf,
  visa: CircleX,
  personal: User,
  optional: CircleX,
  additional: CircleX,
  extra: CircleX,
  tips: CircleX,
  gratuities: CircleX,
  laundry: Bath,
  shopping: ShoppingCart,
  alcohol: Wine,
  beverage: Wine,

  info: Info
};

export const LANGUAGES = [
    { code: "en", name: "English" },
    { code: "es", name: "Español" },
    { code: "fr", name: "Français" },
    { code: "de", name: "Deutsch" },
    { code: "it", name: "Italiano" },
    { code: "pt", name: "Português" },
    { code: "nl", name: "Nederlands" },
    { code: "pl", name: "Polski" },
    { code: "ru", name: "Русский" },
    { code: "zh", name: "中文" },
    { code: "ja", name: "日本語" },
    { code: "ko", name: "한국어" },
  ];

export const CURRENCIES = [
    { code: "INR", symbol: "₹", name: "Indian Rupee" },
    { code: "USD", symbol: "$", name: "US Dollar" },
    { code: "EUR", symbol: "€", name: "Euro" },
    { code: "GBP", symbol: "£", name: "British Pound" },
    { code: "AUD", symbol: "A$", name: "Australian Dollar" },
    { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
    { code: "JPY", symbol: "¥", name: "Japanese Yen" },
    { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  ];

// Exchange rates will be fetched dynamically from API
// Default fallback rates if API fails
export const FALLBACK_EXCHANGE_RATES = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0095,
  AUD: 0.018,
  CAD: 0.016,
  JPY: 1.8,
  CNY: 0.086,
};

export const HASH = {
    TOKEN:'p8aa2452bccd82ee129b46f7c4be79',
    EDIT_MODE:'c336dad5112d50a9f9b938cc80747b24',
    CREATE_MODE:'53f352c3d6d74d67d447223282011db4',
    MODE:'15d61712450a686a7f365adf4fef581f',
}

export const LIST_LIMIT = 25

export const DBID = '694423e30037647a97c1'
