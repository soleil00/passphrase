"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Shield, Lock } from "lucide-react"

export default function TermsComponent() {
  const [activeTab, setActiveTab] = useState("terms")

  return (
    <div className="max-w-4xl  px- md:px-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Legal Information</h1>
        <p className="text-muted-foreground">Our terms of service and privacy policy</p>
      </div>

      <Tabs defaultValue="terms" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-center mb-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="terms" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Terms of Service</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span>Privacy Policy</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="terms" className="mt-0">
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold">TERMS OF SERVICE</h2>
                  <p className="text-muted-foreground mt-2">Last Updated: March 13, 2025</p>
                </div>

                <div>
                  <p>
                    Welcome to PiPhrase! These Terms of Service (&quot;Terms&quot;) govern the legal conditions applicable when
                    you use our services at the website https://piphrase.com, particularly the &quot;Legal Authorization&quot;
                    service designed to assist in recovering your &quot;Pi wallet passphrase&quot; and &quot;Pi balance pending
                    unlock.&quot; By accessing or using our services, you agree to comply with these Terms. If you do not
                    agree, please refrain from using our services.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">1. Overview of the Service</h3>
                  <p>
                    PiPhrase provides a &quot;Legal Authorization&quot; service to assist users in recovering access to their Pi
                    wallet, including the Pi wallet passphrase and pending unlock Pi balance. To use this service, you
                    must provide the required information and adhere to the conditions outlined in these Terms.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">2. Conditions of Use</h3>
                  <p>To use our services, you must:</p>
                  <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li>Be the lawful owner of the Pi wallet you request recovery for.</li>
                    <li>Provide accurate, complete, and truthful information when using the service.</li>
                    <li>Agree to the service fees outlined in these Terms.</li>
                    <li>
                      Not use the service for any illegal purpose or intentionally provide false information to deceive
                      us or other users.
                    </li>
                  </ul>
                  <p className="mt-2">
                    We reserve the right to refuse service if we detect any violations on your part.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">3. Information Required from Users</h3>
                  <p>To facilitate the recovery process, you are required to provide the following information:</p>
                  <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li>Username: The username associated with your Pi account.</li>
                    <li>Email: Your email address for communication and verification purposes.</li>
                    <li>
                      Pi Balance + Unlock Schedule: Details of your current Pi balance and the scheduled unlock time.
                    </li>
                    <li>24-Word Wallet Passphrase (Complete or Partial): The secret passphrase for your Pi wallet.</li>
                    <li>
                      Mainnet Wallet Address for Recovery: The Mainnet wallet address where you wish to receive the
                      recovered Pi balance.
                    </li>
                    <li>Step 9 Mainnet Image: An image verifying Step 9 of the Mainnet transition process.</li>
                  </ul>
                  <p className="mt-2">
                    You are responsible for ensuring the accuracy and legality of this information. We are not liable if
                    the information you provide is incorrect or insufficient to complete the recovery process.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">4. Legal Authorization Process</h3>
                  <p>By using the &quot;Legal Authorization&quot; service, you:</p>
                  <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li>
                      Authorize PiPhrase to take necessary steps to recover access to your Pi wallet based on the
                      information you provide.
                    </li>
                    <li>
                      Agree that the recovery process will only proceed once we successfully verify your lawful
                      ownership of the Pi wallet.
                    </li>
                    <li>Commit to not using the service to misappropriate the assets of others.</li>
                  </ul>
                  <p className="mt-2">
                    <strong>Case of Stolen 24-Word Passphrase:</strong> If your 24-word passphrase is stolen due to
                    reasons such as your own disclosure of sensitive security information, entering the 24-word
                    passphrase into a scam website (webscam) resulting in the theft of Pi, or inability to access your
                    Pi balance or Pi account ownership, you consent to authorize the PiPhrase platform to assist in
                    recovering your Pi or wallet passphrase. The success of this recovery may vary and is dependent on
                    the technology and capabilities of our platform. You understand and accept that we are not liable if
                    recovery is not feasible due to factors beyond our control.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">5. Service Fees</h3>
                  <p>
                    <strong>Base Fee:</strong> A fee of 25% of the recovered Pi balance will be charged for each
                    successful recovery case as compensation for our services. This fee will be deducted directly from
                    the recovered Pi balance before transferring the remaining amount to your designated Mainnet wallet
                    address.
                  </p>
                  <p className="mt-2">
                    <strong>Special Case:</strong> If your wallet does not have the available 25% Pi to pay the fee
                    directly (due to the Pi being locked or insufficient balance), you must pay an amount equivalent to
                    25% of the recovered Pi balance in new Pi (from another source) before we release your recovered,
                    yet-to-be-unlocked Pi assets. Payment of this fee is a mandatory condition to complete the recovery
                    process.
                  </p>
                  <p className="mt-2">
                    You will be notified in advance of the Pi amount required for payment and may decline the service if
                    you do not agree to the fee.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">6. Responsibilities of PiPhrase</h3>
                  <p>We commit to:</p>
                  <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li>Conducting the recovery process transparently and in compliance with applicable laws.</li>
                    <li>
                      Securing the information you provide in accordance with the measures outlined in our Privacy
                      Policy.
                    </li>
                    <li>Assisting you to the best of our ability based on the information you provide.</li>
                  </ul>
                  <p className="mt-2">However, we are not responsible if:</p>
                  <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li>The information you provide is inaccurate or insufficient for recovering your Pi wallet.</li>
                    <li>Delays or errors arise from third-party systems (e.g., the Pi Network).</li>
                    <li>Your Pi assets are lost due to your actions or third parties unrelated to PiPhrase.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">7. Responsibilities of the User</h3>
                  <p>You agree to:</p>
                  <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li>Take full responsibility for the legality and accuracy of the information you provide.</li>
                    <li>Pay the service fees in full as required before receiving your recovered Pi assets.</li>
                    <li>Refrain from using the service for fraudulent or illegal activities.</li>
                    <li>Compensate PiPhrase for any damages we incur due to your violation of these Terms.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">8. Termination of Service</h3>
                  <p>We reserve the right to terminate or suspend your access to our services if:</p>
                  <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li>You violate any provision of these Terms.</li>
                    <li>We suspect you are using the service for illegal or fraudulent purposes.</li>
                    <li>
                      Your recovery request cannot be fulfilled due to errors on your part or factors beyond our
                      control.
                    </li>
                  </ul>
                  <p className="mt-2">
                    In the event of termination, you remain liable for any service fees already incurred (if
                    applicable).
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">9. Limitation of Liability</h3>
                  <p>Our services are provided on an &quot;as-is&quot; and &quot;as-available&quot; basis. We do not guarantee that:</p>
                  <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li>The service will always operate uninterrupted or error-free.</li>
                    <li>Every recovery request will be successful.</li>
                  </ul>
                  <p className="mt-2">
                    In all cases, PiPhrase&apos;s liability will not exceed the total amount of service fees you have paid to
                    us.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">10. Changes to the Terms of Service</h3>
                  <p>
                    We may update or modify these Terms at any time. Changes will be posted on the website
                    https://piphrase.com and take effect immediately upon publication. Your continued use of the service
                    after such changes constitutes your acceptance of the revised Terms.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">11. Contact Us</h3>
                  <p>If you have questions or need assistance regarding these Terms of Service, please contact us:</p>
                  <ul className="list-none mt-2">
                    <li>
                      <strong>Email:</strong> support@piphrase.com
                    </li>
                    <li>
                      <strong>Website:</strong> https://piphrase.com
                    </li>
                    <li>
                      <strong>Response Time:</strong> Within 48 hours of receiving your request.
                    </li>
                  </ul>
                </div>

                <div className="pt-4">
                  <p>
                    By using PiPhrase&apos;s services, you confirm that you have read, understood, and agree to abide by
                    these Terms of Service.
                  </p>
                  <p className="mt-4">
                    Sincerely,
                    <br />
                    The PiPhrase Team
                  </p>
                </div>
              </div>
            </ScrollArea>
          </div>
        </TabsContent>

        <TabsContent value="privacy" className="mt-0">
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold">PRIVACY POLICY</h2>
                  <p className="text-muted-foreground mt-2">Last Updated: March 13, 2025</p>
                </div>

                <div>
                  <p>
                    At PiPhrase, we are committed to protecting your privacy and ensuring the security of your personal
                    information. This Privacy Policy explains how we collect, use, disclose, and safeguard your
                    information when you use our website and services. Please read this policy carefully to understand
                    our practices regarding your personal data.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">1. Information We Collect</h3>
                  <p>We may collect the following types of information:</p>

                  <h4 className="font-medium mt-4 mb-1">1.1 Personal Information</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Username associated with your Pi account</li>
                    <li>Email address</li>
                    <li>Pi wallet passphrase (complete or partial)</li>
                    <li>Mainnet wallet address</li>
                    <li>Pi balance and unlock schedule details</li>
                    <li>Step 9 Mainnet verification images</li>
                  </ul>

                  <h4 className="font-medium mt-4 mb-1">1.2 Technical Information</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>IP address</li>
                    <li>Browser type and version</li>
                    <li>Device information</li>
                    <li>Operating system</li>
                    <li>Date and time of access</li>
                    <li>Pages visited</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">2. How We Use Your Information</h3>
                  <p>We use the collected information for the following purposes:</p>
                  <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li>To provide and maintain our services</li>
                    <li>To process and complete your Pi wallet recovery requests</li>
                    <li>To verify your identity and ownership of the Pi wallet</li>
                    <li>To communicate with you regarding your recovery request</li>
                    <li>To notify you about changes to our services</li>
                    <li>To detect and prevent fraudulent or unauthorized activities</li>
                    <li>To comply with legal obligations</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">3. Security of Your Information</h3>
                  <p>
                    We implement appropriate technical and organizational measures to protect your personal information,
                    including:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li>End-to-end encryption for sensitive data, especially wallet passphrases</li>
                    <li>Secure socket layer (SSL) technology</li>
                    <li>Regular security assessments and updates</li>
                    <li>Access controls and authentication procedures</li>
                    <li>Staff training on data protection and security practices</li>
                  </ul>
                  <p className="mt-2">
                    However, no method of transmission over the Internet or electronic storage is 100% secure. While we
                    strive to use commercially acceptable means to protect your personal information, we cannot
                    guarantee its absolute security.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">4. Data Retention</h3>
                  <p>
                    We retain your personal information only for as long as necessary to fulfill the purposes outlined
                    in this Privacy Policy, unless a longer retention period is required or permitted by law. Once the
                    purpose is achieved, we will securely delete or anonymize your information.
                  </p>
                  <p className="mt-2">
                    For security reasons, we may retain certain information related to completed recovery requests for a
                    limited period to prevent fraud and ensure compliance with our Terms of Service.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">5. Sharing Your Information</h3>
                  <p>
                    We do not sell, trade, or otherwise transfer your personal information to third parties except in
                    the following circumstances:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li>With service providers who assist us in operating our website and providing our services</li>
                    <li>When required by law, such as to comply with a subpoena or similar legal process</li>
                    <li>To protect our rights, property, or safety, or the rights, property, or safety of others</li>
                    <li>
                      In connection with a merger, acquisition, or sale of assets, with appropriate safeguards for your
                      data
                    </li>
                  </ul>
                  <p className="mt-2">
                    Any third parties with whom we share your information are contractually obligated to maintain the
                    confidentiality and security of your data.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">6. Your Rights</h3>
                  <p>
                    Depending on your location, you may have certain rights regarding your personal information,
                    including:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li>The right to access the personal information we hold about you</li>
                    <li>The right to request correction of inaccurate information</li>
                    <li>The right to request deletion of your information</li>
                    <li>The right to restrict or object to processing of your information</li>
                    <li>The right to data portability</li>
                    <li>The right to withdraw consent</li>
                  </ul>
                  <p className="mt-2">
                    To exercise these rights, please contact us using the information provided in the &quot;Contact Us&quot;
                    section.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">7. Cookies and Similar Technologies</h3>
                  <p>
                    We use cookies and similar tracking technologies to enhance your experience on our website. Cookies
                    are small files that a website places on your device to remember information about your visit. You
                    can set your browser to refuse all or some browser cookies, but this may affect the functionality of
                    our website.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">8. Children&apos;s Privacy</h3>
                  <p>
                    Our services are not intended for individuals under the age of 18. We do not knowingly collect
                    personal information from children. If you are a parent or guardian and believe that your child has
                    provided us with personal information, please contact us, and we will take steps to delete such
                    information.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">9. Changes to This Privacy Policy</h3>
                  <p>
                    We may update our Privacy Policy from time to time. We will notify you of any changes by posting the
                    new Privacy Policy on this page and updating the &quot;Last Updated&quot; date. You are advised to review this
                    Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they
                    are posted on this page.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">10. Contact Us</h3>
                  <p>If you have any questions or concerns about this Privacy Policy, please contact us:</p>
                  <ul className="list-none mt-2">
                    <li>
                      <strong>Email:</strong> support@piphrase.com
                    </li>
                    <li>
                      <strong>Website:</strong> https://piphrase.com
                    </li>
                    <li>
                      <strong>Response Time:</strong> Within 48 hours of receiving your request.
                    </li>
                  </ul>
                </div>

                <div className="pt-4">
                  <p>
                    By using PiPhrase&apos;s services, you acknowledge that you have read and understood this Privacy Policy.
                  </p>
                  <p className="mt-4">
                    Sincerely,
                    <br />
                    The PiPhrase Team
                  </p>
                </div>
              </div>
            </ScrollArea>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
