import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { AlertTriangle, Stethoscope, BookOpen, Shield, Phone, Users } from "lucide-react";

const Disclaimer = () => {
  const lastUpdated = "December 28, 2025";

  return (
    <div className="min-h-screen flex flex-col bg-background noise-overlay">
      <Header />
      
      <main className="flex-1">
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-background" />
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-destructive/5 rounded-full blur-[120px]" />
          
          <div className="container relative max-w-4xl">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center p-4 rounded-2xl glass-button mb-6 border border-destructive/30">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                Medical Disclaimer
              </h1>
              <p className="text-muted-foreground">
                Last updated: {lastUpdated}
              </p>
            </div>

            {/* Important Notice Banner */}
            <div className="mb-8 p-6 rounded-2xl border-2 border-destructive/50 bg-destructive/10">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-8 w-8 text-destructive shrink-0 mt-1" />
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground mb-2">
                    Important: Please Read Carefully
                  </h2>
                  <p className="text-muted-foreground">
                    The information provided by MediScope AI is for <strong className="text-foreground">general educational and informational purposes only</strong>. 
                    It is not intended to be, and should not be construed as, medical advice, diagnosis, or treatment recommendations.
                  </p>
                </div>
              </div>
            </div>

            <Card className="glass-card p-8 md:p-12">
              <div className="prose prose-invert max-w-none">
                <section className="mb-10">
                  <h2 className="font-display text-2xl font-semibold text-foreground mb-4 flex items-center gap-3">
                    <Stethoscope className="h-6 w-6 text-primary" />
                    Not Medical Advice
                  </h2>
                  <div className="text-muted-foreground space-y-4">
                    <p className="leading-relaxed">
                      MediScope AI is an AI-powered health information aggregator. We compile and summarize 
                      information from trusted medical sources including the World Health Organization (WHO), 
                      National Institutes of Health (NIH), Centers for Disease Control and Prevention (CDC), 
                      PubMed, and other peer-reviewed publications.
                    </p>
                    <p className="leading-relaxed font-semibold text-foreground">
                      This information is NOT:
                    </p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>A substitute for professional medical advice</li>
                      <li>A replacement for consultation with qualified healthcare providers</li>
                      <li>Intended to diagnose, treat, cure, or prevent any disease</li>
                      <li>A recommendation for any specific treatment, medication, or procedure</li>
                    </ul>
                  </div>
                </section>

                <section className="mb-10">
                  <h2 className="font-display text-2xl font-semibold text-foreground mb-4 flex items-center gap-3">
                    <Users className="h-6 w-6 text-primary" />
                    Always Consult Healthcare Professionals
                  </h2>
                  <div className="text-muted-foreground space-y-4">
                    <p className="leading-relaxed">
                      Always seek the advice of your physician, pharmacist, or other qualified health provider 
                      with any questions you may have regarding:
                    </p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>A medical condition or symptom</li>
                      <li>Starting, stopping, or changing any medication</li>
                      <li>Treatment options and their risks and benefits</li>
                      <li>Diet, exercise, or lifestyle changes</li>
                      <li>Medical tests or procedures</li>
                    </ul>
                    <p className="leading-relaxed">
                      Never disregard professional medical advice or delay seeking it because of something you 
                      have read on MediScope AI.
                    </p>
                  </div>
                </section>

                <section className="mb-10 p-6 rounded-xl border border-destructive bg-destructive/10">
                  <h2 className="font-display text-2xl font-semibold text-foreground mb-4 flex items-center gap-3">
                    <Phone className="h-6 w-6 text-destructive" />
                    Medical Emergencies
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    <strong className="text-destructive">If you think you may have a medical emergency, call your doctor, 
                    go to the nearest emergency room, or call emergency services (911 in the US) immediately.</strong>
                  </p>
                  <p className="text-muted-foreground mt-4">
                    Do not rely on information from MediScope AI for emergency medical situations.
                  </p>
                </section>

                <section className="mb-10">
                  <h2 className="font-display text-2xl font-semibold text-foreground mb-4 flex items-center gap-3">
                    <BookOpen className="h-6 w-6 text-primary" />
                    Information Accuracy and Sources
                  </h2>
                  <div className="text-muted-foreground space-y-4">
                    <p className="leading-relaxed">
                      While we strive to provide accurate and up-to-date health information sourced from 
                      authoritative medical organizations, we cannot guarantee:
                    </p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>The completeness or accuracy of any information</li>
                      <li>That information reflects the most current medical research or guidelines</li>
                      <li>That AI-generated summaries are free from errors or misinterpretations</li>
                      <li>That information applies to your specific medical situation</li>
                    </ul>
                    <p className="leading-relaxed">
                      Medical knowledge evolves rapidly, and information that was accurate when published may 
                      become outdated. Always verify information with current medical resources and your healthcare providers.
                    </p>
                  </div>
                </section>

                <section className="mb-10">
                  <h2 className="font-display text-2xl font-semibold text-foreground mb-4 flex items-center gap-3">
                    <Shield className="h-6 w-6 text-primary" />
                    Limitation of Liability
                  </h2>
                  <div className="text-muted-foreground space-y-4">
                    <p className="leading-relaxed">
                      MediScope AI, its creators, operators, and affiliates shall not be liable for any damages, 
                      including but not limited to:
                    </p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Personal injury, illness, or death</li>
                      <li>Delayed diagnosis or treatment</li>
                      <li>Medication errors or adverse drug reactions</li>
                      <li>Any other harm arising from reliance on information provided</li>
                    </ul>
                    <p className="leading-relaxed">
                      By using this service, you acknowledge that you understand and accept these limitations.
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
                    Acknowledgment
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    By using MediScope AI, you acknowledge that you have read, understood, and agree to be bound 
                    by this Medical Disclaimer. If you do not agree with any part of this disclaimer, please 
                    discontinue use of the service immediately.
                  </p>
                </section>
              </div>
            </Card>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Disclaimer;
