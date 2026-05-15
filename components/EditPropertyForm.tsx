"use client";

import PropertyForm from "@/components/PropertyForm";

type Property = {
  id: number;
  name: string;
  location: string;
  price: number;
  rating: number;
  image: string;
  description: string;
  amenities: string[];
  gallery: string[];
};

type Props = {
  property: Property;
};

export default function EditPropertyForm({ property }: Props) {
  return <PropertyForm mode="edit" initialValues={property} />;
}
