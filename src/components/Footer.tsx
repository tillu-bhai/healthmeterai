import { Activity } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="glass border-t border-border/30 mt-auto relative overflow-hidden">
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
      
      <div className="container relative py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform metallic-shine">
                <Activity className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl text-foreground">
                Medi<span className="text-primary">Scope</span>
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
              <li><Link to="/diseases" className="text-muted-foreground hover:text-foreground transition-colors">Disease Library</Link></li>
              <li><Link to="/drugs" className="text-muted-foreground hover:text-foreground transition-colors">Drug Database</Link></li>
              <li><Link to="/symptoms" className="text-muted-foreground hover:text-foreground transition-colors">Symptom Checker</Link></li>
              <li><Link to="/research" className="text-muted-foreground hover:text-foreground transition-colors">Research Papers</Link></li>
            </ul>
          </div>

          {/* Sources */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Our Sources</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/source/who" className="text-muted-foreground hover:text-foreground transition-colors">WHO</Link></li>
              <li><Link to="/source/nih" className="text-muted-foreground hover:text-foreground transition-colors">NIH</Link></li>
              <li><Link to="/source/pubmed" className="text-muted-foreground hover:text-foreground transition-colors">PubMed</Link></li>
              <li><Link to="/source/cdc" className="text-muted-foreground hover:text-foreground transition-colors">CDC</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link to="/disclaimer" className="text-muted-foreground hover:text-foreground transition-colors">Medical Disclaimer</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
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
