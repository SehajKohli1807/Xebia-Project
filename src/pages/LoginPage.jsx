import Footer from "../components/Footer";
import Header from "../components/Header";
import Login from "../components/Login";

export default function LoginPage() {
  return (
    <>
      <Header heading="Login to your account" />
      <Login />
      <Footer
        paragraph="Don't have an account yet? "
        linkName="Signup"
        linkUrl="/signup"
      />
    </>
  );
}
