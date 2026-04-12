"use client";
import KpLink from "../common/KpLink";

const AuthFormFooter = ({ promptText, linkText, linkHref }: { promptText: string, linkText: string, linkHref: string }) => (
  <div className="mt-5">
    <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
      {promptText}
      <KpLink
        url={linkHref}
        kpclass="text-orange-500 hover:text-orange-600 dark:text-orange-400"
        title={linkText}
      />
    </p>
  </div>
);
export default AuthFormFooter;
