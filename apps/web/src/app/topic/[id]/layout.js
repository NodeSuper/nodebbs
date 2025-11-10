export async function generateMetadata({ params, searchParams }) {
  const { id } = await params;
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/topics/${id}`
  );
  const data = await res.json();

  return {
    title: data.title,
  };
}

export default function Layout({ children }) {
  return <>{children}</>;
}
