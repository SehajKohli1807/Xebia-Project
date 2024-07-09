import React, { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";

const correctOTP = "123456"; // validate from your server

function OtpInputWithValidation({ numberOfDigits = 6 }) {
  const [otp, setOtp] = useState(new Array(numberOfDigits).fill(""));
  const [otpError, setOtpError] = useState(null);
  const otpBoxReference = useRef([]);

  function handleChange(value, index) {
    let newArr = [...otp];
    newArr[index] = value;
    setOtp(newArr);

    if (value && index < numberOfDigits - 1) {
      otpBoxReference.current[index + 1].focus();
    }
  }

  function handleBackspaceAndEnter(e, index) {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      otpBoxReference.current[index - 1].focus();
    }
    if (e.key === "Enter" && e.target.value && index < numberOfDigits - 1) {
      otpBoxReference.current[index + 1].focus();
    }
  }

  useEffect(() => {
    if (otp.join("") !== "" && otp.join("") !== correctOTP) {
      setOtpError("❌ Wrong OTP Please Check Again");
    } else {
      setOtpError(null);
    }
  }, [otp]);

  return (
    <article className="w-11/12 p-4">
      <p className="text-2xl font-medium text-black mt-12">One-time password</p>
      <p className="text-base text-black mt-4  rounded-md">
        {/* A special type of input box where as user types, it checks if the otp is
        correct else it shows an error message below with a shake animation. */}
        A code has been sent to the email address linked to your account, please
        enter the one time password.
      </p>

      <p className="text-base text-black mt-6 mb-4">One Time Password (OTP)</p>

      <div className="flex items-center gap-4">
        {otp.map((digit, index) => (
          <input
            key={index}
            value={digit}
            maxLength={1}
            onChange={(e) => handleChange(e.target.value, index)}
            onKeyUp={(e) => handleBackspaceAndEnter(e, index)}
            ref={(reference) => (otpBoxReference.current[index] = reference)}
            className={`border border-black w-12 h-auto text-black p-3 rounded-md block bg-white focus:border-2 focus:outline-none appearance-none`}
          />
        ))}
      </div>
      <p className="text-base text-black mt-6">
        The code will be valid for 10 minutes.
      </p>
      <p className="text-base text-black mt-1">
        Didn't receive an email?
        <Link to={""} className="font-medium underline">
          Resend it
        </Link>
      </p>
      <Link to={""} className="text-base text-black mt-3 underline">
        Try a different verification method
      </Link>

      <p className={`text-lg text-black mt-4 ${otpError ? "error-show" : ""}`}>
        {otpError}
      </p>
    </article>
  );
}

export default OtpInputWithValidation;
