import { RecommendationNotificationEmail } from "./recommendation-notification";
import * as React from "react";

export const emailTemplates = {
  recommendation_notification: {
    component: RecommendationNotificationEmail,
    getSubject: (props: any) => `New Book Recommendation: ${props.bookTitle}`,
  },
} as const;
