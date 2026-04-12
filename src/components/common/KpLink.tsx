import React from "react";
import Link from "next/link";

interface KpLinkProps {
  url?: string;
  kpclass?: string;
  title?: string;
}

const KpLink = ({ url = "", kpclass = "", title = "" }: KpLinkProps) => {
  return (
    <Link href={`${url}`} className={`${kpclass}`}>
      {title}
    </Link>
  );
};

export default KpLink;
