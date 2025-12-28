import { Activity } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="glass border-t border-border/30 mt-auto relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
      
      <div className="container relative py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="h-9 w-9 rounded-xl gradient-hero flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
                <Activity className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl text-foreground">
                Medi<span className="text-gradient">Scope</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your trusted source for verified medical information and research.
            </p>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Resources</h4>
            <ul className="space-y-2.5 text-sm">
              {["Disease Library", "Drug Database", "Symptom Checker", "Research Papers"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Sources */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Our Sources</h4>
            <ul className="space-y-2.5 text-sm">
              {["WHO", "NIH", "PubMed", "CDC"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2.5 text-sm">
              {["Privacy Policy", "Terms of Service", "Medical Disclaimer", "Contact"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border/30 mt-10 pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} MediScope AI. For educational purposes only. Not a substitute for medical advice.</p>
        </div>
      </div>
    </footer>
  );
};
