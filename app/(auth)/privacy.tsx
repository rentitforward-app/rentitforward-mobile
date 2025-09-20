import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  StatusBar,
  Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const { width: screenWidth } = Dimensions.get('window');

export default function PrivacyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        
        <Text style={styles.title}>Privacy Policy</Text>
        
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={true}>
        <View style={styles.content}>
          <Text style={styles.lastUpdated}>Last updated: September 20, 2025</Text>

          <Text style={styles.sectionTitle}>Important Information</Text>
          <View style={styles.highlightBox}>
            <Text style={styles.paragraph}>
              This Privacy Policy is governed by the Privacy Act 1988 (Cth) and the Australian Privacy Principles (APPs). 
              Rent It Forward Pty Ltd (ACN: [To be inserted], ABN: [To be inserted]) is committed to protecting 
              your privacy and handling your personal information responsibly.
            </Text>
            <Text style={styles.paragraph}>
              <Text style={styles.bold}>Contact:</Text> For privacy-related inquiries, contact our Privacy Officer at 
              privacy@rentitforward.com.au
            </Text>
          </View>

          <Text style={styles.sectionTitle}>1. What Personal Information We Collect</Text>
          <Text style={styles.paragraph}>
            We collect personal information that is reasonably necessary for our business functions and activities. 
            The types of personal information we collect include:
          </Text>

          <Text style={styles.subsectionTitle}>1.1 Information You Provide Directly</Text>
          <Text style={styles.paragraph}>
            • <Text style={styles.bold}>Account Information:</Text> Name, email address, phone number, date of birth, residential address{'\n'}
            • <Text style={styles.bold}>Identity Verification:</Text> Government-issued photo ID (driver's license, passport), proof of address{'\n'}
            • <Text style={styles.bold}>Financial Information:</Text> Bank account details, payment card information (processed by secure third parties){'\n'}
            • <Text style={styles.bold}>Profile Information:</Text> Profile photos, bio, preferences, rental history{'\n'}
            • <Text style={styles.bold}>Listing Information:</Text> Item descriptions, photos, pricing, availability, location details{'\n'}
            • <Text style={styles.bold}>Communication Data:</Text> Messages with other users, customer support interactions, reviews and ratings{'\n'}
            • <Text style={styles.bold}>Transaction Information:</Text> Booking details, payment history, refund requests, dispute records
          </Text>

          <Text style={styles.subsectionTitle}>1.2 Information We Collect Automatically</Text>
          <Text style={styles.paragraph}>
            • <Text style={styles.bold}>Device Information:</Text> IP address, device type, operating system, browser type, unique device identifiers{'\n'}
            • <Text style={styles.bold}>Usage Data:</Text> Pages visited, features used, time spent on platform, click patterns, search queries{'\n'}
            • <Text style={styles.bold}>Location Data:</Text> Precise location (with consent), general location for service delivery{'\n'}
            • <Text style={styles.bold}>Technical Data:</Text> Log files, error reports, performance data, security incident logs{'\n'}
            • <Text style={styles.bold}>Cookies and Tracking:</Text> Session data, preferences, analytics data, advertising interactions
          </Text>

          <Text style={styles.subsectionTitle}>1.3 Information from Third Parties</Text>
          <Text style={styles.paragraph}>
            • <Text style={styles.bold}>Identity Verification Services:</Text> Document verification, fraud prevention data{'\n'}
            • <Text style={styles.bold}>Payment Processors:</Text> Transaction status, payment method verification{'\n'}
            • <Text style={styles.bold}>Social Media:</Text> Public profile information (if you connect social accounts){'\n'}
            • <Text style={styles.bold}>Background Check Providers:</Text> Criminal history, credit checks (where permitted){'\n'}
            • <Text style={styles.bold}>Insurance Partners:</Text> Claims history, risk assessment data
          </Text>

          <Text style={styles.sectionTitle}>2. How We Use Your Personal Information</Text>
          <Text style={styles.paragraph}>
            We use your personal information for the following purposes, in accordance with the Australian Privacy Principles:
          </Text>

          <Text style={styles.subsectionTitle}>2.1 Primary Purposes</Text>
          <Text style={styles.paragraph}>
            • <Text style={styles.bold}>Service Provision:</Text> Operating the platform, facilitating rentals, processing payments{'\n'}
            • <Text style={styles.bold}>Account Management:</Text> Creating and maintaining user accounts, authentication, security{'\n'}
            • <Text style={styles.bold}>Transaction Processing:</Text> Managing bookings, payments, refunds, deposits, insurance claims{'\n'}
            • <Text style={styles.bold}>Communication:</Text> Sending booking confirmations, updates, customer support responses{'\n'}
            • <Text style={styles.bold}>Safety and Security:</Text> Verifying user identity, preventing fraud, investigating disputes
          </Text>

          <Text style={styles.subsectionTitle}>2.2 Secondary Purposes (with consent or as permitted by law)</Text>
          <Text style={styles.paragraph}>
            • <Text style={styles.bold}>Marketing:</Text> Sending promotional emails, personalized recommendations, special offers{'\n'}
            • <Text style={styles.bold}>Analytics:</Text> Understanding user behavior, improving platform performance, market research{'\n'}
            • <Text style={styles.bold}>Product Development:</Text> Developing new features, testing improvements, personalizing experience{'\n'}
            • <Text style={styles.bold}>Legal Compliance:</Text> Meeting regulatory requirements, responding to legal requests
          </Text>

          <Text style={styles.subsectionTitle}>2.3 Automated Decision Making</Text>
          <Text style={styles.paragraph}>
            We may use automated systems for fraud detection, credit assessment, and risk management. 
            You have the right to request human review of automated decisions that significantly affect you.
          </Text>

          <Text style={styles.sectionTitle}>3. How We Share Your Personal Information</Text>
          <Text style={styles.paragraph}>
            We do not sell your personal information. We may share your information in the following circumstances:
          </Text>

          <Text style={styles.subsectionTitle}>3.1 With Other Platform Users</Text>
          <Text style={styles.paragraph}>
            • Profile information to facilitate rentals (name, photo, ratings, reviews){'\n'}
            • Contact information when bookings are confirmed (as necessary for pickup/delivery){'\n'}
            • Location information to coordinate item exchange
          </Text>

          <Text style={styles.subsectionTitle}>3.2 With Service Providers</Text>
          <Text style={styles.paragraph}>
            • <Text style={styles.bold}>Payment Processors:</Text> Stripe, PayPal (for transaction processing){'\n'}
            • <Text style={styles.bold}>Identity Verification:</Text> Document verification and fraud prevention services{'\n'}
            • <Text style={styles.bold}>Cloud Services:</Text> AWS, Google Cloud (for data hosting and storage){'\n'}
            • <Text style={styles.bold}>Communication:</Text> Email and SMS service providers{'\n'}
            • <Text style={styles.bold}>Analytics:</Text> Google Analytics, Mixpanel (for usage analysis){'\n'}
            • <Text style={styles.bold}>Customer Support:</Text> Helpdesk and chat service providers{'\n'}
            • <Text style={styles.bold}>Insurance:</Text> Insurance partners for damage protection
          </Text>

          <Text style={styles.subsectionTitle}>3.3 Legal and Regulatory Sharing</Text>
          <Text style={styles.paragraph}>
            • Law enforcement agencies (when required by law or court order){'\n'}
            • Tax authorities (as required for GST and income reporting){'\n'}
            • Financial intelligence agencies (for anti-money laundering compliance){'\n'}
            • Dispute resolution bodies (AFCA, Fair Trading authorities){'\n'}
            • Legal advisors and professional service providers (under confidentiality agreements)
          </Text>

          <Text style={styles.sectionTitle}>4. International Transfers of Personal Information</Text>
          <Text style={styles.paragraph}>
            Some of our service providers may be located outside Australia. We ensure appropriate protections 
            are in place for international transfers, including:
          </Text>
          <Text style={styles.paragraph}>
            • Transfers to countries with adequate privacy protection (as recognized by Australian law){'\n'}
            • Standard contractual clauses with overseas service providers{'\n'}
            • Binding corporate rules for multinational service providers{'\n'}
            • Your explicit consent for specific transfers
          </Text>
          <Text style={styles.paragraph}>
            You can request details about specific international transfers by contacting our Privacy Officer.
          </Text>

          <Text style={styles.sectionTitle}>5. Data Security and Protection</Text>
          <Text style={styles.subsectionTitle}>5.1 Security Measures</Text>
          <Text style={styles.paragraph}>
            • <Text style={styles.bold}>Encryption:</Text> All data in transit and at rest is encrypted using industry-standard protocols{'\n'}
            • <Text style={styles.bold}>Access Controls:</Text> Multi-factor authentication, role-based access, regular access reviews{'\n'}
            • <Text style={styles.bold}>Infrastructure:</Text> Secure cloud hosting, firewalls, intrusion detection systems{'\n'}
            • <Text style={styles.bold}>Monitoring:</Text> 24/7 security monitoring, vulnerability scanning, incident response procedures{'\n'}
            • <Text style={styles.bold}>Staff Training:</Text> Regular privacy and security training for all employees
          </Text>

          <Text style={styles.subsectionTitle}>5.2 Data Breach Response</Text>
          <Text style={styles.paragraph}>
            In the event of a data breach that may cause serious harm, we will notify affected individuals and 
            the Office of the Australian Information Commissioner (OAIC) within 72 hours, as required by law.
          </Text>

          <Text style={styles.sectionTitle}>6. Data Retention and Deletion</Text>
          <Text style={styles.subsectionTitle}>6.1 Retention Periods</Text>
          <Text style={styles.paragraph}>
            • <Text style={styles.bold}>Account Information:</Text> Retained while account is active plus 7 years after closure{'\n'}
            • <Text style={styles.bold}>Transaction Records:</Text> 7 years (as required by tax and financial regulations){'\n'}
            • <Text style={styles.bold}>Communication Data:</Text> 3 years after last interaction{'\n'}
            • <Text style={styles.bold}>Marketing Data:</Text> Until consent is withdrawn or account deleted{'\n'}
            • <Text style={styles.bold}>Security Logs:</Text> 2 years for fraud prevention and investigation{'\n'}
            • <Text style={styles.bold}>Legal Hold:</Text> Indefinitely when subject to legal proceedings
          </Text>

          <Text style={styles.subsectionTitle}>6.2 Secure Deletion</Text>
          <Text style={styles.paragraph}>
            When retention periods expire, we securely delete personal information using industry-standard 
            methods to ensure it cannot be recovered or reconstructed.
          </Text>

          <Text style={styles.sectionTitle}>7. Your Privacy Rights Under Australian Law</Text>
          <Text style={styles.paragraph}>
            Under the Privacy Act 1988 and Australian Privacy Principles, you have the following rights:
          </Text>

          <Text style={styles.subsectionTitle}>7.1 Access Rights</Text>
          <Text style={styles.paragraph}>
            • Request access to your personal information we hold{'\n'}
            • Receive a copy of your personal information in a usable format{'\n'}
            • Understand how your information is being used and shared
          </Text>

          <Text style={styles.subsectionTitle}>7.2 Correction Rights</Text>
          <Text style={styles.paragraph}>
            • Request correction of inaccurate or incomplete information{'\n'}
            • Update your account information at any time{'\n'}
            • Request notation of disputes if correction is refused
          </Text>

          <Text style={styles.subsectionTitle}>7.3 Deletion and Restriction Rights</Text>
          <Text style={styles.paragraph}>
            • Request deletion of your personal information (subject to legal requirements){'\n'}
            • Restrict processing for specific purposes{'\n'}
            • Object to automated decision-making
          </Text>

          <Text style={styles.subsectionTitle}>7.4 Consent Management</Text>
          <Text style={styles.paragraph}>
            • Withdraw consent for marketing communications{'\n'}
            • Opt-out of non-essential data processing{'\n'}
            • Manage cookie preferences{'\n'}
            • Control location data sharing
          </Text>

          <Text style={styles.sectionTitle}>8. Cookies and Tracking Technologies</Text>
          <Text style={styles.subsectionTitle}>8.1 Types of Cookies We Use</Text>
          <Text style={styles.paragraph}>
            • <Text style={styles.bold}>Essential Cookies:</Text> Required for platform functionality and security{'\n'}
            • <Text style={styles.bold}>Performance Cookies:</Text> Analytics and performance monitoring{'\n'}
            • <Text style={styles.bold}>Functional Cookies:</Text> User preferences and personalization{'\n'}
            • <Text style={styles.bold}>Marketing Cookies:</Text> Advertising and remarketing (with consent)
          </Text>

          <Text style={styles.subsectionTitle}>8.2 Cookie Management</Text>
          <Text style={styles.paragraph}>
            You can control cookies through your browser settings or our cookie preference center. 
            Disabling certain cookies may limit platform functionality.
          </Text>

          <Text style={styles.sectionTitle}>9. Third-Party Links and Services</Text>
          <Text style={styles.paragraph}>
            Our platform may contain links to third-party websites, social media platforms, or integrated 
            services. We are not responsible for the privacy practices of these external sites. We recommend 
            reviewing their privacy policies before providing personal information.
          </Text>

          <Text style={styles.sectionTitle}>10. Children's Privacy</Text>
          <Text style={styles.paragraph}>
            Our services are not intended for individuals under 18 years of age. We do not knowingly collect 
            personal information from children under 18. If we become aware that we have collected such 
            information, we will take steps to delete it promptly.
          </Text>

          <Text style={styles.sectionTitle}>11. Marketing and Communications</Text>
          <Text style={styles.subsectionTitle}>11.1 Marketing Consent</Text>
          <Text style={styles.paragraph}>
            We will only send marketing communications with your explicit consent, in compliance with the 
            Spam Act 2003 (Cth). You can opt-out at any time using unsubscribe links or contacting us directly.
          </Text>

          <Text style={styles.subsectionTitle}>11.2 Transactional Communications</Text>
          <Text style={styles.paragraph}>
            We will send necessary service-related communications (booking confirmations, payment receipts, 
            security alerts) regardless of marketing preferences, as these are essential for service delivery.
          </Text>

          <Text style={styles.sectionTitle}>12. Changes to This Privacy Policy</Text>
          <Text style={styles.paragraph}>
            We may update this Privacy Policy from time to time to reflect changes in our practices, 
            technology, legal requirements, or business operations. Material changes will be communicated via:
          </Text>
          <Text style={styles.paragraph}>
            • Email notification to registered users{'\n'}
            • Prominent notice on our platform{'\n'}
            • In-app notifications for mobile users{'\n'}
            • 30 days advance notice for significant changes
          </Text>
          <Text style={styles.paragraph}>
            Continued use of our services after changes take effect constitutes acceptance of the updated policy.
          </Text>

          <Text style={styles.sectionTitle}>13. Contact Information and Complaints</Text>
          <Text style={styles.paragraph}>
            For privacy-related questions, requests, or complaints, please contact:
          </Text>
          <View style={styles.contactBox}>
            <Text style={styles.paragraph}>
              <Text style={styles.bold}>Email:</Text> support@rentitforward.com.au{'\n'}
              <Text style={styles.bold}>Phone:</Text> 1300 RENT IT (1300 000 000){'\n'}
              <Text style={styles.bold}>Business Hours:</Text> Monday-Friday 9AM-5PM AEST{'\n'}
              <Text style={styles.bold}>Response Time:</Text> We aim to respond to privacy requests within 30 days
            </Text>
          </View>

          <Text style={styles.sectionTitle}>14. External Complaint Resolution</Text>
          <Text style={styles.paragraph}>
            If you are not satisfied with our response to your privacy complaint, you may lodge a 
            complaint with external authorities:
          </Text>
          <View style={styles.warningBox}>
            <Text style={styles.subsectionTitle}>Office of the Australian Information Commissioner (OAIC)</Text>
            <Text style={styles.paragraph}>
              <Text style={styles.bold}>Website:</Text> www.oaic.gov.au{'\n'}
              <Text style={styles.bold}>Phone:</Text> 1300 363 992{'\n'}
              <Text style={styles.bold}>Email:</Text> enquiries@oaic.gov.au{'\n'}
              <Text style={styles.bold}>Online:</Text> Submit complaint at www.oaic.gov.au/privacy/privacy-complaints
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.subsectionTitle}>Data Subject Rights Summary</Text>
            <Text style={styles.paragraph}>
              <Text style={styles.bold}>Quick Access:</Text> To exercise your privacy rights quickly, log into your account 
              and visit the Privacy Settings page, or contact our Privacy Officer directly.
            </Text>
            <Text style={styles.paragraph}>
              <Text style={styles.bold}>No Cost:</Text> We do not charge fees for reasonable privacy requests. Excessive 
              or repetitive requests may incur administrative costs as permitted by law.
            </Text>
          </View>

          <View style={styles.bottomSpacing} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    marginBottom: 24,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 24,
    marginBottom: 12,
    lineHeight: 24,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
    lineHeight: 22,
  },
  paragraph: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  bold: {
    fontWeight: '600',
    color: '#111827',
  },
  highlightBox: {
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  contactBox: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  warningBox: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  infoBox: {
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  bottomSpacing: {
    height: 40,
  },
});

