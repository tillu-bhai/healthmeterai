import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { FileText, AlertTriangle, Scale, Users, Shield, Ban } from "lucide-react";

const Terms = () => {
  const lastUpdated = "December 28, 2025";

  return (
    <div className="min-h-screen flex flex-col bg-background noise-overlay">
      <Header />
      
      <main className="flex-1">
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-background" />
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-accent/5 rounded-full blur-[120px]" />
          
          <div className="container relative max-w-4xl">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center p-4 rounded-2xl glass-button mb-6">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                Terms of Service
              </h1>
              <p className="text-muted-foreground">
                Last updated: {lastUpdated}
              </p>
            </div>

            <Card className="glass-card p-8 md:p-12">
              <div className="prose prose-invert max-w-none">
                <section className="mb-10">
                  <h2 className="font-display text-2xl font-semibold text-foreground mb-4 flex items-center gap-3">
                    <Scale className="h-6 w-6 text-primary" />
                    Acceptance of Terms
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    By accessing or using MediScope AI ("Service"), you agree to be bound by these Terms of Service. 
                    If you do not agree to all the terms and conditions, you must not access or use the Service. 
                    We may update these terms from time to time, and your continued use constitutes acceptance of changes.
                  </p>
                </section>

                <section className="mb-10">
                  <h2 className="font-display text-2xl font-semibold text-foreground mb-4 flex items-center gap-3">
                    <Users className="h-6 w-6 text-primary" />
                    Use of Service
                  </h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p><strong className="text-foreground">Eligibility:</strong> You must be at least 13 years old to use this Service. If you are under 18, you may only use the Service with parental or guardian consent.</p>
                    <p><strong className="text-foreground">Account:</strong> You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>
                    <p><strong className="text-foreground">Accuracy:</strong> You agree to provide accurate, current, and complete information when creating an account.</p>
                  </div>
                </section>

                <section className="mb-10 p-6 rounded-xl border border-destructive/50 bg-destructive/5">
                  <h2 className="font-display text-2xl font-semibold text-foreground mb-4 flex items-center gap-3">
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                    Medical Disclaimer
                  </h2>
                  <div className="text-muted-foreground space-y-4">
                    <p className="font-semibold text-destructive">
                      IMPORTANT: MediScope AI provides health information for educational purposes only.
                    </p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Information provided is NOT a substitute for professional medical advice, diagnosis, or treatment</li>
                      <li>Always consult a qualified healthcare provider for medical concerns</li>
                      <li>Never disregard professional medical advice based on information from this Service</li>
                      <li>If you think you have a medical emergency, call your doctor or emergency services immediately</li>
                      <li>We do not recommend or endorse any specific tests, physicians, products, or treatments</li>
                    </ul>
                  </div>
                </section>

                <section className="mb-10">
                  <h2 className="font-display text-2xl font-semibold text-foreground mb-4 flex items-center gap-3">
                    <Ban className="h-6 w-6 text-primary" />
                    Prohibited Uses
                  </h2>
                  <p className="text-muted-foreground mb-4">You may not use the Service to:</p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Provide medical diagnoses or treatment recommendations to others</li>
                    <li>Engage in any unlawful or fraudulent activity</li>
                    <li>Attempt to gain unauthorized access to our systems</li>
                    <li>Transmit malware, viruses, or harmful code</li>
                    <li>Scrape, data mine, or extract data without permission</li>
                    <li>Impersonate another person or entity</li>
                    <li>Violate any applicable laws or regulations</li>
                    <li>Use for commercial purposes without authorization</li>
                  </ul>
                </section>

                <section className="mb-10">
                  <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
                    Intellectual Property
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    The Service, including its original content (excluding user-generated content), features, and functionality, 
                    is owned by MediScope AI and protected by copyright, trademark, and other intellectual property laws. 
                    Health information is sourced from public databases and cited accordingly.
                  </p>
                </section>

                <section className="mb-10">
                  <h2 className="font-display text-2xl font-semibold text-foreground mb-4 flex items-center gap-3">
                    <Shield className="h-6 w-6 text-primary" />
                    Limitation of Liability
                  </h2>
                  <div className="text-muted-foreground space-y-4">
                    <p>
                      TO THE MAXIMUM EXTENT PERMITTED BY LAW, MEDISCOPE AI SHALL NOT BE LIABLE FOR ANY INDIRECT, 
                      INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:
                    </p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Loss of profits, data, or use</li>
                      <li>Personal injury or death arising from use of health information</li>
                      <li>Medical decisions made based on Service information</li>
                      <li>Errors or omissions in content</li>
                      <li>Unauthorized access to user data</li>
                    </ul>
                  </div>
                </section>

                <section className="mb-10">
                  <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
                    Indemnification
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    You agree to defend, indemnify, and hold harmless MediScope AI and its officers, directors, employees, 
                    and agents from any claims, damages, losses, liabilities, costs, or expenses arising from your use of 
                    the Service or violation of these Terms.
                  </p>
                </section>

                <section className="mb-10">
                  <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
                    Termination
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We may terminate or suspend your account and access to the Service immediately, without prior notice, 
                    for any reason, including breach of these Terms. Upon termination, your right to use the Service will 
                    immediately cease.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
                    Governing Law
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    These Terms shall be governed by and construed in accordance with applicable laws, without regard to 
                    conflict of law principles. Any disputes arising from these Terms or the Service will be resolved in 
                    the appropriate courts.
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

export default Terms;
