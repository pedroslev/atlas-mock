import type { LucideIcon } from "lucide-react";
import {
  Utensils,
  GraduationCap,
  Users,
  Coffee,
  DoorOpen,
  ClipboardList,
  MessageCircle,
  Wrench,
  Circle,
  Bed,
  Bell,
  Clock,
  Pause,
  Award,
  Briefcase,
  BookOpen,
  Stethoscope,
  Car,
  Heart,
  Headphones,
  Moon,
  Ban,
} from "lucide-react";

// Catálogo de íconos para estados auxiliares (aux_agent_status.icono, ADR-BD-004).
// La base guarda el nombre en un varchar (ej. "graduation-cap"); la UI —tanto el
// backoffice como el pad (Hermes)— resuelve ese string al ícono real para que el
// usuario vea el ícono, no el nombre técnico (feedback 2026-07-16). Elegir de este
// catálogo curado en el editor evita strings inválidos.
export const auxIconMap: Record<string, LucideIcon> = {
  circle: Circle,
  utensils: Utensils,
  coffee: Coffee,
  "graduation-cap": GraduationCap,
  users: Users,
  "door-open": DoorOpen,
  "clipboard-list": ClipboardList,
  "message-circle": MessageCircle,
  wrench: Wrench,
  bed: Bed,
  bell: Bell,
  clock: Clock,
  pause: Pause,
  award: Award,
  briefcase: Briefcase,
  "book-open": BookOpen,
  stethoscope: Stethoscope,
  car: Car,
  heart: Heart,
  headphones: Headphones,
  moon: Moon,
  ban: Ban,
};

// Orden de presentación en el selector de íconos del editor.
export const auxIconChoices = Object.keys(auxIconMap);

export function getAuxIcon(name: string | undefined | null): LucideIcon {
  if (!name) return Circle;
  return auxIconMap[name] ?? Circle;
}
