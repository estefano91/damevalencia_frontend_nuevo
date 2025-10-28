import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShieldAlert, CheckCircle, AlertTriangle, Users, FileText, Lock } from "lucide-react";
import Navigation from "@/components/Navigation";

const Disclaimer = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <ShieldAlert className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Disclaimer & Legal Notice</h1>
          </div>
          <p className="text-muted-foreground">
            Important information about AURA Sports and its services
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6 space-y-6">
            {/* Summary Box */}
            <div className="bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    Key Information
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    AURA Sports is a <strong>digital intermediation platform</strong> that connects 
                    professionals in the sports ecosystem. We facilitate networking and visibility 
                    but do not participate in, guarantee, or take responsibility for agreements, 
                    contracts, or transactions between users.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 1: Purpose */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-semibold">1. Purpose of the Platform</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                AURA Sports is designed to connect people and opportunities within the sports 
                ecosystem. Our platform enables visibility and networking among:
              </p>
              <ul className="list-disc list-inside mt-3 space-y-2 text-muted-foreground ml-4">
                <li><strong>Players</strong> seeking teams, coaches, agents, or opportunities</li>
                <li><strong>Coaches</strong> looking to develop talent or join organizations</li>
                <li><strong>Clubs & Teams</strong> in search of players, coaches, or support staff</li>
                <li><strong>Agents</strong> seeking to represent athletes or negotiate opportunities</li>
                <li><strong>Sponsors & Investors</strong> exploring opportunities in sports</li>
              </ul>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                By facilitating these connections, AURA Sports empowers the global sports 
                community to discover and engage with relevant opportunities efficiently.
              </p>
            </section>

            <Separator />

            {/* Section 2: Disclaimer of Liability */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <h2 className="text-2xl font-semibold">2. Disclaimer of Liability</h2>
              </div>
              
              <div className="space-y-4">
                <div className="bg-orange-50 dark:bg-orange-950/20 border-l-4 border-orange-500 p-4 rounded-r-lg">
                  <p className="font-semibold mb-2">User-Generated Content</p>
                  <p className="text-sm text-muted-foreground">
                    AURA Sports is <strong>not responsible</strong> for the accuracy, truthfulness, 
                    or legality of user-generated content including profiles, offers, references, 
                    communications, or any other information posted on the platform by users.
                  </p>
                </div>

                <div className="bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 p-4 rounded-r-lg">
                  <p className="font-semibold mb-2">No Guarantees on Outcomes</p>
                  <p className="text-sm text-muted-foreground">
                    AURA Sports <strong>does not guarantee</strong> the outcome of any interaction, 
                    agreement, contract, or transaction initiated through or facilitated by the 
                    platform. Users engage with each other at their own discretion and risk.
                  </p>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-950/20 border-l-4 border-yellow-500 p-4 rounded-r-lg">
                  <p className="font-semibold mb-2">User Responsibility</p>
                  <p className="text-sm text-muted-foreground">
                    Users are <strong>solely responsible</strong> for:
                  </p>
                  <ul className="list-disc list-inside mt-2 ml-4 text-sm text-muted-foreground space-y-1">
                    <li>Verifying the authenticity and accuracy of information</li>
                    <li>Conducting due diligence on potential partners</li>
                    <li>Negotiating terms and conditions of any agreement</li>
                    <li>Complying with applicable local, national, and international laws</li>
                    <li>Ensuring legal validity of contracts and transactions</li>
                  </ul>
                </div>
              </div>
            </section>

            <Separator />

            {/* Section 3: Independent Relations */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h2 className="text-2xl font-semibold">3. Independent Relations</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                All connections, communications, agreements, and contracts initiated through 
                AURA Sports are <strong>strictly between the parties involved</strong>. 
                AURA Sports does not:
              </p>
              <ul className="list-disc list-inside mt-3 space-y-2 text-muted-foreground ml-4">
                <li>Act as an employer, recruiter, or representative of any user</li>
                <li>Mediate, negotiate, or participate in agreements between users</li>
                <li>Endorse, recommend, or vouch for any specific user or opportunity</li>
                <li>Assume responsibility for contractual or financial obligations</li>
                <li>Intervene in disputes or disagreements between users</li>
              </ul>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Users must enter into all relationships and transactions independently, with 
                appropriate legal, financial, and professional advice when necessary.
              </p>
            </section>

            <Separator />

            {/* Section 4: Referral System */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <h2 className="text-2xl font-semibold">4. Referral System</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                AURA Sports provides a mechanism for referrals and rewards (the "Hazte Referente" 
                program) that allows users to:
              </p>
              <ul className="list-disc list-inside mt-3 space-y-2 text-muted-foreground ml-4">
                <li>Share opportunities with their network</li>
                <li>Earn points and recognition for facilitating connections</li>
                <li>Participate in gamified community engagement</li>
              </ul>
              <div className="bg-yellow-50 dark:bg-yellow-950/20 border-l-4 border-yellow-500 p-4 rounded-r-lg mt-3">
                <p className="text-sm text-muted-foreground">
                  AURA Sports <strong>does not mediate or validate</strong> hiring processes, 
                  recruitment decisions, or financial exchanges between users. The referral 
                  system is a community engagement feature only and does not constitute 
                  endorsement or guarantee of outcomes.
                </p>
              </div>
            </section>

            <Separator />

            {/* Section 5: Privacy & Security */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Lock className="h-5 w-5 text-purple-600" />
                <h2 className="text-2xl font-semibold">5. Privacy & Security Notice</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Personal and professional data shared within AURA Sports is governed by our 
                Privacy Policy. However, users must understand and acknowledge:
              </p>
              <ul className="list-disc list-inside mt-3 space-y-2 text-muted-foreground ml-4">
                <li>Information shared on public profiles is visible to other users</li>
                <li>AURA Sports implements security measures but cannot guarantee absolute protection</li>
                <li>Users should <strong>avoid sharing sensitive or confidential information</strong> publicly</li>
                <li>Financial details, passwords, or identification documents should never be shared</li>
                <li>Professional communications should remain private and secure</li>
              </ul>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                By using AURA Sports, users agree to handle data responsibly and report any 
                security concerns or inappropriate behavior immediately.
              </p>
            </section>

            <Separator />

            {/* Section 6: Final Clause */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-5 w-5 text-indigo-600" />
                <h2 className="text-2xl font-semibold">6. Acceptance of Terms</h2>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-950/20 border-2 border-indigo-200 dark:border-indigo-800 rounded-lg p-6">
                <p className="text-muted-foreground leading-relaxed mb-4">
                  By accessing and using AURA Sports, users acknowledge and agree that:
                </p>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>AURA Sports acts <strong>solely as an informational and connective platform</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>Users are <strong>solely responsible</strong> for their interactions, decisions, and agreements</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>AURA Sports has <strong>no legal responsibility</strong> for outcomes of user interactions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>Users will comply with all applicable laws and regulations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>Users have read, understood, and accept this Disclaimer in its entirety</span>
                  </li>
                </ul>
              </div>
            </section>

            <Separator />

            {/* Additional Resources */}
            <section>
              <h3 className="text-xl font-semibold mb-4">Additional Resources</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-4 px-4"
                  onClick={() => navigate("/privacy")}
                >
                  <FileText className="mr-3 h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">Privacy Policy</div>
                    <div className="text-xs text-muted-foreground">How we handle your data</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-4 px-4"
                  onClick={() => navigate("/terms")}
                >
                  <FileText className="mr-3 h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">Terms of Use</div>
                    <div className="text-xs text-muted-foreground">Platform usage guidelines</div>
                  </div>
                </Button>
              </div>
            </section>

            <Separator />

            {/* Contact */}
            <section className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                For questions or concerns about this Disclaimer, please contact us:
              </p>
              <p className="text-sm font-medium">
                Email: support@aura-sports.app
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </section>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="flex justify-center mt-6">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back to Application
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Disclaimer;


