import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, MessageSquare, HelpCircle, Bug, Lightbulb, Send } from "lucide-react";

const contactReasons = [
  { id: "general", label: "General Inquiry", icon: MessageSquare },
  { id: "support", label: "Technical Support", icon: HelpCircle },
  { id: "bug", label: "Report a Bug", icon: Bug },
  { id: "feature", label: "Feature Request", icon: Lightbulb },
];

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("general");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast({
      title: "Message Sent!",
      description: "We'll get back to you within 24-48 hours.",
    });

    setName("");
    setEmail("");
    setMessage("");
    setReason("general");
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background noise-overlay">
      <Header />
      
      <main className="flex-1">
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-background" />
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
          
          <div className="container relative max-w-4xl">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center p-4 rounded-2xl glass-button mb-6">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                Contact Us
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                Have questions, feedback, or need assistance? We'd love to hear from you.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Contact Info */}
              <div className="space-y-6">
                <Card className="glass-card p-6">
                  <Mail className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-display font-semibold text-foreground mb-2">Email</h3>
                  <a href="mailto:support@mediscope.ai" className="text-muted-foreground hover:text-primary transition-colors">
                    support@mediscope.ai
                  </a>
                </Card>

                <Card className="glass-card p-6">
                  <MessageSquare className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-display font-semibold text-foreground mb-2">Response Time</h3>
                  <p className="text-muted-foreground">
                    We typically respond within 24-48 hours during business days.
                  </p>
                </Card>

                <Card className="glass-card p-6">
                  <HelpCircle className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-display font-semibold text-foreground mb-2">FAQ</h3>
                  <p className="text-muted-foreground">
                    Check our help documentation for quick answers to common questions.
                  </p>
                </Card>
              </div>

              {/* Contact Form */}
              <Card className="glass-card p-8 md:col-span-2">
                <h2 className="font-display text-2xl font-semibold text-foreground mb-6">
                  Send us a message
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        required
                        className="glass-button border-0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="glass-button border-0"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Reason for Contact</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {contactReasons.map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setReason(r.id)}
                          className={`flex items-center gap-2 p-3 rounded-xl transition-all ${
                            reason === r.id
                              ? "bg-primary text-primary-foreground"
                              : "glass-button hover:bg-secondary/50"
                          }`}
                        >
                          <r.icon className="h-4 w-4" />
                          <span className="text-sm font-medium">{r.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us how we can help..."
                      rows={5}
                      required
                      className="glass-button border-0 resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full gradient-hero text-primary-foreground h-12"
                  >
                    {isSubmitting ? (
                      <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </Card>
            </div>

            {/* Notice */}
            <div className="mt-12 text-center">
              <p className="text-sm text-muted-foreground">
                For medical emergencies, please call 911 or your local emergency services. 
                This form is not for medical advice or health consultations.
              </p>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Contact;
