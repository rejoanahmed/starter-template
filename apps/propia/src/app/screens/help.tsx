import AnimatedView from "@propia/components/AnimatedView";
import { Button } from "@propia/components/Button";
import Expandable from "@propia/components/Expandable";
import Header from "@propia/components/Header";
import Icon from "@propia/components/Icon";
import Section from "@propia/components/layout/Section";
import ThemedText from "@propia/components/ThemedText";
import { Linking, ScrollView, TouchableOpacity, View } from "react-native";

// FAQ data
const faqData = [
  {
    id: "1",
    question: "How do I check in to my accommodation?",
    answer:
      "Check-in instructions will be provided by your host before your arrival. This typically includes key pickup location, door codes, or meeting arrangements. You can find these details in your booking confirmation email or in the app under your trip details.",
  },
  {
    id: "2",
    question: "What is the cancellation policy?",
    answer:
      "Cancellation policies vary by property and host. You can view the specific policy for your booking in your trip details. Most properties offer free cancellation up to a certain date, with varying refund amounts after that period.",
  },
  {
    id: "3",
    question: "How do I contact my host?",
    answer:
      'You can message your host directly through the app once your booking is confirmed. Go to your trip details and tap "Contact Host" to send a message. For urgent matters, some hosts also provide phone numbers.',
  },
  {
    id: "4",
    question: "What should I do if there's an issue with my accommodation?",
    answer:
      "First, try to resolve the issue by contacting your host directly. If the problem cannot be resolved, contact our customer support team immediately. We're available 24/7 to help with any accommodation issues during your stay.",
  },
  {
    id: "5",
    question: "How do I modify or cancel my booking?",
    answer:
      'You can modify or cancel your booking by going to "Your Trips" in the app and selecting the booking you want to change. Keep in mind that changes may be subject to the host\'s availability and cancellation policy.',
  },
  {
    id: "6",
    question: "How does payment work?",
    answer:
      "Payment is processed securely through our platform. You'll be charged when your booking is confirmed, with some properties requiring a deposit upfront and the balance closer to your stay date. You can view all payment details in your booking confirmation.",
  },
  {
    id: "7",
    question: "What amenities are included in my stay?",
    answer:
      "Amenities vary by property and are listed in each property's description. Common amenities include WiFi, kitchen access, and parking. Check your specific booking details to see what's included with your accommodation.",
  },
  {
    id: "8",
    question: "How do I leave a review?",
    answer:
      'After your stay, you\'ll receive a notification to review your experience. You can also leave a review by going to your completed trips and selecting "Write a Review". Reviews help other travelers and improve the quality of our platform.',
  },
];

// Contact information
const contactInfo = [
  {
    id: "email",
    type: "Email Support",
    value: "support@propia.com",
    icon: "Mail" as const,
    action: () => Linking.openURL("mailto:support@propia.com"),
  },
  {
    id: "phone",
    type: "Emergency Hotline",
    value: "+1 (800) 555-STAY",
    icon: "Phone" as const,
    action: () => Linking.openURL("tel:+18005557829"),
  },
  {
    id: "hours",
    type: "Support Hours",
    value: "24/7 Customer Support",
    icon: "Clock" as const,
    action: undefined,
  },
];

export default function HelpScreen() {
  return (
    <View className="flex-1 bg-light-primary dark:bg-dark-primary">
      <Header showBackButton title="Help & Support" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <AnimatedView animation="fadeIn" duration={400}>
          {/* FAQ Section */}
          <Section
            className="px-global pt-6 pb-2"
            title="Frequently Asked Questions"
            titleSize="xl"
          />

          <View className="px-global">
            {faqData.map((faq) => (
              <Expandable className="py-1" key={faq.id} title={faq.question}>
                <ThemedText className="text-light-text dark:text-dark-text leading-6">
                  {faq.answer}
                </ThemedText>
              </Expandable>
            ))}
          </View>

          {/* Contact Section */}
          <Section
            className="px-global pb-2 mt-14"
            subtitle="We're here to help with your booking and travel needs"
            title="Contact Us"
            titleSize="xl"
          />

          <View className="px-global pb-8">
            {contactInfo.map((contact) => (
              <TouchableOpacity
                className="flex-row items-center py-4 border-b border-light-secondary dark:border-dark-secondary"
                disabled={!contact.action}
                key={contact.id}
                onPress={contact.action}
              >
                <View className="w-10 h-10 rounded-full bg-light-secondary dark:bg-dark-secondary items-center justify-center mr-4">
                  <Icon name={contact.icon} size={20} />
                </View>
                <View>
                  <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
                    {contact.type}
                  </ThemedText>
                  <ThemedText className="font-medium">
                    {contact.value}
                  </ThemedText>
                </View>
                {contact.action && (
                  <Icon
                    className="ml-auto text-light-subtext dark:text-dark-subtext"
                    name="ChevronRight"
                    size={20}
                  />
                )}
              </TouchableOpacity>
            ))}

            <Button
              className="mt-8"
              iconStart="MessageCircle"
              onPress={() => Linking.openURL("mailto:support@propia.com")}
              title="Contact Support"
            />
          </View>
        </AnimatedView>
      </ScrollView>
    </View>
  );
}
