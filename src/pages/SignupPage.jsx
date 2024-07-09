import Footer from "../components/Footer";
import Header from "../components/Header";
import Signup from "../components/Signup";

export default function SignupPage() {
  return (
    <>
      <Header heading="Signup to create an account" />
      <Signup />
      <Footer
        paragraph="Already have an account? "
        linkName="Login"
        linkUrl="/"
      />
    </>
  );
}
