import { Radio, RadioGroup } from "@headlessui/react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
const methods = [
  { id: "mail", name: "Send a code by email to:", info: "******@thapar.edu" },
  {
    id: "phone",
    name: "Send a code by mobile phone number:",
    info: "*******987",
  },
];

export default function OtpMethods() {
  const [selected, setSelected] = useState(methods[0]);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    navigate("/src/components/OtpInputWithValidation.jsx");
  };

  return (
    <article className="w-11/12 p-4">
      <p className="text-2xl font-medium text-black mt-12">One-time password</p>
      <p className="text-base text-black mt-4  rounded-md">
        {/* A special type of input box where as user types, it checks if the otp is
        correct else it shows an error message below with a shake animation. */}
        A code has been sent to the email address linked to your account, please
        enter the one time password.
      </p>
      <div className="w-full mt-8">
        <div className="mx-auto w-full max-w-md">
          <RadioGroup
            by="name"
            value={selected}
            onChange={setSelected}
            aria-label="Server size"
            className="space-y-2"
          >
            {methods.map((method) => (
              <Radio
                key={method.id}
                value={method}
                className="group relative flex cursor-pointer rounded-lg bg-white/5 py-4 px-5 text-black shadow-md transition focus:outline-none data-[focus]:outline-1 data-[focus]:outline-white data-[checked]:bg-white/10"
              >
                <div className="flex w-full items-center justify-between">
                  <div className="text-sm/6">
                    <p className="font-semibold text-black">{method.name}</p>
                    <div className="flex gap-2 text-black">
                      <div>{method.info}</div>
                    </div>
                  </div>
                  <CheckCircleIcon className="size-6 fill-black opacity-0 transition group-data-[checked]:opacity-100" />
                </div>
              </Radio>
            ))}
          </RadioGroup>
        </div>

        <Link
          type={SubmitEvent}
          className="group relative  w-1/3 flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 mt-10"
          onSubmit={handleSubmit}
          to={"/otp"}
        >
          Continue
        </Link>
      </div>
    </article>
  );
}
