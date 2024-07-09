import { Link } from "react-router-dom";

export default function Footer({ paragraph, linkName, linkUrl = "#" }) {
  return (
    <div className="mb-10">
      <p className="mt-2 text-center text-sm text-gray-600 mt-5">
        {paragraph}{" "}
        <Link
          to={linkUrl}
          className="font-medium text-red-700 hover:text-red-800"
        >
          {linkName}
        </Link>
      </p>
    </div>
  );
}
