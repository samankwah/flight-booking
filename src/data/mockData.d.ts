import type { Airline, Destination, Deal, Testimonial, Statistic, PaymentMethod, NavigationLink, Airport } from "../types";
export declare const airports: Airport[];
export declare const airlines: Airline[];
export declare const specialOffers: Destination[];
export declare const topDeals: Record<string, Deal[]>;
export declare const testimonials: Testimonial[];
export declare const statistics: Statistic[];
export declare const paymentMethods: PaymentMethod[];
export declare const navigationLinks: Record<string, NavigationLink[]>;
export declare const ghanaDestinations: {
    name: string;
    href: string;
    description: string;
}[];
