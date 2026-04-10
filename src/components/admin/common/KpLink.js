import Link from "next/link";

const KpLink = ({ url = "", kpclass = "", title = "" }) => {
  return (
    <Link href={`${url}`} className={`${kpclass}`}>
      {title}
    </Link>
  );
};

export default KpLink;
