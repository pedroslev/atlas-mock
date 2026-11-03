import { StaffTabs } from "@/components/admin/staff/staff-tabs";

// Marco común de la sección Staff: las dos pestañas arriba de cada pantalla.
export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <StaffTabs />
      {children}
    </div>
  );
}
