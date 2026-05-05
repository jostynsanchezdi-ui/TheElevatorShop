"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Loader2, Printer, Download } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface OrderItem {
  id: string;
  name: string;
  sku: string;
  image: string | null;
  price: number;
  quantity: number;
}

interface BillingInfo {
  full_name: string;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
}

interface ShippingAddress {
  full_name: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  zip: string;
  billing?: BillingInfo | null;
  // legacy fields (fallback)
  company?: string | null;
  phone?: string | null;
  email?: string | null;
}

interface Order {
  id: string;
  po_number: number;
  status: string;
  items: OrderItem[];
  subtotal: number;
  shipping_cost: number;
  total: number;
  shipping_address: ShippingAddress;
  created_at: string;
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", minimumFractionDigits: 2,
  }).format(cents / 100);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
}

const STATUS_LABELS: Record<string, string> = {
  confirmed: "PENDING PAYMENT",
  shipped: "SHIPPED",
  delivered: "DELIVERED",
  cancelled: "CANCELLED",
};

export default function POPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const docRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("user_orders")
        .select("*")
        .eq("id", id)
        .single();
      if (error || !data) {
        setNotFound(true);
      } else {
        setOrder(data as Order);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  const handleDownload = useCallback(async (filename: string) => {
    if (!docRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      const canvas = await html2canvas(docRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        onclone: (clonedDoc) => {
          const badge = clonedDoc.querySelector(".po-status-badge") as HTMLElement | null;
          if (badge) badge.style.display = "none";
        },
      });

      const imgData = canvas.toDataURL("image/png");
      const pxToMm = 0.264583;
      const pdfW = (canvas.width / 2) * pxToMm;
      const pdfH = (canvas.height / 2) * pxToMm;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [pdfW, pdfH],
      });
      pdf.addImage(imgData, "PNG", 0, 0, pdfW, pdfH);
      pdf.save(filename);
    } finally {
      setDownloading(false);
    }
  }, []);

  useEffect(() => {
    if (searchParams.get("print") === "1" && order) {
      const t = setTimeout(() => handleDownload(`${`PO-${String(order.po_number).padStart(5, "0")}`}.pdf`), 800);
      return () => clearTimeout(t);
    }
  }, [order, searchParams, handleDownload]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
    </div>
  );

  if (notFound || !order) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
      Order not found.
    </div>
  );

  const poNumber = `PO-${String(order.po_number).padStart(5, "0")}`;
  const statusLabel = STATUS_LABELS[order.status] ?? "PENDING PAYMENT";
  const addr = order.shipping_address;

  /* ── shared label style (BILL TO / SHIP TO) ── */
  const sectionLabel = (text: string, align: "left" | "right" = "left") => (
    <div style={{ textAlign: align, marginBottom: 12 }}>
      <span style={{
        display: "inline-block",
        fontSize: 10,
        fontWeight: 800,
        color: "#E87B3A",
        letterSpacing: "0.14em",
        textTransform: "uppercase" as const,
        paddingBottom: 5,
        borderBottom: "2px solid #E87B3A",
      }}>
        {text}
      </span>
    </div>
  );

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; background: white; }
          .po-wrap { background: white !important; padding: 0 !important; }
          .po-doc { box-shadow: none !important; border-radius: 0 !important; max-width: none !important; margin: 0 !important; }
        }
      `}</style>

      {/* Action bar */}
      <div className="no-print bg-white border-b border-gray-200 py-3 px-6 flex items-center justify-between sticky top-0 z-10">
        <p className="text-sm font-semibold text-[#2C3A48]">{poNumber}</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-[#2C3A48] text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
          <button
            onClick={() => handleDownload(`${poNumber}.pdf`)}
            disabled={downloading}
            className="flex items-center gap-2 px-4 py-2 bg-[#2C3A48] text-white text-sm font-semibold rounded-lg hover:bg-[#1e2a35] transition-colors disabled:opacity-60"
          >
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {downloading ? "Generating..." : "Download PDF"}
          </button>
        </div>
      </div>

      {/* Page background */}
      <div className="po-wrap min-h-screen bg-gray-100 py-10 px-4">
        <div ref={docRef} className="po-doc bg-white max-w-[820px] mx-auto shadow-xl rounded-xl overflow-hidden" style={{ display: "flex" }}>

          {/* ── Left orange stripe ── */}
          <div style={{ width: 9, background: "#E87B3A", flexShrink: 0 }} />

          {/* ── Document content ── */}
          <div style={{ flex: 1, padding: "20px 52px 44px 48px" }}>

            {/* ── Header ── */}
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28 }}>
              {/* Left: Logo + tagline */}
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo-transparent.png" alt="The Elevator Shop" style={{ width: 175, height: 175, objectFit: "contain", display: "block" }} />
              </div>

              {/* Right: PO info */}
              <div style={{ textAlign: "right" }}>
                <h1 style={{ fontSize: 30, fontWeight: 900, color: "#1a2535", letterSpacing: "-0.02em", margin: 0, lineHeight: 1 }}>
                  PURCHASE ORDER
                </h1>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#2C3A48", marginTop: 6 }}>{poNumber}</p>
                <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 3 }}>
                  Issued · {formatDate(order.created_at)}
                </p>
                <div className="po-status-badge" style={{ marginTop: 10, display: "inline-block", padding: "5px 13px", borderRadius: 20, border: "1.5px solid #E87B3A", background: "#fff7f2", whiteSpace: "nowrap" }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#E87B3A", display: "inline-block", verticalAlign: "middle", marginRight: 6 }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#E87B3A", letterSpacing: "0.06em", verticalAlign: "middle" }}>{statusLabel}</span>
                </div>
              </div>
            </div>

            {/* ── Divider ── */}
            <div style={{ borderTop: "1px solid #e5e7eb", marginBottom: 26 }} />

            {/* ── Bill To / Ship To ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginBottom: 34 }}>

              {/* Billing Address — left aligned */}
              <div>
                {sectionLabel("BILLING ADDRESS", "left")}
                {(() => {
                  const b = addr.billing;
                  const name = b?.full_name || addr.full_name;
                  const company = b?.company || addr.company;
                  const email = b?.email || addr.email;
                  const phone = b?.phone || addr.phone;
                  const line1 = b?.line1;
                  const line2 = b?.line2;
                  const city = b?.city;
                  const state = b?.state;
                  const zip = b?.zip;
                  return (
                    <>
                      <p style={{ fontWeight: 700, fontSize: 14, color: "#1a2535", marginBottom: 2 }}>{name}</p>
                      {company && <p style={{ fontSize: 13, color: "#374151", marginBottom: 2 }}>{company}</p>}
                      {line1 && (
                        <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.7, marginBottom: 4 }}>
                          {line1}{line2 ? `, ${line2}` : ""}<br />
                          {city}, {state} {zip}
                        </p>
                      )}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 14px" }}>
                        {email && <span style={{ fontSize: 11, color: "#6b7280" }}>E {email}</span>}
                        {phone && <span style={{ fontSize: 11, color: "#6b7280" }}>P {phone}</span>}
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Ship To — right aligned */}
              <div style={{ textAlign: "right" }}>
                {sectionLabel("SHIP TO", "right")}
                <p style={{ fontWeight: 700, fontSize: 14, color: "#1a2535", marginBottom: 2 }}>
                  {addr.company || addr.full_name}
                </p>
                {addr.company && (
                  <p style={{ fontSize: 13, color: "#374151", marginBottom: 2 }}>c/o {addr.full_name}</p>
                )}
                <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.75, marginTop: 2 }}>
                  {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}<br />
                  {addr.city}, {addr.state} {addr.zip}
                </p>
              </div>
            </div>

            {/* ── Items Table ── */}
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 30 }}>
              <thead>
                <tr style={{ background: "#2C3A48" }}>
                  <th style={{ padding: "11px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#fff", letterSpacing: "0.08em", width: 34 }}>#</th>
                  <th style={{ padding: "11px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#fff", letterSpacing: "0.08em" }}>PRODUCT NAME</th>
                  <th style={{ padding: "11px 14px", textAlign: "center", fontSize: 10, fontWeight: 700, color: "#fff", letterSpacing: "0.08em", width: 60 }}>QTY</th>
                  <th style={{ padding: "11px 14px", textAlign: "right", fontSize: 10, fontWeight: 700, color: "#fff", letterSpacing: "0.08em", width: 108 }}>UNIT PRICE</th>
                  <th style={{ padding: "11px 14px", textAlign: "right", fontSize: 10, fontWeight: 700, color: "#fff", letterSpacing: "0.08em", width: 108 }}>TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => (
                  <tr key={`${item.id}-${idx}`} style={{ background: idx % 2 === 0 ? "#ffffff" : "#f9fafb", borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "13px 14px", fontSize: 12, color: "#9ca3af", fontWeight: 500 }}>{idx + 1}</td>
                    <td style={{ padding: "13px 14px" }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#1a2535" }}>{item.name}</p>
                    </td>
                    <td style={{ padding: "13px 14px", textAlign: "center", fontSize: 13, color: "#E87B3A", fontWeight: 700 }}>{item.quantity}</td>
                    <td style={{ padding: "13px 14px", textAlign: "right", fontSize: 13, color: "#374151" }}>{formatPrice(item.price)}</td>
                    <td style={{ padding: "13px 14px", textAlign: "right", fontSize: 13, fontWeight: 700, color: "#1a2535" }}>{formatPrice(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* ── Totals ── */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 30 }}>
              <div style={{ width: 290, borderLeft: "3px solid #E87B3A", paddingLeft: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 9 }}>
                  <span style={{ fontSize: 13, color: "#6b7280" }}>Subtotal</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1a2535" }}>{formatPrice(order.subtotal)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 12, borderBottom: "1px solid #e5e7eb", marginBottom: 12 }}>
                  <span style={{ fontSize: 13, color: "#6b7280" }}>
                    Shipping — {addr.state === "NY" ? "NY flat rate" : "flat rate"}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1a2535" }}>{formatPrice(order.shipping_cost)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: "#1a2535" }}>TOTAL DUE</span>
                  <span style={{ fontSize: 15, fontWeight: 800, color: "#E87B3A" }}>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>

            {/* ── Notes ── */}
            <div style={{ border: "1.5px solid #d1d5db", borderRadius: 8, padding: "16px 20px", marginBottom: 34 }}>
              <p style={{ fontSize: 10, fontWeight: 800, color: "#1a2535", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 9 }}>
                NOTES
              </p>
              <p style={{ fontSize: 12, color: "#374151", lineHeight: 1.7, marginBottom: 6 }}>
                Our team will contact you{addr.email ? ` at ${addr.email}` : ""} with a secure payment link and shipping instructions to complete your order.
              </p>
              <p style={{ fontSize: 12, color: "#E87B3A", lineHeight: 1.7 }}>
                This PO is not a payment confirmation. Orders are processed upon receipt of payment.
              </p>
            </div>

            {/* ── Footer ── */}
            <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "#9ca3af" }}>sales@theelevatorshop.net</span>
              <span style={{ fontSize: 11, color: "#9ca3af" }}>Long Island City, NY 11101</span>
              <span style={{ fontSize: 11, color: "#9ca3af" }}>www.theelevatorshop.com</span>
            </div>

          </div>{/* end content */}
        </div>{/* end po-doc */}
      </div>
    </>
  );
}
