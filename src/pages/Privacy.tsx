import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Shield, Lock, Eye, Database, Globe, Mail } from "lucide-react";

const Privacy = () => {
  const lastUpdated = "December 28, 2025";

  return (
    <div className="min-h-screen flex flex-col bg-background noise-overlay">
      <Header />
      
      <main className="flex-1">
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-background" />
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
          
          <div className="container relative max-w-4xl">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center p-4 rounded-2xl glass-button mb-6">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                Privacy Policy
              </h1>
              <p className="text-muted-foreground">
                Last updated: {lastUpdated}
              </p>
            </div>

            <Card className="glass-card p-8 md:p-12">
              <div className="prose prose-invert max-w-none">
                <section className="mb-10">
                  <h2 className="font-display text-2xl font-semibold text-foreground mb-4 flex items-center gap-3">
                    <Lock className="h-6 w-6 text-primary" />
                    Introduction
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    MediScope AI ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
                    explains how we collect, use, disclose, and safeguard your information when you use our health 
                    information search service. Please read this policy carefully.
                  </p>
                </section>

                <section className="mb-10">
                  <h2 className="font-display text-2xl font-semibold text-foreground mb-4 flex items-center gap-3">
                    <Database className="h-6 w-6 text-primary" />
                    Information We Collect
                  </h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p><strong className="text-foreground">Search Queries:</strong> We collect the health-related search queries you submit to provide you with relevant results. These are processed by our AI systems and are not linked to your personal identity unless you are logged in.</p>
                    <p><strong className="text-foreground">Account Information:</strong> If you create an account, we collect your email address and password (encrypted) to provide personalized features and save your preferences.</p>
                    <p><strong className="text-foreground">Usage Data:</strong> We automatically collect information about how you interact with our service, including pages visited, time spent, and features used.</p>
                    <p><strong className="text-foreground">Device Information:</strong> We collect device type, browser type, IP address, and operating system for analytics and security purposes.</p>
                  </div>
                </section>

                <section className="mb-10">
                  <h2 className="font-display text-2xl font-semibold text-foreground mb-4 flex items-center gap-3">
                    <Eye className="h-6 w-6 text-primary" />
                    How We Use Your Information
                  </h2>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>To provide, maintain, and improve our health information services</li>
                    <li>To personalize your experience and save your preferences</li>
                    <li>To analyze usage patterns and improve our AI algorithms</li>
                    <li>To communicate with you about updates, security alerts, and support</li>
                    <li>To detect, prevent, and address technical issues and security threats</li>
                    <li>To comply with legal obligations and protect our rights</li>
                  </ul>
                </section>

                <section className="mb-10">
                  <h2 className="font-display text-2xl font-semibold text-foreground mb-4 flex items-center gap-3">
                    <Globe className="h-6 w-6 text-primary" />
                    Data Sharing and Disclosure
                  </h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p><strong className="text-foreground">We do not sell your personal information.</strong></p>
                    <p>We may share information with:</p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Service providers who assist in operating our platform (cloud hosting, analytics)</li>
                      <li>Law enforcement when required by law or to protect safety</li>
                      <li>Business partners in the event of a merger or acquisition</li>
                    </ul>
                  </div>
                </section>

                <section className="mb-10">
                  <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
                    Data Security
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We implement industry-standard security measures including encryption (TLS 1.3), secure data storage, 
                    regular security audits, and access controls. However, no method of transmission over the Internet 
                    is 100% secure, and we cannot guarantee absolute security.
                  </p>
                </section>

                <section className="mb-10">
                  <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
                    Your Rights
                  </h2>
                  <p className="text-muted-foreground mb-4">Depending on your location, you may have the right to:</p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Access the personal information we hold about you</li>
                    <li>Request correction of inaccurate information</li>
                    <li>Request deletion of your data</li>
                    <li>Object to or restrict processing of your data</li>
                    <li>Data portability (receive your data in a structured format)</li>
                    <li>Withdraw consent at any time</li>
                  </ul>
                </section>

                <section className="mb-10">
                  <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
                    Cookies and Tracking
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We use essential cookies for authentication and security. We also use analytics cookies to understand 
                    how users interact with our service. You can control cookie preferences through your browser settings.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-2xl font-semibold text-foreground mb-4 flex items-center gap-3">
                    <Mail className="h-6 w-6 text-primary" />
                    Contact Us
                  </h2>
                  <p className="text-muted-foreground">
                    If you have questions about this Privacy Policy or your data, please contact us at:{" "}
                    <a href="mailto:privacy@mediscope.ai" className="text-primary hover:underline">
                      privacy@mediscope.ai
                    </a>
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

export default Privacy;
