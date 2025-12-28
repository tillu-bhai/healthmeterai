import { Activity } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-secondary/30 border-t border-border mt-auto">
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <a href="/" className="flex items-center gap-2.5 mb-4">
              <div className="h-9 w-9 rounded-xl gradient-hero flex items-center justify-center">
                <Activity className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl text-foreground">
                Medi<span className="text-primary">Scope</span>
              </span>
            </a>
            <p className="text-sm text-muted-foreground">
              Your trusted source for verified medical information and research.
            </p>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Disease Library</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Drug Database</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Symptom Checker</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Research Papers</a></li>
            </ul>
          </div>

          {/* Sources */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Our Sources</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">WHO</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">NIH</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">PubMed</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">CDC</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Medical Disclaimer</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} MediScope AI. For educational purposes only. Not a substitute for medical advice.</p>
        </div>
      </div>
    </footer>
  );
};
