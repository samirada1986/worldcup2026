import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-wide flex-col justify-center px-6 py-24 sm:px-10">
      <p className="eyebrow">404</p>
      <h1 className="mt-4 font-serif text-display-md font-light text-ink">
        This page could not be found.
        <span className="mt-2 block font-fa text-stone">این صفحه یافت نشد.</span>
      </h1>
      <div className="mt-8 flex gap-8">
        <Link href="/en" className="font-sans text-sm text-ink link-quiet">
          Home →
        </Link>
        <Link href="/fa" className="font-fa text-sm text-stone link-quiet">
          خانه ←
        </Link>
      </div>
    </div>
  );
}
