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

interface ResetPasswordEmailProps {
    userFirstname?: string;
    resetPasswordLink?: string;
}

export const ResetPasswordEmail = ({
    userFirstname,
    resetPasswordLink,
}: ResetPasswordEmailProps) => {
    return (
        <Html>
            <Tailwind config={tailwindConfig as any}>
                <Head />
                <Body className="bg-gray-100 py-2.5 font-sans">
                    <Preview>Reset your Coffee Bliss password</Preview>
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
                                Someone recently requested a password change for your Coffee Bliss
                                account. If this was you, you can set a new password here:
                            </Text>
                            <Section className="text-center my-6">
                                <Button
                                    className="bg-[#6F4E37] rounded text-white text-[15px] no-underline text-center font-bold block w-[210px] py-[14px] px-[7px] mx-auto"
                                    href={resetPasswordLink}
                                >
                                    Reset password
                                </Button>
                            </Section>
                            <Text className="text-base font-light text-gray-700 leading-[26px]">
                                If you don&apos;t want to change your password or didn&apos;t
                                request this, just ignore and delete this message.
                            </Text>
                            <Text className="text-base font-light text-gray-700 leading-[26px]">
                                To keep your account secure, please don&apos;t forward this
                                email to anyone.
                            </Text>
                            <Text className="text-base font-light text-gray-700 leading-[26px]">
                                Happy Brewing!
                            </Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

ResetPasswordEmail.PreviewProps = {
    userFirstname: 'Coffee Lover',
    resetPasswordLink: 'https://coffeebliss.com/reset-password?token=123',
} as ResetPasswordEmailProps;

export default ResetPasswordEmail;
