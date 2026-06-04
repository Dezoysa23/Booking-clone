export type FacilityOption = {
  key: string;
  label: string;
  icon: string;
  group: string;
};

export const FACILITY_OPTIONS: FacilityOption[] = [
  // Internet
  { key: "wifi", label: "Free WiFi", icon: "wifi", group: "Internet" },
  // Parking & Transport
  { key: "parking", label: "Free Parking", icon: "local_parking", group: "Parking & Transport" },
  { key: "airport_shuttle", label: "Airport Shuttle", icon: "airport_shuttle", group: "Parking & Transport" },
  { key: "ev_charging", label: "EV Charging", icon: "ev_station", group: "Parking & Transport" },
  // Food & Drink
  { key: "breakfast", label: "Breakfast Included", icon: "free_breakfast", group: "Food & Drink" },
  { key: "restaurant", label: "Restaurant", icon: "restaurant", group: "Food & Drink" },
  { key: "bar", label: "Bar", icon: "local_bar", group: "Food & Drink" },
  { key: "room_service", label: "Room Service", icon: "room_service", group: "Food & Drink" },
  { key: "kitchen", label: "Kitchen", icon: "kitchen", group: "Food & Drink" },
  // Pool & Wellness
  { key: "pool", label: "Swimming Pool", icon: "pool", group: "Pool & Wellness" },
  { key: "spa", label: "Spa", icon: "spa", group: "Pool & Wellness" },
  { key: "gym", label: "Gym / Fitness Center", icon: "fitness_center", group: "Pool & Wellness" },
  // Room Features
  { key: "ac", label: "Air Conditioning", icon: "ac_unit", group: "Room Features" },
  { key: "balcony", label: "Balcony", icon: "balcony", group: "Room Features" },
  { key: "private_bathroom", label: "Private Bathroom", icon: "bathroom", group: "Room Features" },
  { key: "family_rooms", label: "Family Rooms", icon: "family_restroom", group: "Room Features" },
  // Views & Outdoor
  { key: "sea_view", label: "Sea View", icon: "beach_access", group: "Views & Outdoor" },
  { key: "mountain_view", label: "Mountain View", icon: "landscape", group: "Views & Outdoor" },
  { key: "lake_view", label: "Lake View", icon: "water", group: "Views & Outdoor" },
  { key: "garden", label: "Garden", icon: "yard", group: "Views & Outdoor" },
  // Accessibility
  { key: "wheelchair", label: "Wheelchair Accessible", icon: "accessible", group: "Accessibility" },
  // Policies
  { key: "pets_allowed", label: "Pet Friendly", icon: "pets", group: "Policies" },
  { key: "children_welcome", label: "Children Welcome", icon: "child_care", group: "Policies" },
  { key: "non_smoking", label: "Non-Smoking Rooms", icon: "smoke_free", group: "Policies" },
  { key: "free_cancellation", label: "Free Cancellation", icon: "event_available", group: "Policies" },
  { key: "pay_at_property", label: "Pay at Property", icon: "payments", group: "Policies" },
  // Safety
  { key: "cctv", label: "CCTV Security", icon: "videocam", group: "Safety" },
  { key: "smoke_alarms", label: "Smoke Alarms", icon: "detector_alarm", group: "Safety" },
];

export const FACILITY_GROUPS = Array.from(new Set(FACILITY_OPTIONS.map((f) => f.group)));

export function getFacilityByKey(key: string): FacilityOption | undefined {
  return FACILITY_OPTIONS.find((f) => f.key === key);
}

export const NEARBY_CATEGORIES = [
  { value: "VIEWPOINT", label: "Viewpoint", icon: "panorama", color: "#071B63" },
  { value: "BEACH", label: "Beach", icon: "beach_access", color: "#0891b2" },
  { value: "NATURE", label: "Nature", icon: "forest", color: "#059669" },
  { value: "RESTAURANT", label: "Restaurant", icon: "restaurant", color: "#dc2626" },
  { value: "CAFE", label: "Café", icon: "local_cafe", color: "#92400e" },
  { value: "CULTURE", label: "Culture", icon: "museum", color: "#7c3aed" },
  { value: "HISTORY", label: "History", icon: "account_balance", color: "#b45309" },
  { value: "SHOPPING", label: "Shopping", icon: "shopping_bag", color: "#db2777" },
  { value: "ACTIVITY", label: "Activity", icon: "directions_bike", color: "#0284c7" },
  { value: "TRANSPORT", label: "Transport", icon: "train", color: "#4b5563" },
  { value: "OTHER", label: "Other", icon: "place", color: "#6b7280" },
] as const;

export type NearbyCategoryValue = typeof NEARBY_CATEGORIES[number]["value"];

export const USER_PHOTO_CATEGORIES = [
  { value: "VIEW", label: "View / Scenery" },
  { value: "NEARBY_PLACE", label: "Nearby Place" },
  { value: "FOOD", label: "Food & Dining" },
  { value: "ROOM", label: "Room / Interior" },
  { value: "EXPERIENCE", label: "Experience / Activity" },
  { value: "OTHER", label: "Other" },
] as const;
