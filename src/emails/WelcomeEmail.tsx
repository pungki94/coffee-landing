import {
    Body,
    Button,
    Container,
    Head,
    Html,
    Preview,
    Section,
    Tailwind,
    Text,
} from '@react-email/components';
import tailwindConfig from '../../tailwind.config';

interface WelcomeEmailProps {
    userFirstname?: string;
}

export const WelcomeEmail = ({
    userFirstname,
}: WelcomeEmailProps) => {
    return (
        <Html>
            <Tailwind config={tailwindConfig as any}>
                <Head />
                <Body className="bg-gray-100 py-2.5 font-sans">
                    <Preview>Welcome to Coffee Bliss!</Preview>
                    <Container className="bg-white border border-solid border-gray-200 p-[45px] mx-auto my-0 max-w-[600px] rounded-lg shadow-sm">

                        {/* Logo */}
                        <Section className="text-center mb-6">
                            <Text className="text-2xl font-bold text-coffee-light">Coffee Bliss</Text>
                        </Section>

                        <Section>
                            <Text className="text-base font-light text-gray-700 leading-[26px]">
                                Hi {userFirstname},
                            </Text>
                            <Text className="text-base font-light text-gray-700 leading-[26px]">
                                Welcome to Coffee Bliss! We are thrilled to have you join our community
                                of coffee lovers. Get ready to discover the finest roasts and brewing tips.
                            </Text>
                            <Section className="text-center my-6">
                                <Button
                                    className="bg-[#6F4E37] rounded text-white text-[15px] no-underline text-center font-bold block w-[210px] py-[14px] px-[7px] mx-auto"
                                    href="http://localhost:5173/coffee-landing/shop"
                                >
                                    Start Brewing
                                </Button>
                            </Section>
                            <Text className="text-base font-light text-gray-700 leading-[26px]">
                                If you have any questions, feel free to reply to this email. We're here to help!
                            </Text>
                            <Text className="text-base font-light text-gray-700 leading-[26px]">
                                Cheers,
                                <br />
                                The Coffee Bliss Team
                            </Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

WelcomeEmail.PreviewProps = {
    userFirstname: 'Coffee Lover',
} as WelcomeEmailProps;

export default WelcomeEmail;
