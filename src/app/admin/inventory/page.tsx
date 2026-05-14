"use client";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Ban, Plus, AlertTriangle, Package } from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku: string | null;
  image_url: string | null;
  stock_quantity: number;
  categories: { name: string } | { name: string }[] | null;
}

interface Warehouse {
  id: string;
  name: string;
  location: string | null;
  is_active: boolean;
}

interface WarehouseInventory {
  id: string;
  product_id: string;
  warehouse_id: string;
  available_quantity: number;
  reserved_quantity: number;
  low_stock_threshold: number;
  updated_at: string;
}

export default function InventoryPage() {
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [inventory, setInventory] = useState<WarehouseInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterWarehouse, setFilterWarehouse] = useState<string>("all");
  const [showLowStock, setShowLowStock] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<{ productId: string; warehouseId: string; available: number } | null>(null);
  const [newEntry, setNewEntry] = useState({ product_id: "", warehouse_id: "", available_quantity: "0", reserved_quantity: "0", low_stock_threshold: "10" });
  const [transfer, setTransfer] = useState({ product_id: "", from_warehouse_id: "", to_warehouse_id: "", quantity: "1" });
  const [updateQty, setUpdateQty] = useState({ available: "0", reserved: "0", threshold: "10" });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [productsRes, warehousesRes, inventoryRes] = await Promise.all([
      supabase.from("products").select("id, name, sku, image_url, stock_quantity, category_id").order("name").limit(500),
      supabase.from("warehouses").select("id, name, location, is_active").eq("is_active", true).order("name"),
      supabase.from("warehouse_inventory").select("*").order("updated_at", { ascending: false }).limit(500),
    ]);
    setProducts((productsRes.data || []) as Product[]);
    setWarehouses((warehousesRes.data || []) as Warehouse[]);
    setInventory((inventoryRes.data || []) as WarehouseInventory[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { loadData(); }, [loadData]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Build lookup maps
  const productMap = Object.fromEntries(products.map(p => [p.id, p]));
  const warehouseMap = Object.fromEntries(warehouses.map(w => [w.id, w]));

  // Enrich inventory with product & warehouse data
  const enrichedInventory = inventory.map(entry => ({
    ...entry,
    product: productMap[entry.product_id],
    warehouse: warehouseMap[entry.warehouse_id],
  }));

  const filteredInventory = enrichedInventory.filter(entry => {
    if (showLowStock && entry.available_quantity >= entry.low_stock_threshold) return false;
    if (filterWarehouse !== "all" && entry.warehouse_id !== filterWarehouse) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const name = (entry.product?.name || "").toLowerCase();
    const sku = (entry.product?.sku || "").toLowerCase();
    return name.includes(q) || sku.includes(q);
  });

  const totalStock = inventory.reduce((sum, i) => sum + i.available_quantity, 0);
  const reservedStock = inventory.reduce((sum, i) => sum + i.reserved_quantity, 0);
  const lowStockCount = inventory.filter(i => i.available_quantity < i.low_stock_threshold).length;

  // Combined view: product-level inventory across warehouses
  const combinedInventory = filteredInventory.length > 0
    ? filteredInventory
    : products.map(p => ({
        id: `combined-${p.id}`,
        product_id: p.id,
        warehouse_id: "all",
        available_quantity: p.stock_quantity,
        reserved_quantity: 0,
        low_stock_threshold: 10,
        updated_at: "",
        product: p,
        warehouse: null,
      })).filter(e => {
        if (showLowStock && e.available_quantity >= e.low_stock_threshold) return false;
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (e.product?.name || "").toLowerCase().includes(q) || (e.product?.sku || "").toLowerCase().includes(q);
      });

  const handleAddEntry = async () => {
    if (!newEntry.product_id || !newEntry.warehouse_id) {
      showToast("Product and warehouse are required", "error"); return;
    }
    setSaving(true);
    // Check if entry exists
    const { data: existing } = await supabase
      .from("warehouse_inventory")
      .select("id")
      .eq("product_id", newEntry.product_id)
      .eq("warehouse_id", newEntry.warehouse_id)
      .single();
    let result;
    if (existing) {
      result = await supabase.from("warehouse_inventory").update({
        available_quantity: parseInt(newEntry.available_quantity) || 0,
        reserved_quantity: parseInt(newEntry.reserved_quantity) || 0,
        low_stock_threshold: parseInt(newEntry.low_stock_threshold) || 10,
      }).eq("id", existing.id).select().single();
    } else {
      result = await supabase.from("warehouse_inventory").insert([{
        product_id: newEntry.product_id,
        warehouse_id: newEntry.warehouse_id,
        available_quantity: parseInt(newEntry.available_quantity) || 0,
        reserved_quantity: parseInt(newEntry.reserved_quantity) || 0,
        low_stock_threshold: parseInt(newEntry.low_stock_threshold) || 10,
      }]).select().single();
    }
    setSaving(false);
    if (result.error) { showToast(`Failed: ${result.error.message}`, "error"); }
    else {
      showToast("Inventory entry saved!", "success");
      setShowAddModal(false);
      setNewEntry({ product_id: "", warehouse_id: "", available_quantity: "0", reserved_quantity: "0", low_stock_threshold: "10" });
      loadData();
    }
  };

  const handleUpdateStock = async () => {
    if (!selectedEntry) return;
    setSaving(true);
    const { data: existing } = await supabase
      .from("warehouse_inventory")
      .select("id")
      .eq("product_id", selectedEntry.productId)
      .eq("warehouse_id", selectedEntry.warehouseId)
      .single();
    let result;
    if (existing) {
      result = await supabase.from("warehouse_inventory").update({
        available_quantity: parseInt(updateQty.available) || 0,
        reserved_quantity: parseInt(updateQty.reserved) || 0,
        low_stock_threshold: parseInt(updateQty.threshold) || 10,
      }).eq("id", existing.id).select().single();
    } else {
      result = await supabase.from("warehouse_inventory").insert([{
        product_id: selectedEntry.productId,
        warehouse_id: selectedEntry.warehouseId,
        available_quantity: parseInt(updateQty.available) || 0,
        reserved_quantity: parseInt(updateQty.reserved) || 0,
        low_stock_threshold: parseInt(updateQty.threshold) || 10,
      }]).select().single();
    }
    setSaving(false);
    if (result.error) { showToast(`Failed: ${result.error.message}`, "error"); }
    else { showToast("Stock updated!", "success"); setShowUpdateModal(false); setSelectedEntry(null); loadData(); }
  };

  const openUpdateModal = (productId: string, warehouseId: string, available: number, reserved: number, threshold: number) => {
    setSelectedEntry({ productId, warehouseId, available });
    setUpdateQty({ available: available.toString(), reserved: reserved.toString(), threshold: threshold.toString() });
    setShowUpdateModal(true);
  };

  const handleTransfer = async () => {
    if (!transfer.product_id || !transfer.from_warehouse_id || !transfer.to_warehouse_id) {
      showToast("All fields are required", "error"); return;
    }
    const qty = parseInt(transfer.quantity) || 0;
    if (qty <= 0) { showToast("Quantity must be positive", "error"); return; }
    if (transfer.from_warehouse_id === transfer.to_warehouse_id) { showToast("Source and destination must be different", "error"); return; }
    setSaving(true);
    // Get from warehouse
    const { data: fromEntry } = await supabase
      .from("warehouse_inventory")
      .select("id, available_quantity")
      .eq("product_id", transfer.product_id)
      .eq("warehouse_id", transfer.from_warehouse_id)
      .single();
    if (!fromEntry || fromEntry.available_quantity < qty) {
      setSaving(false); showToast("Insufficient stock in source warehouse", "error"); return;
    }
    // Update source
    await supabase.from("warehouse_inventory").update({ available_quantity: fromEntry.available_quantity - qty }).eq("id", fromEntry.id);
    // Update destination
    const { data: toEntry } = await supabase
      .from("warehouse_inventory")
      .select("id, available_quantity")
      .eq("product_id", transfer.product_id)
      .eq("warehouse_id", transfer.to_warehouse_id)
      .single();
    if (toEntry) {
      await supabase.from("warehouse_inventory").update({ available_quantity: (toEntry.available_quantity || 0) + qty }).eq("id", toEntry.id);
    } else {
      await supabase.from("warehouse_inventory").insert([{ product_id: transfer.product_id, warehouse_id: transfer.to_warehouse_id, available_quantity: qty, reserved_quantity: 0, low_stock_threshold: 10 }]);
    }
    setSaving(false);
    showToast(`Transferred ${qty} units!`, "success");
    setShowTransferModal(false);
    setTransfer({ product_id: "", from_warehouse_id: "", to_warehouse_id: "", quantity: "1" });
    loadData();
  };

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "600", color: "#141413", margin: "0 0 4px" }}>Inventory Management</h1>
          <p style={{ color: "#6B6B67", margin: 0, fontSize: "13px" }}>
            {inventory.length} warehouse entries
            {lowStockCount > 0 && <span style={{ color: "#ef4444", marginLeft: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}><Ban size={14} />{lowStockCount} low stock alerts</span>}
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => { setTransfer({ product_id: "", from_warehouse_id: "", to_warehouse_id: "", quantity: "1" }); setShowTransferModal(true); }}
            style={{ padding: "10px 16px", borderRadius: "8px", border: "1px solid rgba(96,165,250,0.4)", background: "rgba(96,165,250,0.1)", color: "#60a5fa", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
            🔄 Transfer Stock
          </button>
          <button onClick={() => { setNewEntry({ product_id: "", warehouse_id: "", available_quantity: "0", reserved_quantity: "0", low_stock_threshold: "10" }); setShowAddModal(true); }}
            style={{ padding: "10px 16px", borderRadius: "8px", border: "1px solid rgba(34,197,94,0.4)", background: "rgba(34,197,94,0.1)", color: "#22c55e", fontSize: "13px", fontWeight: "600", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <Plus size={16} /> Add Inventory
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Total Available", value: totalStock.toLocaleString(), color: "#22c55e" },
          { label: "Total Reserved", value: reservedStock.toLocaleString(), color: "#a78bfa" },
          { label: "Low Stock Alerts", value: lowStockCount.toString(), color: lowStockCount > 0 ? "#ef4444" : "#898989" },
          { label: "Active Warehouses", value: warehouses.length.toString(), color: "#3ecf8e" },
        ].map(s => (
          <div key={s.label} style={{ padding: "20px", borderRadius: "12px", background: "white", border: "1px solid #E5E5E0" }}>
            <div style={{ fontSize: "11px", color: "#6B6B67", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>{s.label}</div>
            <div style={{ fontSize: "28px", fontWeight: "700", color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        <input type="text" placeholder="Search product name or SKU..."
          value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          style={{ flex: 1, maxWidth: "350px", padding: "12px 16px", borderRadius: "8px", border: "1px solid #E5E5E0", background: "white", color: "#141413", fontSize: "14px", outline: "none" }} />
        <select value={filterWarehouse} onChange={e => setFilterWarehouse(e.target.value)}
          style={{ padding: "12px 16px", borderRadius: "8px", border: "1px solid #E5E5E0", background: "white", color: "#141413", fontSize: "14px", outline: "none" }}>
          <option value="all">All Warehouses</option>
          {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
        <button onClick={() => setShowLowStock(!showLowStock)} style={{
          padding: "12px 16px", borderRadius: "8px", border: "1px solid",
          borderColor: showLowStock ? "#ef4444" : "#E5E5E0",
          background: showLowStock ? "rgba(239,68,68,0.1)" : "white",
          color: showLowStock ? "#ef4444" : "#141413",
          fontSize: "14px", cursor: "pointer", fontWeight: showLowStock ? "600" : "400",
          display: "inline-flex", alignItems: "center", gap: "6px"
        }}>
          <AlertTriangle size={16} /> Low Stock Only
        </button>
      </div>

      {/* Table */}
      <div style={{ background: "white", border: "1px solid #E5E5E0", borderRadius: "12px", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "48px", textAlign: "center", color: "#6B6B67" }}>Loading inventory...</div>
        ) : combinedInventory.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: "#6B6B67" }}>
            {searchQuery || filterWarehouse !== "all" || showLowStock ? "No inventory entries match your filters" : "No inventory data. Add inventory entries or products."}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #E5E5E0" }}>
                  {["Product", "SKU", "Warehouse", "Available", "Reserved", "Total", "Status", "Actions"].map(h => (
                    <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: "12px", color: "#6B6B67", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {combinedInventory.map(entry => {
                  const total = entry.available_quantity + entry.reserved_quantity;
                  const isLow = entry.available_quantity < entry.low_stock_threshold;
                  return (
                    <tr key={entry.id} style={{ borderBottom: "1px solid #E5E5E0" }}>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          {entry.product?.image_url ? (
                            <img src={entry.product.image_url} alt={entry.product.name}
                              style={{ width: "36px", height: "36px", objectFit: "cover", borderRadius: "6px" }}
                              onError={e => { e.currentTarget.style.display = "none"; (e.currentTarget.nextElementSibling as HTMLElement).style.display = "flex"; }} />
                          ) : null}
                          <div style={{ width: "36px", height: "36px", borderRadius: "6px", background: "#F4F4F1", display: entry.product?.image_url ? "none" : "flex", alignItems: "center", justifyContent: "center" }}><Package size={18} color="#6B6B67" /></div>
                          <span style={{ fontSize: "14px", fontWeight: "500", color: "#141413" }}>{entry.product?.name || "—"}</span>
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: "13px", color: "#6B6B67" }}>
                        {entry.product?.sku || "—"}
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: "13px", color: "#6B6B67" }}>
                        {entry.warehouse ? (
                          <span style={{ padding: "3px 8px", borderRadius: "4px", background: "rgba(62,207,142,0.1)", color: "#3ecf8e", fontSize: "12px", fontWeight: "500" }}>
                            {entry.warehouse.name}
                          </span>
                        ) : "—"}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{
                          padding: "4px 10px", borderRadius: "6px", fontSize: "13px", fontWeight: "600",
                          background: isLow ? "rgba(239,68,68,0.1)" : entry.available_quantity > 0 ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                          color: isLow ? "#ef4444" : entry.available_quantity > 0 ? "#22c55e" : "#ef4444"
                        }}>
                          {entry.available_quantity}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ padding: "4px 10px", borderRadius: "6px", fontSize: "13px", fontWeight: "600", background: "rgba(167,139,250,0.1)", color: "#a78bfa" }}>
                          {entry.reserved_quantity}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: "14px", fontWeight: "600", color: "#141413" }}>
                        {total}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        {isLow ? (
                          <span style={{ padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "600", background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <AlertTriangle size={12} /> Low Stock
                          </span>
                        ) : entry.available_quantity === 0 ? (
                          <span style={{ padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "600", background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>Out of Stock</span>
                        ) : (
                          <span style={{ padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "600", background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>In Stock</span>
                        )}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <button onClick={() => openUpdateModal(
                          entry.product_id,
                          entry.warehouse_id,
                          entry.available_quantity,
                          entry.reserved_quantity,
                          entry.low_stock_threshold
                        )}
                          style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #E5E5E0", background: "transparent", color: "#141413", fontSize: "12px", cursor: "pointer" }}>
                          Update
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Inventory Modal */}
      {showAddModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px" }}
          onClick={e => e.target === e.currentTarget && setShowAddModal(false)}>
          <div style={{ background: "white", border: "1px solid #E5E5E0", borderRadius: "12px", width: "100%", maxWidth: "480px", padding: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#141413", margin: 0 }}>Add Inventory Entry</h2>
              <button onClick={() => setShowAddModal(false)} style={{ padding: "8px", border: "none", background: "transparent", color: "#6B6B67", cursor: "pointer", fontSize: "18px" }}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", color: "#6B6B67", marginBottom: "6px" }}>Product *</label>
                <select value={newEntry.product_id} onChange={e => setNewEntry(prev => ({ ...prev, product_id: e.target.value }))} style={inputStyle}>
                  <option value="">Select Product</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} {p.sku ? `(${p.sku})` : ""}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", color: "#6B6B67", marginBottom: "6px" }}>Warehouse *</label>
                <select value={newEntry.warehouse_id} onChange={e => setNewEntry(prev => ({ ...prev, warehouse_id: e.target.value }))} style={inputStyle}>
                  <option value="">Select Warehouse</option>
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}{w.location ? ` — ${w.location}` : ""}</option>)}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", color: "#6B6B67", marginBottom: "6px" }}>Available Qty</label>
                  <input type="number" min="0" value={newEntry.available_quantity} onChange={e => setNewEntry(prev => ({ ...prev, available_quantity: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", color: "#6B6B67", marginBottom: "6px" }}>Reserved Qty</label>
                  <input type="number" min="0" value={newEntry.reserved_quantity} onChange={e => setNewEntry(prev => ({ ...prev, reserved_quantity: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", color: "#6B6B67", marginBottom: "6px" }}>Low Stock Alert</label>
                  <input type="number" min="0" value={newEntry.low_stock_threshold} onChange={e => setNewEntry(prev => ({ ...prev, low_stock_threshold: e.target.value }))} style={inputStyle} />
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button onClick={handleAddEntry} disabled={saving} style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "none", background: "#22c55e", color: "#fff", fontSize: "14px", fontWeight: "600", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1 }}>
                {saving ? "Saving..." : "Save Entry"}
              </button>
              <button onClick={() => setShowAddModal(false)} style={{ padding: "12px 24px", borderRadius: "8px", border: "1px solid #E5E5E0", background: "transparent", color: "#141413", fontSize: "14px", cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Update Stock Modal */}
      {showUpdateModal && selectedEntry && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px" }}
          onClick={e => e.target === e.currentTarget && setShowUpdateModal(false)}>
          <div style={{ background: "white", border: "1px solid #E5E5E0", borderRadius: "12px", width: "100%", maxWidth: "420px", padding: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#141413", margin: 0 }}>Update Stock</h2>
              <button onClick={() => { setShowUpdateModal(false); setSelectedEntry(null); }} style={{ padding: "8px", border: "none", background: "transparent", color: "#6B6B67", cursor: "pointer", fontSize: "18px" }}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ padding: "14px", borderRadius: "8px", background: "#F4F4F1", border: "1px solid #E5E5E0" }}>
                <div style={{ fontSize: "13px", color: "#6B6B67", marginBottom: "4px" }}>Product</div>
                <div style={{ fontSize: "14px", fontWeight: "500", color: "#141413" }}>{productMap[selectedEntry.productId]?.name || "—"}</div>
                {warehouseMap[selectedEntry.warehouseId] && (
                  <div style={{ fontSize: "12px", color: "#6B6B67", marginTop: "2px" }}>Warehouse: {warehouseMap[selectedEntry.warehouseId]?.name}</div>
                )}
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", color: "#6B6B67", marginBottom: "6px" }}>Available Quantity</label>
                <input type="number" min="0" value={updateQty.available} onChange={e => setUpdateQty(prev => ({ ...prev, available: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", color: "#6B6B67", marginBottom: "6px" }}>Reserved Quantity</label>
                <input type="number" min="0" value={updateQty.reserved} onChange={e => setUpdateQty(prev => ({ ...prev, reserved: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", color: "#6B6B67", marginBottom: "6px" }}>Low Stock Threshold</label>
                <input type="number" min="0" value={updateQty.threshold} onChange={e => setUpdateQty(prev => ({ ...prev, threshold: e.target.value }))} style={inputStyle} />
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button onClick={handleUpdateStock} disabled={saving} style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "none", background: "#22c55e", color: "#fff", fontSize: "14px", fontWeight: "600", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1 }}>
                {saving ? "Saving..." : "Update Stock"}
              </button>
              <button onClick={() => { setShowUpdateModal(false); setSelectedEntry(null); }} style={{ padding: "12px 24px", borderRadius: "8px", border: "1px solid #E5E5E0", background: "transparent", color: "#141413", fontSize: "14px", cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px" }}
          onClick={e => e.target === e.currentTarget && setShowTransferModal(false)}>
          <div style={{ background: "white", border: "1px solid #E5E5E0", borderRadius: "12px", width: "100%", maxWidth: "480px", padding: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#141413", margin: 0 }}>Transfer Stock</h2>
              <button onClick={() => setShowTransferModal(false)} style={{ padding: "8px", border: "none", background: "transparent", color: "#6B6B67", cursor: "pointer", fontSize: "18px" }}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", color: "#6B6B67", marginBottom: "6px" }}>Product *</label>
                <select value={transfer.product_id} onChange={e => setTransfer(prev => ({ ...prev, product_id: e.target.value }))} style={inputStyle}>
                  <option value="">Select Product</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} {p.sku ? `(${p.sku})` : ""}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", color: "#6B6B67", marginBottom: "6px" }}>From Warehouse *</label>
                <select value={transfer.from_warehouse_id} onChange={e => setTransfer(prev => ({ ...prev, from_warehouse_id: e.target.value }))} style={inputStyle}>
                  <option value="">Select Source</option>
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", color: "#6B6B67", marginBottom: "6px" }}>To Warehouse *</label>
                <select value={transfer.to_warehouse_id} onChange={e => setTransfer(prev => ({ ...prev, to_warehouse_id: e.target.value }))} style={inputStyle}>
                  <option value="">Select Destination</option>
                  {warehouses.filter(w => w.id !== transfer.from_warehouse_id).map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", color: "#6B6B67", marginBottom: "6px" }}>Quantity *</label>
                <input type="number" min="1" value={transfer.quantity} onChange={e => setTransfer(prev => ({ ...prev, quantity: e.target.value }))} style={inputStyle} placeholder="1" />
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button onClick={handleTransfer} disabled={saving} style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "none", background: "#60a5fa", color: "#fff", fontSize: "14px", fontWeight: "600", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1 }}>
                {saving ? "Transferring..." : "Transfer Stock"}
              </button>
              <button onClick={() => setShowTransferModal(false)} style={{ padding: "12px 24px", borderRadius: "8px", border: "1px solid #E5E5E0", background: "transparent", color: "#141413", fontSize: "14px", cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: "24px", right: "24px",
          padding: "14px 20px", borderRadius: "8px",
          background: toast.type === "success" ? "#22c55e" : "#ef4444",
          color: "#fff", fontSize: "14px", fontWeight: "500",
          zIndex: 200, animation: "slideIn 0.3s ease"
        }}>
          {toast.message}
        </div>
      )}

      <style jsx global>{`
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        input::placeholder, textarea::placeholder { color: #6B6B67; }
        select option { background: #FAFAF8; color: #141413; }
      `}</style>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: "8px",
  border: "1px solid #E5E5E0", background: "#F4F4F1",
  color: "#141413", fontSize: "14px", outline: "none", boxSizing: "border-box"
};