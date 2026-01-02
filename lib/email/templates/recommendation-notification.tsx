import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";
import * as React from "react";

interface RecommendationNotificationProps {
  bookTitle: string;
  author?: string;
  submitterNote?: string;
  adminLink: string;
}

export const RecommendationNotificationEmail = ({
  bookTitle,
  author,
  submitterNote,
  adminLink,
}: RecommendationNotificationProps) => {
  const previewText = `New Recommendation: ${bookTitle}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Section className="mt-[32px]">
              <Text className="text-black text-[12px] font-bold tracking-widest uppercase text-center">
                New Recommendation
              </Text>
              <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                A new book for <strong>Theca</strong>
              </Heading>
            </Section>

            <Section className="bg-[#f9fafb] rounded-lg p-[24px] mb-[32px]">
              <Text className="text-[#6b7280] text-[12px] font-semibold uppercase tracking-wider mb-[8px]">
                Book Title
              </Text>
              <Text className="text-black text-[18px] font-medium mb-[16px]">
                {bookTitle}
              </Text>

              {author && (
                <>
                  <Text className="text-[#6b7280] text-[12px] font-semibold uppercase tracking-wider mb-[8px]">
                    Author
                  </Text>
                  <Text className="text-black text-[18px] font-medium mb-[16px]">
                    {author}
                  </Text>
                </>
              )}

              {submitterNote && (
                <>
                  <Text className="text-[#6b7280] text-[12px] font-semibold uppercase tracking-wider mb-[8px]">
                    Submitter's Note
                  </Text>
                  <Section className="border-l-4 border-blue-500 pl-4 py-1">
                    <Text className="text-[#4b5563] italic text-[14px]">
                      "{submitterNote}"
                    </Text>
                  </Section>
                </>
              )}
            </Section>

            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={adminLink}
              >
                View in Dashboard
              </Button>
            </Section>

            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            
            <Text className="text-[#666666] text-[12px] leading-[24px] text-center">
              This notification was sent by Theca. If you're not the admin, please ignore this email.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default RecommendationNotificationEmail;
