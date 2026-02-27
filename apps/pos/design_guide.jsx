import { useState } from "react";

const palette = [
  { name: "Black", hex: "#000000", text: "white" },
  { name: "Dark", hex: "#1a1a1a", text: "white" },
  { name: "Charcoal", hex: "#333333", text: "white" },
  { name: "Mid Gray", hex: "#666666", text: "white" },
  { name: "Light Gray", hex: "#999999", text: "white" },
  { name: "Border", hex: "#e0e0e0", text: "black" },
  { name: "Off-White", hex: "#f5f5f5", text: "black" },
  { name: "White", hex: "#ffffff", text: "black", border: true },
];

const statusBadges = [
  { label: "Pending", bg: "#999999", text: "#fff" },
  { label: "Confirmed", bg: "#1a56db", text: "#fff" },
  { label: "Processing", bg: "#f5a623", text: "#000" },
  { label: "Shipped", bg: "#1a7a4a", text: "#fff" },
  { label: "Delivered", bg: "#000000", text: "#fff" },
  { label: "Cancelled", bg: "#c0392b", text: "#fff" },
  { label: "Inactive", bg: "#e0e0e0", text: "#333" },
];

const navItems = [
  { icon: "⊞", label: "Dashboard", active: true },
  { icon: "◻", label: "Products" },
  { icon: "◫", label: "Orders" },
  { icon: "◎", label: "Customers" },
  { icon: "◈", label: "Analytics" },
  { icon: "◆", label: "Promotions" },
  { icon: "◧", label: "Settings" },
];

const kpiCards = [
  { label: "Total Revenue", value: "$48,295", trend: "+12.4%", up: true },
  { label: "Total Orders", value: "1,284", trend: "+8.1%", up: true },
  { label: "Active Customers", value: "3,942", trend: "-2.3%", up: false },
  { label: "Conversion Rate", value: "3.6%", trend: "+0.4%", up: true },
];

const tableRows = [
  { id: "#ORD-4821", customer: "Sarah Chen", date: "Feb 24, 2026", amount: "$329.00", status: "Shipped" },
  { id: "#ORD-4820", customer: "Marcus Webb", date: "Feb 24, 2026", amount: "$89.50", status: "Processing" },
  { id: "#ORD-4819", customer: "Lila Fontaine", date: "Feb 23, 2026", amount: "$1,240.00", status: "Delivered" },
  { id: "#ORD-4818", customer: "Tobi Adeyemi", date: "Feb 23, 2026", amount: "$47.00", status: "Pending" },
  { id: "#ORD-4817", customer: "Priya Nair", date: "Feb 22, 2026", amount: "$560.75", status: "Confirmed" },
];

const statusStyle = {
  Pending: { bg: "#999", color: "#fff" },
  Confirmed: { bg: "#1a56db", color: "#fff" },
  Processing: { bg: "#f5a623", color: "#000" },
  Shipped: { bg: "#1a7a4a", color: "#fff" },
  Delivered: { bg: "#000", color: "#fff" },
  Cancelled: { bg: "#c0392b", color: "#fff" },
};

const folderStructure = `admin/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx          # Sidebar + Header shell
│   │   ├── page.tsx            # Dashboard home
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/page.tsx
│   │   │   └── create/page.tsx
│   │   ├── orders/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── customers/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── analytics/
│   │   │   └── page.tsx
│   │   ├── promotions/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/                     # shadcn/ui primitives
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── Breadcrumb.tsx
│   ├── dashboard/
│   │   ├── KPICard.tsx
│   │   ├── RevenueChart.tsx
│   │   └── RecentOrders.tsx
│   ├── products/
│   │   ├── ProductTable.tsx
│   │   ├── ProductForm.tsx
│   │   └── ProductModal.tsx
│   ├── orders/
│   │   ├── OrderTable.tsx
│   │   ├── OrderDetail.tsx
│   │   └── StatusTimeline.tsx
│   └── shared/
│       ├── DataTable.tsx
│       ├── StatusBadge.tsx
│       ├── ConfirmDialog.tsx
│       ├── Filters.tsx
│       └── Pagination.tsx
├── hooks/
│   ├── useProducts.ts
│   ├── useOrders.ts
│   └── useCustomers.ts
├── lib/
│   ├── api.ts                  # Axios instance
│   ├── auth.ts                 # JWT helpers
│   └── queryClient.ts
├── stores/
│   └── uiStore.ts              # Zustand UI state
├── types/
│   ├── product.ts
│   ├── order.ts
│   └── customer.ts
└── middleware.ts                # Auth protection`;

const sections = [
  "Color Palette",
  "Typography",
  "Components",
  "Layout Preview",
  "Status Badges",
  "Table Design",
  "Folder Structure",
  "Best Practices",
];

export default function DesignGuide() {
  const [active, setActive] = useState("Color Palette");
  const [hoveredRow, setHoveredRow] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState("Dashboard");

  return (
    <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", background: "#fff", minHeight: "100vh", color: "#000" }}>
      {/* Guide Header */}
      <div style={{ borderBottom: "2px solid #000", padding: "32px 48px", background: "#000", color: "#fff" }}>
        <div style={{ fontSize: 11, letterSpacing: 4, textTransform: "uppercase", marginBottom: 8, color: "#999" }}>
          Design System Documentation
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 700, margin: 0, letterSpacing: -1 }}>
          Admin Panel Design Guide
        </h1>
        <p style={{ margin: "12px 0 0", color: "#999", fontSize: 14, fontFamily: "system-ui, sans-serif" }}>
          Black &amp; White Minimalist · E-Commerce Admin Dashboard · v1.0
        </p>
      </div>

      {/* Tab Nav */}
      <div style={{ borderBottom: "1px solid #e0e0e0", display: "flex", overflow: "auto", background: "#fff" }}>
        {sections.map(s => (
          <button
            key={s}
            onClick={() => setActive(s)}
            style={{
              padding: "14px 20px",
              border: "none",
              borderBottom: active === s ? "2px solid #000" : "2px solid transparent",
              background: "transparent",
              fontSize: 13,
              fontWeight: active === s ? 700 : 400,
              fontFamily: "system-ui, sans-serif",
              color: active === s ? "#000" : "#666",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <div style={{ padding: "40px 48px", maxWidth: 1200 }}>

        {/* ── COLOR PALETTE ── */}
        {active === "Color Palette" && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Color Palette</h2>
            <p style={{ color: "#666", fontFamily: "system-ui", fontSize: 14, marginBottom: 32 }}>
              A strict monochromatic palette. Every color serves a functional purpose — no decoration.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 48 }}>
              {palette.map(c => (
                <div key={c.hex} style={{ border: "1px solid #e0e0e0" }}>
                  <div style={{
                    height: 80, background: c.hex,
                    border: c.border ? "1px solid #e0e0e0" : "none",
                    borderBottom: "1px solid #e0e0e0"
                  }} />
                  <div style={{ padding: "12px 14px", fontFamily: "system-ui, sans-serif" }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: "#666", fontFamily: "monospace" }}>{c.hex}</div>
                  </div>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Usage Rules</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, fontFamily: "system-ui", fontSize: 13 }}>
              {[
                ["#000000", "Primary buttons, table headers, active nav, headings, borders on focus"],
                ["#1a1a1a", "Card headers, rich text backgrounds, secondary dark surfaces"],
                ["#333333", "Body text, labels, icon color on white backgrounds"],
                ["#666666", "Placeholder text, secondary labels, disabled text"],
                ["#999999", "Muted elements, border hover states, pending status badges"],
                ["#e0e0e0", "Table dividers, card borders, input borders (default)"],
                ["#f5f5f5", "Alternating table rows, hover background, page background"],
                ["#ffffff", "Card backgrounds, input backgrounds, modal backgrounds"],
              ].map(([hex, usage]) => (
                <div key={hex} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 20, height: 20, background: hex, border: "1px solid #e0e0e0", flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <code style={{ fontSize: 11, background: "#f5f5f5", padding: "1px 6px" }}>{hex}</code>
                    <div style={{ color: "#666", marginTop: 4, lineHeight: 1.5 }}>{usage}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TYPOGRAPHY ── */}
        {active === "Typography" && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Typography System</h2>
            <p style={{ color: "#666", fontFamily: "system-ui", fontSize: 14, marginBottom: 40 }}>
              System fonts for performance. Bold weights for hierarchy. No decorative typefaces.
            </p>

            <div style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", marginBottom: 48 }}>
              {[
                { tag: "H1", size: 32, weight: 700, lh: 1.2, usage: "Page titles" },
                { tag: "H2", size: 24, weight: 700, lh: 1.2, usage: "Section headings" },
                { tag: "H3", size: 20, weight: 700, lh: 1.2, usage: "Card titles, modal headers" },
                { tag: "H4", size: 16, weight: 700, lh: 1.2, usage: "Table headings, form sections" },
                { tag: "Body L", size: 16, weight: 400, lh: 1.5, usage: "Primary body copy" },
                { tag: "Body", size: 14, weight: 400, lh: 1.5, usage: "Default body, table cells" },
                { tag: "Small", size: 12, weight: 400, lh: 1.5, usage: "Helper text, captions" },
                { tag: "Label", size: 12, weight: 700, lh: 1.2, usage: "Form labels, column headers" },
                { tag: "Code", size: 13, weight: 400, lh: 1.5, usage: "SKUs, IDs, tokens", mono: true },
              ].map(t => (
                <div key={t.tag} style={{ display: "flex", alignItems: "baseline", gap: 24, borderBottom: "1px solid #f5f5f5", padding: "16px 0" }}>
                  <div style={{ width: 60, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#999", flexShrink: 0 }}>
                    {t.tag}
                  </div>
                  <div style={{
                    fontSize: t.size,
                    fontWeight: t.weight,
                    lineHeight: t.lh,
                    fontFamily: t.mono ? "monospace" : "inherit",
                    flex: 1,
                  }}>
                    The quick brown fox jumps
                  </div>
                  <div style={{ color: "#999", fontSize: 12, textAlign: "right", lineHeight: 1.6, flexShrink: 0 }}>
                    <div>{t.size}px · {t.weight === 700 ? "Bold" : "Regular"}</div>
                    <div>{t.usage}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: "#f5f5f5", padding: 24, fontFamily: "monospace", fontSize: 13 }}>
              <div style={{ fontWeight: 700, marginBottom: 12, fontFamily: "system-ui", fontSize: 12, letterSpacing: 1, textTransform: "uppercase" }}>CSS Variable Reference</div>
              {`--font-sans: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'SFMono-Regular', Consolas, 'Liberation Mono', monospace;

--text-xs:   12px;   /* labels, captions */
--text-sm:   14px;   /* body default */
--text-base: 16px;   /* body large */
--text-xl:   20px;   /* h3 */
--text-2xl:  24px;   /* h2 */
--text-4xl:  32px;   /* h1 */`.split("\n").map((line, i) => (
                <div key={i} style={{ color: line.startsWith("--") ? "#000" : "#666" }}>{line}</div>
              ))}
            </div>
          </div>
        )}

        {/* ── COMPONENTS ── */}
        {active === "Components" && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Component Specifications</h2>
            <p style={{ color: "#666", fontFamily: "system-ui", fontSize: 14, marginBottom: 40 }}>
              Sharp corners, flat design, no decorative shadows. Every component is defined by its function.
            </p>

            {/* Buttons */}
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, fontFamily: "system-ui" }}>Buttons</h3>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 32 }}>
              {[
                { label: "Primary", bg: "#000", color: "#fff", border: "1px solid #000" },
                { label: "Secondary", bg: "#fff", color: "#000", border: "1px solid #000" },
                { label: "Danger", bg: "#c0392b", color: "#fff", border: "1px solid #c0392b" },
                { label: "Ghost", bg: "transparent", color: "#000", border: "1px solid #e0e0e0" },
                { label: "Disabled", bg: "#e0e0e0", color: "#999", border: "1px solid #e0e0e0" },
              ].map(b => (
                <div key={b.label} style={{ textAlign: "center" }}>
                  <button style={{
                    display: "block",
                    padding: "10px 20px",
                    background: b.bg,
                    color: b.color,
                    border: b.border,
                    borderRadius: 0,
                    fontFamily: "system-ui",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: b.label === "Disabled" ? "not-allowed" : "pointer",
                    letterSpacing: 0.3,
                  }}>
                    {b.label}
                  </button>
                  <div style={{ fontSize: 11, color: "#999", marginTop: 6, fontFamily: "system-ui" }}>{b.label}</div>
                </div>
              ))}
            </div>

            {/* Cards */}
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, fontFamily: "system-ui" }}>KPI Card</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
              {kpiCards.slice(0, 3).map(card => (
                <div key={card.label} style={{ border: "1px solid #e0e0e0", padding: 24, background: "#fff" }}>
                  <div style={{ fontSize: 12, color: "#666", fontFamily: "system-ui", fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 12 }}>
                    {card.label}
                  </div>
                  <div style={{ fontSize: 32, fontWeight: 700, fontFamily: "system-ui", lineHeight: 1, marginBottom: 12 }}>
                    {card.value}
                  </div>
                  <div style={{ fontSize: 13, color: card.up ? "#1a7a4a" : "#c0392b", fontFamily: "system-ui", fontWeight: 600 }}>
                    {card.up ? "↑" : "↓"} {card.trend} vs last month
                  </div>
                </div>
              ))}
            </div>

            {/* Form */}
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, fontFamily: "system-ui" }}>Form Fields</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 32, maxWidth: 600 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, fontFamily: "system-ui", marginBottom: 6, letterSpacing: 0.3 }}>
                  Default Input
                </label>
                <input style={{ width: "100%", padding: "9px 12px", border: "1px solid #e0e0e0", borderRadius: 0, fontFamily: "system-ui", fontSize: 14, boxSizing: "border-box" }}
                  placeholder="Enter value..." readOnly />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, fontFamily: "system-ui", marginBottom: 6, letterSpacing: 0.3 }}>
                  Focus State
                </label>
                <input style={{ width: "100%", padding: "9px 12px", border: "2px solid #000", borderRadius: 0, fontFamily: "system-ui", fontSize: 14, boxSizing: "border-box" }}
                  value="Focused input" readOnly />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, fontFamily: "system-ui", marginBottom: 6, letterSpacing: 0.3, color: "#c0392b" }}>
                  Error State
                </label>
                <input style={{ width: "100%", padding: "9px 12px", border: "1px solid #c0392b", borderRadius: 0, fontFamily: "system-ui", fontSize: 14, boxSizing: "border-box" }}
                  value="Invalid value" readOnly />
                <div style={{ fontSize: 12, color: "#c0392b", marginTop: 4, fontFamily: "system-ui" }}>This field is required.</div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, fontFamily: "system-ui", marginBottom: 6, letterSpacing: 0.3, color: "#999" }}>
                  Disabled
                </label>
                <input style={{ width: "100%", padding: "9px 12px", border: "1px solid #e0e0e0", borderRadius: 0, fontFamily: "system-ui", fontSize: 14, boxSizing: "border-box", background: "#f5f5f5", color: "#999" }}
                  value="Disabled" readOnly />
              </div>
            </div>

            {/* Modal preview */}
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, fontFamily: "system-ui" }}>Confirmation Dialog</h3>
            <div style={{ border: "1px solid #000", width: 400, background: "#fff" }}>
              <div style={{ background: "#000", color: "#fff", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "system-ui", fontSize: 14, fontWeight: 700 }}>
                Confirm Delete
                <span style={{ cursor: "pointer", fontSize: 18 }}>×</span>
              </div>
              <div style={{ padding: 24, fontFamily: "system-ui", fontSize: 14 }}>
                <p style={{ margin: "0 0 20px", color: "#333", lineHeight: 1.6 }}>
                  Are you sure you want to delete <strong>Product #SKU-8821</strong>? This action cannot be undone.
                </p>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button style={{ padding: "9px 18px", background: "#fff", border: "1px solid #000", borderRadius: 0, fontFamily: "system-ui", fontSize: 13, cursor: "pointer" }}>
                    Cancel
                  </button>
                  <button style={{ padding: "9px 18px", background: "#c0392b", border: "1px solid #c0392b", color: "#fff", borderRadius: 0, fontFamily: "system-ui", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── LAYOUT PREVIEW ── */}
        {active === "Layout Preview" && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Layout Preview</h2>
            <p style={{ color: "#666", fontFamily: "system-ui", fontSize: 14, marginBottom: 32 }}>
              Interactive mini-preview of the admin shell. Toggle sidebar collapse.
            </p>

            <div style={{ border: "1px solid #000", overflow: "hidden", height: 520 }}>
              {/* Mini Header */}
              <div style={{ background: "#000", color: "#fff", padding: "0 16px", height: 44, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #333" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    style={{ background: "transparent", border: "1px solid #333", color: "#fff", padding: "4px 8px", cursor: "pointer", fontSize: 14, borderRadius: 0 }}>
                    {sidebarCollapsed ? "→" : "←"}
                  </button>
                  <span style={{ fontFamily: "system-ui", fontWeight: 700, fontSize: 14, letterSpacing: 1 }}>NEXUS ADMIN</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: "system-ui", fontSize: 13 }}>
                  <div style={{ position: "relative" }}>
                    <span>🔔</span>
                    <span style={{ position: "absolute", top: -4, right: -6, background: "#c0392b", color: "#fff", borderRadius: "50%", fontSize: 9, width: 14, height: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>3</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 24, height: 24, background: "#666", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>JD</div>
                    <span>John Doe ▾</span>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", height: "calc(100% - 44px)" }}>
                {/* Sidebar */}
                <div style={{
                  width: sidebarCollapsed ? 48 : 180,
                  background: "#1a1a1a",
                  borderRight: "1px solid #333",
                  transition: "none",
                  flexShrink: 0,
                  paddingTop: 8,
                }}>
                  {navItems.map(item => (
                    <div key={item.label}
                      onClick={() => setActiveNav(item.label)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 14px",
                        cursor: "pointer",
                        fontFamily: "system-ui",
                        fontSize: 13,
                        color: activeNav === item.label ? "#fff" : "#999",
                        background: activeNav === item.label ? "#000" : "transparent",
                        borderLeft: activeNav === item.label ? "3px solid #fff" : "3px solid transparent",
                      }}>
                      <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                      {!sidebarCollapsed && <span>{item.label}</span>}
                    </div>
                  ))}
                </div>

                {/* Content */}
                <div style={{ flex: 1, background: "#f5f5f5", padding: 20, overflow: "auto" }}>
                  <div style={{ fontFamily: "system-ui", fontSize: 11, color: "#999", marginBottom: 4, letterSpacing: 0.5 }}>
                    Dashboard / Overview
                  </div>
                  <h2 style={{ fontFamily: "system-ui", fontSize: 20, fontWeight: 700, margin: "0 0 16px" }}>Dashboard</h2>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 16 }}>
                    {kpiCards.map(card => (
                      <div key={card.label} style={{ background: "#fff", border: "1px solid #e0e0e0", padding: 16 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#999", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8, fontFamily: "system-ui" }}>{card.label}</div>
                        <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "system-ui", marginBottom: 4 }}>{card.value}</div>
                        <div style={{ fontSize: 11, color: card.up ? "#1a7a4a" : "#c0392b", fontFamily: "system-ui", fontWeight: 600 }}>
                          {card.up ? "↑" : "↓"} {card.trend}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: "#fff", border: "1px solid #e0e0e0", padding: 16 }}>
                    <div style={{ fontFamily: "system-ui", fontSize: 12, fontWeight: 700, marginBottom: 12 }}>RECENT ORDERS</div>
                    {tableRows.slice(0, 3).map(row => (
                      <div key={row.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f5f5f5", fontFamily: "system-ui", fontSize: 12 }}>
                        <span style={{ fontFamily: "monospace", color: "#666" }}>{row.id}</span>
                        <span>{row.customer}</span>
                        <span style={{ fontWeight: 700 }}>{row.amount}</span>
                        <span style={{ background: statusStyle[row.status]?.bg, color: statusStyle[row.status]?.color, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>{row.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <p style={{ fontFamily: "system-ui", fontSize: 12, color: "#999", marginTop: 8 }}>
              ↑ Click the ← → button in the header to toggle sidebar. Click nav items to toggle active state.
            </p>
          </div>
        )}

        {/* ── STATUS BADGES ── */}
        {active === "Status Badges" && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Status Badges</h2>
            <p style={{ color: "#666", fontFamily: "system-ui", fontSize: 14, marginBottom: 32 }}>
              Semantic colors only — each status has one immutable style. No variations.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 48 }}>
              {statusBadges.map(b => (
                <div key={b.label} style={{ textAlign: "center" }}>
                  <div style={{
                    padding: "5px 14px",
                    background: b.bg,
                    color: b.text,
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: "system-ui",
                    letterSpacing: 0.5,
                    border: b.bg === "#ffffff" ? "1px solid #e0e0e0" : "none",
                    marginBottom: 8,
                  }}>
                    {b.label}
                  </div>
                  <div style={{ fontSize: 11, color: "#999", fontFamily: "monospace" }}>{b.bg}</div>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, fontFamily: "system-ui" }}>Order Status Flow</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 0, fontFamily: "system-ui", fontSize: 12, flexWrap: "wrap", gap: 0 }}>
              {["Pending", "Confirmed", "Processing", "Shipped", "Delivered"].map((s, i) => (
                <div key={s} style={{ display: "flex", alignItems: "center" }}>
                  <div style={{
                    padding: "8px 16px",
                    background: statusStyle[s]?.bg,
                    color: statusStyle[s]?.color,
                    fontWeight: 700,
                    fontSize: 12,
                  }}>
                    {s}
                  </div>
                  {i < 4 && <div style={{ color: "#999", padding: "0 4px", fontSize: 16 }}>→</div>}
                </div>
              ))}
            </div>

            <div style={{ marginTop: 32, fontFamily: "system-ui", fontSize: 13, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                ["Pending", "#999999", "Order received, awaiting confirmation"],
                ["Confirmed", "#1a56db", "Order verified and accepted"],
                ["Processing", "#f5a623", "Items being picked/packed"],
                ["Shipped", "#1a7a4a", "Dispatched to carrier"],
                ["Delivered", "#000000", "Delivered to customer"],
                ["Cancelled", "#c0392b", "Order cancelled (any stage)"],
              ].map(([label, hex, desc]) => (
                <div key={label} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 12, height: 12, background: hex, flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong>{label}</strong> — {desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TABLE DESIGN ── */}
        {active === "Table Design" && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Table Design</h2>
            <p style={{ color: "#666", fontFamily: "system-ui", fontSize: 14, marginBottom: 32 }}>
              The primary data display pattern. Hover rows to see interaction state.
            </p>

            {/* Filters */}
            <div style={{ display: "flex", gap: 10, marginBottom: 0, background: "#f5f5f5", padding: 16, border: "1px solid #e0e0e0", borderBottom: "none", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: 8 }}>
                {["All Status", "Pending", "Processing", "Shipped"].map(f => (
                  <button key={f} style={{ padding: "6px 12px", background: f === "All Status" ? "#000" : "#fff", color: f === "All Status" ? "#fff" : "#000", border: "1px solid #000", borderRadius: 0, fontFamily: "system-ui", fontSize: 12, cursor: "pointer" }}>
                    {f}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input placeholder="Search orders..." style={{ padding: "6px 12px", border: "1px solid #e0e0e0", borderRadius: 0, fontFamily: "system-ui", fontSize: 12, width: 180 }} />
                <button style={{ padding: "6px 14px", background: "#000", color: "#fff", border: "none", borderRadius: 0, fontFamily: "system-ui", fontSize: 12, cursor: "pointer" }}>
                  + New Order
                </button>
              </div>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "system-ui", fontSize: 13, border: "1px solid #e0e0e0" }}>
              <thead>
                <tr>
                  {["", "Order ID", "Customer", "Date", "Amount", "Status", "Actions"].map(col => (
                    <th key={col} style={{
                      background: "#000", color: "#fff", padding: "12px 14px",
                      textAlign: "left", fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
                      borderRight: "1px solid #333",
                    }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, i) => (
                  <tr key={row.id}
                    onMouseEnter={() => setHoveredRow(i)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{ background: hoveredRow === i ? "#f0f0f0" : i % 2 === 0 ? "#fff" : "#f5f5f5" }}>
                    <td style={{ padding: "11px 14px", borderBottom: "1px solid #e0e0e0" }}>
                      <input type="checkbox" style={{ cursor: "pointer" }} />
                    </td>
                    <td style={{ padding: "11px 14px", borderBottom: "1px solid #e0e0e0", fontFamily: "monospace", color: "#333" }}>{row.id}</td>
                    <td style={{ padding: "11px 14px", borderBottom: "1px solid #e0e0e0", fontWeight: 600 }}>{row.customer}</td>
                    <td style={{ padding: "11px 14px", borderBottom: "1px solid #e0e0e0", color: "#666" }}>{row.date}</td>
                    <td style={{ padding: "11px 14px", borderBottom: "1px solid #e0e0e0", fontWeight: 700 }}>{row.amount}</td>
                    <td style={{ padding: "11px 14px", borderBottom: "1px solid #e0e0e0" }}>
                      <span style={{
                        background: statusStyle[row.status]?.bg,
                        color: statusStyle[row.status]?.color,
                        padding: "3px 10px",
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: 0.3,
                      }}>
                        {row.status}
                      </span>
                    </td>
                    <td style={{ padding: "11px 14px", borderBottom: "1px solid #e0e0e0" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        {["View", "Edit"].map(action => (
                          <button key={action} style={{ padding: "4px 10px", background: action === "View" ? "#000" : "#fff", color: action === "View" ? "#fff" : "#000", border: "1px solid #000", borderRadius: 0, fontFamily: "system-ui", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>
                            {action}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", fontFamily: "system-ui", fontSize: 13, color: "#666" }}>
              <span>Showing 1–5 of 1,284 orders</span>
              <div style={{ display: "flex", gap: 4 }}>
                {["‹", "1", "2", "3", "...", "64", "›"].map((p, i) => (
                  <button key={i} style={{
                    width: 30, height: 30, border: "1px solid " + (p === "1" ? "#000" : "#e0e0e0"),
                    background: p === "1" ? "#000" : "#fff",
                    color: p === "1" ? "#fff" : "#000",
                    borderRadius: 0, fontFamily: "system-ui", fontSize: 13, cursor: "pointer",
                  }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── FOLDER STRUCTURE ── */}
        {active === "Folder Structure" && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Folder Structure</h2>
            <p style={{ color: "#666", fontFamily: "system-ui", fontSize: 14, marginBottom: 32 }}>
              Next.js 14 App Router architecture with feature-based component organization.
            </p>
            <div style={{ background: "#1a1a1a", color: "#f0f0f0", padding: 32, fontFamily: "monospace", fontSize: 13, lineHeight: 1.8, overflowX: "auto" }}>
              <pre style={{ margin: 0 }}>{folderStructure}</pre>
            </div>

            <div style={{ marginTop: 32, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {[
                ["app/(auth)/", "Unauthenticated routes — login, password reset. Separate layout, no sidebar."],
                ["app/(dashboard)/", "All protected pages share the sidebar+header layout via layout.tsx."],
                ["components/ui/", "Raw shadcn/ui primitives. Never modified directly."],
                ["components/shared/", "Reusable business components: DataTable, StatusBadge, Pagination, Filters."],
                ["hooks/", "React Query hooks per resource (useProducts, useOrders). Encapsulate all API calls."],
                ["stores/uiStore.ts", "Zustand for sidebar state, modal state, toast queue — never API data."],
                ["lib/api.ts", "Single Axios instance with base URL, auth header injection, 401 redirect."],
                ["middleware.ts", "Edge middleware: checks JWT cookie, redirects unauthenticated users to /login."],
              ].map(([path, desc]) => (
                <div key={path} style={{ borderLeft: "3px solid #000", paddingLeft: 16, fontFamily: "system-ui", fontSize: 13 }}>
                  <code style={{ fontSize: 12, background: "#f5f5f5", padding: "2px 6px", display: "block", marginBottom: 6 }}>{path}</code>
                  <div style={{ color: "#666", lineHeight: 1.6 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── BEST PRACTICES ── */}
        {active === "Best Practices" && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Best Practices</h2>
            <p style={{ color: "#666", fontFamily: "system-ui", fontSize: 14, marginBottom: 40 }}>
              Answering your 10 questions with actionable implementation guidance.
            </p>

            {[
              {
                q: "1. Black & white minimalist admin — key principles?",
                a: [
                  "Hierarchy through weight & size, never color. Bold = important; gray = secondary.",
                  "Every border serves a structural purpose. No decorative dividers.",
                  "Consistent 8px spacing grid. Use 8, 16, 24, 32, 48px only.",
                  "Sharp corners (border-radius: 0) throughout. They signal precision and professionalism.",
                  "Status is the only place you use accent colors — and use them sparingly.",
                ]
              },
              {
                q: "2. Sidebar navigation UX?",
                a: [
                  "Active state: left 3px solid border + darker background. Never just color change.",
                  "Collapse to icon-only (48px wide) at md breakpoint. Store state in Zustand, persist to localStorage.",
                  "Group items logically: Main (Dashboard, Products, Orders), Insights (Analytics), Config (Settings).",
                  "Add hover: bg #f5f5f5 (light) or #2a2a2a (dark). No animation — instant.",
                ]
              },
              {
                q: "3. Best chart types for e-commerce (Recharts)?",
                a: [
                  "Revenue trend → LineChart (daily/weekly). Single black line, no fill.",
                  "Orders by status → BarChart with black bars. Simple, direct.",
                  "Category breakdown → PieChart or horizontal BarChart. Avoid pie for >5 categories.",
                  "Conversion funnel → Custom vertical BarChart with descending widths.",
                  "All charts: CartesianGrid stroke='#e0e0e0', Tooltip with white bg + black border, no animation (isAnimationActive={false}).",
                ]
              },
              {
                q: "4. Responsive design without animations?",
                a: [
                  "Use CSS Grid with auto-fit/auto-fill for card grids — reflow instantly.",
                  "Sidebar: CSS width change (no transition). Controlled by state toggle.",
                  "Table on tablet: horizontal scroll inside overflow-x-auto container.",
                  "All display changes: instant className swaps via Tailwind responsive prefixes (md:, lg:).",
                ]
              },
              {
                q: "5. Form validation best practices?",
                a: [
                  "Zod schema per form, colocated with the component or in types/ folder.",
                  "useForm({ resolver: zodResolver(schema), mode: 'onBlur' }) — validate on blur, not on type.",
                  "Error display: red border + red text below field. Never toast for field errors.",
                  "Disable submit button during isSubmitting; re-enable on error. Never use loading spinners.",
                ]
              },
              {
                q: "6. Next.js component structure?",
                a: [
                  "Page components: thin orchestrators. Fetch data, pass to feature components.",
                  "Feature components (ProductTable, OrderDetail): smart, handle their own loading/error UI.",
                  "Shared components (DataTable, StatusBadge): dumb, pure UI, no data fetching.",
                  "Co-locate: ProductForm.tsx next to product pages, not in a global forms/ folder.",
                ]
              },
              {
                q: "7. Authentication & protected routes?",
                a: [
                  "middleware.ts: check httpOnly JWT cookie on every request. Redirect to /login if missing/expired.",
                  "API route /api/auth/login: set httpOnly cookie on success. Never store JWT in localStorage.",
                  "useAuth hook: wraps /api/auth/me query. Returns { user, isLoading, isError }.",
                  "Wrap sensitive API calls in Axios interceptor: 401 response → clear cookie → redirect.",
                ]
              },
              {
                q: "8. Backend API integration?",
                a: [
                  "Single lib/api.ts: Axios instance with baseURL from env, auth header from cookie.",
                  "Response interceptor: normalize errors, handle 401 globally.",
                  "Never call fetch/axios directly in components — always through custom hooks.",
                  "Type all API responses with TypeScript interfaces in types/ folder.",
                ]
              },
              {
                q: "9. React Query for admin CRUD?",
                a: [
                  "useQuery for reads: queryKey: ['products', filters]. Stale time 30–60 seconds for lists.",
                  "useMutation for writes. onSuccess: queryClient.invalidateQueries(['products']).",
                  "Optimistic updates for status changes (instant UX, rollback on error).",
                  "queryClient.prefetchQuery on hover over list items to speed up detail page loads.",
                ]
              },
              {
                q: "10. No-animation interactions?",
                a: [
                  "Set transition: none !important globally in globals.css to override shadcn defaults.",
                  "Modal open/close: toggle visible class instantly (no opacity fade).",
                  "Table sort: re-render immediately, no sort animation.",
                  "Button states: instant background-color change on :hover in CSS.",
                ]
              },
            ].map(({ q, a }) => (
              <div key={q} style={{ borderTop: "1px solid #e0e0e0", paddingTop: 24, marginBottom: 24 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, fontFamily: "system-ui", marginBottom: 12 }}>{q}</h3>
                <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none" }}>
                  {a.map((point, i) => (
                    <li key={i} style={{ display: "flex", gap: 12, fontFamily: "system-ui", fontSize: 13, color: "#333", lineHeight: 1.7, marginBottom: 4 }}>
                      <span style={{ color: "#000", fontWeight: 700, flexShrink: 0 }}>→</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid #e0e0e0", padding: "20px 48px", display: "flex", justifyContent: "space-between", fontFamily: "system-ui", fontSize: 12, color: "#999" }}>
        <span>Admin Panel Design Guide · v1.0 · Feb 2026</span>
        <span>Black #000000 · White #ffffff · 8px grid · 0px radius</span>
      </div>
    </div>
  );
}