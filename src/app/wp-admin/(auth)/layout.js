export default function AuthLayout({ children }) {
  return (
    <div className="relative p-4 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="relative flex lg:flex-row w-full h-screen justify-center flex-col  dark:bg-gray-900 sm:p-0">
        {children}
      </div>
    </div>
  );
}
