// Login vive fuera del shell del backoffice (sin sidebar ni app-header): usa
// el root layout y sólo necesita un contenedor propio a pantalla completa que
// pueda scrollear en mobile (el body es overflow-hidden). Es SOLO visual.
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col overflow-y-auto bg-background">
      {children}
    </div>
  );
}
