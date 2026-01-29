import AnimatedView from "@propia/components/AnimatedView";
import Card from "@propia/components/Card";
import { CardScroller } from "@propia/components/CardScroller";
import Section from "@propia/components/layout/Section";
import ThemeScroller from "@propia/components/ThemeScroller";
import { useContext } from "react";
import { Animated } from "react-native";
import { ScrollContext } from "./_layout";

const ServicesScreen = () => {
  const scrollY = useContext(ScrollContext);

  return (
    <ThemeScroller
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false }
      )}
      scrollEventThrottle={16}
    >
      <AnimatedView animation="scaleIn" className="flex-1 mt-4">
        <Section title="Services in New York" titleSize="lg">
          <CardScroller className="mt-1.5 pb-4" space={15}>
            <Card
              description="10 Available"
              image="https://images.pexels.com/photos/1264210/pexels-photo-1264210.jpeg?auto=compress&cs=tinysrgb&w=1200"
              imageHeight={100}
              rounded="2xl"
              title="Photography"
              width={100}
            />
            <Card
              description="1 Available"
              image="https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=1200"
              imageHeight={100}
              rounded="2xl"
              title="Chefs"
              width={100}
            />
            <Card
              description="Coming soon"
              image="https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=1200"
              imageHeight={100}
              rounded="2xl"
              title="Massage"
              width={100}
            />
            <Card
              description="Coming soon"
              image="https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=1200"
              imageHeight={100}
              rounded="2xl"
              title="Training"
              width={100}
            />
          </CardScroller>
        </Section>

        {[
          {
            title: "Top Photographers",
            services: [
              {
                title: "Sarah's Portrait Studio",
                image:
                  "https://images.pexels.com/photos/2773498/pexels-photo-2773498.jpeg?auto=compress&cs=tinysrgb&w=1200",
                price: "$150/hr",
                badge: "Featured",
              },
              {
                title: "NYC Wedding Photos",
                image:
                  "https://images.pexels.com/photos/3321793/pexels-photo-3321793.jpeg?auto=compress&cs=tinysrgb&w=1200",
                price: "$200/hr",
              },
              {
                title: "Urban Photography",
                image:
                  "https://images.pexels.com/photos/2901581/pexels-photo-2901581.jpeg?auto=compress&cs=tinysrgb&w=1200",
                price: "$125/hr",
              },
              {
                title: "Event Photography",
                image:
                  "https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=1200",
                price: "$175/hr",
                badge: "Popular",
              },
            ],
          },
          {
            title: "Private Chefs",
            services: [
              {
                title: "Chef Maria's Italian",
                image:
                  "https://images.pexels.com/photos/3338497/pexels-photo-3338497.jpeg?auto=compress&cs=tinysrgb&w=1200",
                price: "$250/event",
                badge: "Top Rated",
              },
              {
                title: "Asian Fusion Chef",
                image:
                  "https://images.pexels.com/photos/3298637/pexels-photo-3298637.jpeg?auto=compress&cs=tinysrgb&w=1200",
                price: "$200/event",
              },
              {
                title: "Vegan Specialist",
                image:
                  "https://images.pexels.com/photos/3338537/pexels-photo-3338537.jpeg?auto=compress&cs=tinysrgb&w=1200",
                price: "$180/event",
                badge: "New",
              },
              {
                title: "BBQ Master",
                image:
                  "https://images.pexels.com/photos/3338523/pexels-photo-3338523.jpeg?auto=compress&cs=tinysrgb&w=1200",
                price: "$220/event",
              },
            ],
          },
          {
            title: "Professional Massage",
            services: [
              {
                title: "Wellness Massage",
                image:
                  "https://images.pexels.com/photos/3865776/pexels-photo-3865776.jpeg?auto=compress&cs=tinysrgb&w=1200",
                price: "$90/hr",
                badge: "Best Value",
              },
              {
                title: "Sports Massage",
                image:
                  "https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=1200",
                price: "$110/hr",
              },
              {
                title: "Deep Tissue",
                image:
                  "https://images.pexels.com/photos/3757952/pexels-photo-3757952.jpeg?auto=compress&cs=tinysrgb&w=1200",
                price: "$100/hr",
                badge: "Popular",
              },
              {
                title: "Couples Massage",
                image:
                  "https://images.pexels.com/photos/3757957/pexels-photo-3757957.jpeg?auto=compress&cs=tinysrgb&w=1200",
                price: "$160/hr",
              },
            ],
          },
          {
            title: "Top Restaurants",
            services: [
              {
                title: "La Bella Italia",
                image:
                  "https://images.pexels.com/photos/67468/pexels-photo-67468.jpeg?auto=compress&cs=tinysrgb&w=1200",
                price: "$$$$",
                badge: "Michelin Star",
              },
              {
                title: "Sushi Master",
                image:
                  "https://images.pexels.com/photos/359993/pexels-photo-359993.jpeg?auto=compress&cs=tinysrgb&w=1200",
                price: "$$$",
              },
              {
                title: "Urban Bistro",
                image:
                  "https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=1200",
                price: "$$",
                badge: "New",
              },
              {
                title: "The Steakhouse",
                image:
                  "https://images.pexels.com/photos/3535383/pexels-photo-3535383.jpeg?auto=compress&cs=tinysrgb&w=1200",
                price: "$$$$",
              },
            ],
          },
          {
            title: "Makeup Artists",
            services: [
              {
                title: "Bridal Makeup",
                image:
                  "https://images.pexels.com/photos/2681751/pexels-photo-2681751.jpeg?auto=compress&cs=tinysrgb&w=1200",
                price: "$200/session",
                badge: "Top Choice",
              },
              {
                title: "Editorial Style",
                image:
                  "https://images.pexels.com/photos/2442906/pexels-photo-2442906.jpeg?auto=compress&cs=tinysrgb&w=1200",
                price: "$150/session",
              },
              {
                title: "Natural Glam",
                image:
                  "https://images.pexels.com/photos/2683821/pexels-photo-2683821.jpeg?auto=compress&cs=tinysrgb&w=1200",
                price: "$120/session",
                badge: "Trending",
              },
              {
                title: "Special Effects",
                image:
                  "https://images.pexels.com/photos/2695679/pexels-photo-2695679.jpeg?auto=compress&cs=tinysrgb&w=1200",
                price: "$180/session",
              },
            ],
          },
        ].map((section, index) => (
          <Section
            key={`service-section-${index}`}
            link="/screens/map"
            linkText="View all"
            title={section.title}
            titleSize="lg"
          >
            <CardScroller className="mt-1.5 pb-4" space={15}>
              {section.services.map((service, propIndex) => (
                <Card
                  badge={service.badge}
                  hasFavorite
                  href="/screens/service-detail"
                  image={service.image}
                  imageHeight={160}
                  key={`service-${index}-${propIndex}`}
                  price={service.price}
                  rating={4.8}
                  rounded="2xl"
                  title={service.title}
                  width={160}
                />
              ))}
            </CardScroller>
          </Section>
        ))}
      </AnimatedView>
    </ThemeScroller>
  );
};

export default ServicesScreen;
