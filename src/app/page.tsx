import Image from "next/image";
import InvoiceForm from "./invoice";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <InvoiceForm />
    </main>
  );
}
