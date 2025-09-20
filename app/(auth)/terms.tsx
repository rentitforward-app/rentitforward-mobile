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

export default function TermsScreen() {
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
        
        <Text style={styles.title}>Terms of Service</Text>
        
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={true}>
        <View style={styles.content}>
          <Text style={styles.lastUpdated}>Last updated: September 20, 2025</Text>

          <Text style={styles.sectionTitle}>Important Notice</Text>
          <Text style={styles.paragraph}>
            These Terms of Service are governed by Australian law, including the Australian Consumer Law (ACL) under the Competition and Consumer Act 2010 (Cth). Your statutory rights as a consumer under Australian law are not excluded, restricted or modified by these terms.
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Entity:</Text> Rent It Forward Pty Ltd (ACN: [To be inserted], ABN: [To be inserted])
          </Text>

          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.paragraph}>
            By accessing, browsing, registering for, or using Rent It Forward (the "Platform"), you acknowledge that you have read, understood, and agree to be legally bound by these Terms of Service ("Terms") and our Privacy Policy, which is incorporated by reference.
          </Text>
          <Text style={styles.paragraph}>
            If you do not agree with any part of these terms, you must not use our service. Your continued use of the Platform constitutes ongoing acceptance of these Terms.
          </Text>

          <Text style={styles.sectionTitle}>2. Description of Service</Text>
          <Text style={styles.paragraph}>
            Rent It Forward operates a peer-to-peer rental marketplace that facilitates connections between:
          </Text>
          <Text style={styles.paragraph}>
            • <Text style={styles.bold}>Lenders/Sharers:</Text> Users who list items for rental{'\n'}
            • <Text style={styles.bold}>Renters:</Text> Users who rent items from Lenders
          </Text>
          <Text style={styles.paragraph}>
            We provide the technology platform, payment processing, dispute resolution services, and customer support. We do not own, manufacture, control, inspect, or warrant the items listed on our Platform.
          </Text>

          <Text style={styles.sectionTitle}>3. Eligibility and Account Requirements</Text>
          <Text style={styles.subsectionTitle}>3.1 Age and Capacity Requirements</Text>
          <Text style={styles.paragraph}>
            • You must be at least 18 years of age and have legal capacity to enter contracts{'\n'}
            • You must be a resident of Australia with a valid Australian address{'\n'}
            • Corporate users must be validly incorporated in Australia{'\n'}
            • You must not be subject to any legal restrictions preventing platform use
          </Text>

          <Text style={styles.subsectionTitle}>3.2 Account Registration</Text>
          <Text style={styles.paragraph}>
            • Provide accurate, current, and complete registration information{'\n'}
            • Maintain and update your information to keep it accurate and current{'\n'}
            • Verify your identity through government-issued photo ID{'\n'}
            • Maintain confidentiality of your account credentials{'\n'}
            • Notify us immediately of any unauthorized account access
          </Text>

          <Text style={styles.sectionTitle}>4. User Responsibilities and Conduct</Text>
          <Text style={styles.subsectionTitle}>4.1 General Obligations for All Users</Text>
          <Text style={styles.paragraph}>
            • Comply with all applicable Australian federal, state, and local laws{'\n'}
            • Provide truthful, accurate, and non-misleading information{'\n'}
            • Treat other users with respect and professionalism{'\n'}
            • Maintain appropriate insurance coverage for your activities{'\n'}
            • Report suspected fraudulent or illegal activity{'\n'}
            • Cooperate with investigations and dispute resolution processes
          </Text>

          <Text style={styles.subsectionTitle}>4.2 Specific Obligations for Lenders/Sharers</Text>
          <Text style={styles.paragraph}>
            • Own or have legal authority to rent the listed items{'\n'}
            • Provide accurate descriptions, specifications, and high-quality photos{'\n'}
            • Ensure items are safe, functional, and in the condition described{'\n'}
            • Set reasonable rental rates and terms{'\n'}
            • Maintain items in accordance with manufacturer specifications{'\n'}
            • Respond promptly to rental requests and communications{'\n'}
            • Make items available at agreed times and locations{'\n'}
            • Provide necessary operating instructions and safety information{'\n'}
            • Maintain appropriate insurance for items and potential third-party claims
          </Text>

          <Text style={styles.subsectionTitle}>4.3 Specific Obligations for Renters</Text>
          <Text style={styles.paragraph}>
            • Use items only for their intended purpose and in accordance with instructions{'\n'}
            • Exercise reasonable care to prevent damage, loss, or theft{'\n'}
            • Return items in the same condition as received (normal wear excepted){'\n'}
            • Report any damage, malfunction, or safety issues immediately{'\n'}
            • Pay all fees, charges, and applicable deposits on time{'\n'}
            • Allow Lenders to inspect items upon return{'\n'}
            • Not permit unauthorized persons to use rented items{'\n'}
            • Maintain appropriate insurance coverage where required
          </Text>

          <Text style={styles.sectionTitle}>5. Prohibited Items and Activities</Text>
          <Text style={styles.subsectionTitle}>5.1 Prohibited Items</Text>
          <Text style={styles.paragraph}>
            The following items are strictly prohibited from listing:
          </Text>
          <Text style={styles.paragraph}>
            • Weapons, firearms, ammunition, explosives, or military equipment{'\n'}
            • Illegal drugs, drug paraphernalia, or prescription medications{'\n'}
            • Stolen, counterfeit, or fraudulently obtained goods{'\n'}
            • Items requiring special licenses unless you hold valid licenses{'\n'}
            • Hazardous materials, chemicals, or biological substances{'\n'}
            • Items that infringe intellectual property rights{'\n'}
            • Adult content, pornographic materials, or sex toys{'\n'}
            • Human remains, bodily fluids, or medical waste{'\n'}
            • Live animals or animal products requiring permits{'\n'}
            • Items that violate export/import restrictions
          </Text>

          <Text style={styles.subsectionTitle}>5.2 Prohibited Activities</Text>
          <Text style={styles.paragraph}>
            • Circumventing our fee structure or conducting off-platform transactions{'\n'}
            • Creating multiple accounts to manipulate reviews or bookings{'\n'}
            • Posting false, misleading, or defamatory content{'\n'}
            • Harassing, threatening, or discriminating against other users{'\n'}
            • Attempting to gain unauthorized access to our systems{'\n'}
            • Using automated tools to scrape data or create accounts{'\n'}
            • Subletting or transferring rental agreements without consent
          </Text>

          <Text style={styles.sectionTitle}>6. Rental Duration and Pickup/Return Policy</Text>
          <Text style={styles.subsectionTitle}>6.1 How Rental Days Are Counted</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Inclusive Day Counting:</Text> Rental duration is calculated inclusively, meaning both the pickup day and return day count as full rental days.
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Example:</Text> If you select August 27th to August 29th:
          </Text>
          <Text style={styles.paragraph}>
            • Day 1: August 27th (pickup day) - Item available from morning{'\n'}
            • Day 2: August 28th (full day){'\n'}
            • Day 3: August 29th (return day) - Return by end of day{'\n'}
            • <Text style={styles.bold}>Total: 3 rental days</Text>
          </Text>

          <Text style={styles.subsectionTitle}>6.2 Pickup and Return Times</Text>
          <Text style={styles.paragraph}>
            • <Text style={styles.bold}>Pickup:</Text> Items can be collected from the morning of the start date (specific times arranged with lender){'\n'}
            • <Text style={styles.bold}>Return:</Text> Items must be returned by the end of the return date (typically by 6 PM unless otherwise agreed){'\n'}
            • <Text style={styles.bold}>Flexibility:</Text> Exact pickup and return times should be coordinated directly with the item owner{'\n'}
            • <Text style={styles.bold}>Late Returns:</Text> May incur additional charges as per the lender's policy
          </Text>

          <Text style={styles.sectionTitle}>7. Payments and Fees</Text>
          <Text style={styles.subsectionTitle}>Fee Structure:</Text>
          <Text style={styles.paragraph}>
            • <Text style={styles.bold}>Renters:</Text> Pay a 15% service fee on the base rental price{'\n'}
            • <Text style={styles.bold}>Lenders/Sharers:</Text> Platform deducts a 20% commission from rental income{'\n'}
            • <Text style={styles.bold}>Optional Insurance:</Text> Approximately $7/day for damage protection (renter's choice){'\n'}
            • <Text style={styles.bold}>Security Deposits:</Text> Optional for high-value items (e.g., $50-$300 depending on item value)
          </Text>

          <Text style={styles.subsectionTitle}>Payment Processing:</Text>
          <Text style={styles.paragraph}>
            • All payments are processed securely through our escrow system{'\n'}
            • Renters pay the full amount upfront (base price + service fee + optional add-ons){'\n'}
            • Funds are held in escrow until rental completion{'\n'}
            • Lenders receive payment after successful rental completion (minus commission){'\n'}
            • Security deposits are refunded within 2-3 business days if item returned undamaged
          </Text>

          <Text style={styles.sectionTitle}>8. Cancellations, Refunds, and Australian Consumer Law</Text>
          <Text style={styles.subsectionTitle}>8.1 Cancellation Policy</Text>
          <Text style={styles.paragraph}>
            • Cancellations 24+ hours before rental start: Full refund minus processing fees{'\n'}
            • Cancellations within 24 hours: Subject to Lender's cancellation policy{'\n'}
            • Lender cancellations: Full refund to Renter plus potential compensation{'\n'}
            • Force majeure events: Cancellations handled on case-by-case basis
          </Text>

          <Text style={styles.subsectionTitle}>8.2 Consumer Guarantees</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Australian Consumer Law Protection:</Text> Under the Australian Consumer Law, you have guaranteed rights that cannot be excluded. Items and services must be of acceptable quality, fit for purpose, and match their description. If these guarantees are not met, you may be entitled to a remedy.
          </Text>

          <Text style={styles.sectionTitle}>9. Insurance, Damage, and Liability</Text>
          <Text style={styles.subsectionTitle}>9.1 Insurance Coverage</Text>
          <Text style={styles.paragraph}>
            • Optional damage protection insurance available for additional fee{'\n'}
            • Users encouraged to maintain their own comprehensive insurance{'\n'}
            • Platform provides limited protection only as outlined in specific policies{'\n'}
            • High-value items may require mandatory insurance or higher deposits
          </Text>

          <Text style={styles.sectionTitle}>10. Intellectual Property Rights</Text>
          <Text style={styles.paragraph}>
            All Platform content, including software, text, graphics, logos, and trademarks, is owned by Rent It Forward Pty Ltd or our licensors and protected by Australian and international copyright and trademark laws.
          </Text>

          <Text style={styles.sectionTitle}>11. Privacy and Data Protection</Text>
          <Text style={styles.paragraph}>
            Your privacy is protected under the Privacy Act 1988 (Cth) and our Privacy Policy. We collect, use, and disclose personal information in accordance with Australian privacy laws.
          </Text>

          <Text style={styles.sectionTitle}>12. Dispute Resolution</Text>
          <Text style={styles.subsectionTitle}>12.1 Internal Dispute Resolution</Text>
          <Text style={styles.paragraph}>
            We provide an internal dispute resolution process for conflicts between users. This includes mediation services, evidence review, and binding decisions on platform-related disputes.
          </Text>

          <Text style={styles.subsectionTitle}>12.2 External Dispute Resolution</Text>
          <Text style={styles.paragraph}>
            If internal resolution fails, disputes may be referred to:
          </Text>
          <Text style={styles.paragraph}>
            • Australian Financial Complaints Authority (AFCA) for payment disputes{'\n'}
            • Fair Trading authorities in relevant states/territories{'\n'}
            • Courts of competent jurisdiction in Australia
          </Text>

          <Text style={styles.sectionTitle}>13. Changes to Terms</Text>
          <Text style={styles.paragraph}>
            We may modify these Terms at any time. Material changes will be communicated via:
          </Text>
          <Text style={styles.paragraph}>
            • Email notification to registered users{'\n'}
            • Prominent notice on the Platform{'\n'}
            • In-app notifications for mobile users
          </Text>
          <Text style={styles.paragraph}>
            Changes take effect 30 days after notification unless you object and terminate your account. Continued use constitutes acceptance of modified Terms.
          </Text>

          <Text style={styles.sectionTitle}>14. Contact Information</Text>
          <Text style={styles.paragraph}>
            For questions, complaints, or legal notices, contact us:
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Email:</Text> support@rentitforward.com.au{'\n'}
            <Text style={styles.bold}>Phone:</Text> 1300 RENT IT (1300 000 000){'\n'}
            <Text style={styles.bold}>Business Hours:</Text> Monday-Friday 9AM-5PM AEST
          </Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Registered Address:</Text> Rent It Forward Pty Ltd{'\n'}
            [Address to be inserted]{'\n'}
            Australia
          </Text>

          <Text style={styles.sectionTitle}>Your Consumer Rights</Text>
          <Text style={styles.paragraph}>
            If you have a complaint, you can contact us using the details above. If you are not satisfied with our response, you can contact the Australian Financial Complaints Authority (AFCA) at www.afca.org.au or your local Fair Trading office. You may also have rights under the Australian Consumer Law that cannot be excluded.
          </Text>

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
  bottomSpacing: {
    height: 40,
  },
});

