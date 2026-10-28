import {
  Utensils, ShoppingCart, Car, Home, Zap, Film, ShoppingBag, Heart, Tag,
  Coffee, Plane, Book, Gift, Wrench, Smartphone, Briefcase, GraduationCap,
  Fuel, Baby, Dumbbell, Shirt, Music, Dog,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Utensils, ShoppingCart, Car, Home, Zap, Film, ShoppingBag, Heart, Tag,
  Coffee, Plane, Book, Gift, Wrench, Smartphone, Briefcase, GraduationCap,
  Fuel, Baby, Dumbbell, Shirt, Music, Dog,
};

export function getCategoryIcon(name?: string | null): LucideIcon {
  if (!name) return Tag;
  return ICONS[name] ?? Tag;
}

export const ICON_OPTIONS = Object.keys(ICONS);
