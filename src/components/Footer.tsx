import logoVerde from "@/assets/Logo_Verde.webp";

export const Footer = () => {
  return (
    <footer className="border-t bg-background/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm text-muted-foreground">Desenvolvido por</span>
          <img src={logoVerde} alt="Grou" className="h-6" />
        </div>
      </div>
    </footer>
  );
};
