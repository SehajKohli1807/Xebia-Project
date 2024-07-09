import { Link } from "react-router-dom";

export default function Header({ heading }) {
  return (
    <div className="mb-12">
      <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
        {heading}
      </h2>
    </div>
  );
}
