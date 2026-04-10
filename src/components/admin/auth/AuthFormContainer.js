"use client";
import KpLink from "../common/KpLink";

const AuthFormContainer = ({
  children,
  title,
  description,
  backLink = false
}) => (
  <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
    {backLink && (
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <KpLink
          url="/"
          kpclass="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          title="Back to dashboard"
        />
      </div>
    )}
    <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
      <div className="mb-5 sm:mb-5">
        <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
          {title}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>
      {children}
    </div>
  </div>
);
export default AuthFormContainer;
