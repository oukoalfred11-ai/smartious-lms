/**
 * InventoryModule.jsx — the finance portal's inventory. Assets and
 * consumables across both centres and the cloud, with a custodian on
 * every asset, reorder alerts on consumables, and a movement trail
 * on every item: the permanent record of accountability.
 */
import React, { useState, useEffect, useCallback } from 'react'
import { api } from '../../../../context/ctx.jsx'
import { PSection } from '../shared/ui.jsx'

const CRIM = '#7D1025', GOLD = '#C9973A', INK = '#231715', MUT = '#8A8378', LINE = '#E5DFD3', TEAL = '#0F766E', RED = '#B91C1C'
const KES = (n) => 'KES ' + Math.round(n || 0).toLocaleString('en-KE')
const fmtD = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '\u2014'
const STATUS = {
  in_service: { label: 'In service', color: '#15803D', bg: '#EDF7EF' },
  assigned: { label: 'Assigned', color: '#B07A18', bg: '#FBF4E4' },
  in_repair: { label: 'In repair', color: '#B45309', bg: '#FEF3E2' },
  retired: { label: 'Retired', color: MUT, bg: '#F2EFE9' },
  lost: { label: 'Lost', color: RED, bg: '#FBEAEA' },
}
const COND_COLORS = { New: '#15803D', Good: TEAL, Fair: '#B07A18', 'Needs Repair': '#B45309', Retired: MUT }

const EMPTY = { name: '', category: 'Electronics', kind: 'asset', serialNumber: '', location: 'Parklands Centre', quantity: 1, unit: 'pcs', reorderLevel: 0, purchaseDate: '', purchaseCost: '', supplier: '', condition: 'Good', notes: '' }

export default function InventoryModule({ toast }) {
  const [data, setData] = useState(null)
  const [filters, setFilters] = useState({ q: '', category: '', location: '', status: '', kind: '' })
  const [openItem, setOpenItem] = useState(null)
  const [form, setForm] = useState(null)      // add or edit form state
  const [adjust, setAdjust] = useState(null)  // { id, delta, note }
  const [busy, setBusy] = useState(false)

  const load = useCallback(() => {
    const params = {}
    for (const k of ['category', 'location', 'status', 'kind', 'q']) if (filters[k]) params[k] = filters[k]
    api.get('/inventory', { params })
      .then(r => setData(r.data?.data || null))
      .catch(e => toast?.error?.(e?.response?.data?.message || 'Could not load the inventory.'))
  }, [filters, toast])
  useEffect(() => { load() }, [load])

  const openDetail = (id) => {
    api.get(`/inventory/${id}`).then(r => setOpenItem(r.data?.data?.item || null)).catch(() => {})
  }

  const save = async () => {
    if (busy) return
    setBusy(true)
    try {
      if (form._id) await api.patch(`/inventory/${form._id}`, form)
      else await api.post('/inventory', form)
      setForm(null); load()
      if (openItem && form._id === openItem._id) openDetail(form._id)
    } catch (e) { toast?.error?.(e?.response?.data?.message || 'Save failed.') } finally { setBusy(false) }
  }

  const doAdjust = async () => {
    if (busy || !adjust?.delta) return
    setBusy(true)
    try {
      await api.post(`/inventory/${adjust.id}/adjust`, { delta: Number(adjust.delta), note: adjust.note || '' })
      setAdjust(null); load()
      if (openItem?._id === adjust.id) openDetail(adjust.id)
    } catch (e) { toast?.error?.(e?.response?.data?.message || 'Adjustment failed.') } finally { setBusy(false) }
  }

  const setStatus = async (id, status) => {
    try { await api.patch(`/inventory/${id}`, { status }); load(); openDetail(id) }
    catch (e) { toast?.error?.('Could not update status.') }
  }

  const dlCSV = () => {
    const esc = (v) => '"' + String(v ?? '').replace(/"/g, '""') + '"'
    const cols = ['Tag', 'Name', 'Category', 'Kind', 'Location', 'Custodian', 'Qty', 'Unit', 'Unit cost', 'Value', 'Condition', 'Status', 'Serial', 'Supplier', 'Purchased']
    const rows = (data?.items || []).map(i => [i.assetTag, i.name, i.category, i.kind, i.location, i.custodianName, i.quantity, i.unit, i.purchaseCost, (i.purchaseCost || 0) * (i.quantity || 0), i.condition, i.status, i.serialNumber, i.supplier, i.purchaseDate ? new Date(i.purchaseDate).toISOString().slice(0, 10) : ''].map(esc).join(','))
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([[cols.map(esc).join(',')].concat(rows).join('\n')], { type: 'text/csv' }))
    a.download = `inventory-${new Date().toISOString().slice(0, 10)}.csv`
    a.click(); URL.revokeObjectURL(a.href)
  }

  if (!data) return <div style={{ padding: 30, color: MUT, fontSize: 13 }}>Loading the inventory...</div>

  const card = { background: '#fff', border: `1px solid ${LINE}`, borderRadius: 14, padding: 16 }
  const input = { padding: '8px 10px', border: `1.5px solid ${LINE}`, borderRadius: 9, fontSize: 12.5 }
  const kpi = (label, value, color) => (
    <div style={{ ...card, minWidth: 130, padding: 14 }}>
      <div style={{ fontSize: 20, fontWeight: 900, color }}>{value}</div>
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.07em', color: MUT, textTransform: 'uppercase' }}>{label}</div>
    </div>
  )
  const lowStock = (i) => i.kind === 'consumable' && i.reorderLevel > 0 && i.quantity <= i.reorderLevel

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <PSection tag="Finance" title="School" em="Inventory"
        sub="Assets and consumables across the centres and the cloud. Every move, assignment and adjustment is recorded on the item's trail." />

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {kpi('Items in estate', data.kpis.items, INK)}
        {kpi('Estate value', KES(data.kpis.totalValue), CRIM)}
        {kpi('Low stock', data.kpis.lowStock, data.kpis.lowStock ? '#B45309' : '#15803D')}
        {kpi('In repair', data.kpis.inRepair, data.kpis.inRepair ? '#B45309' : INK)}
        {kpi('Lost value', KES(data.kpis.lostValue), data.kpis.lostValue ? RED : INK)}
      </div>

      <div style={card}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
          <input value={filters.q} onChange={e => setFilters(f => ({ ...f, q: e.target.value }))} placeholder="Search name, tag, serial, custodian..." style={{ ...input, width: 220 }} />
          <select value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))} style={input}>
            <option value="">All categories</option>
            {data.categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filters.location} onChange={e => setFilters(f => ({ ...f, location: e.target.value }))} style={input}>
            <option value="">All locations</option>
            {data.locations.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} style={input}>
            <option value="">All statuses</option>
            {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <span style={{ flex: 1 }} />
          <button onClick={dlCSV} style={{ padding: '7px 14px', borderRadius: 9, border: `1.5px solid ${CRIM}`, background: '#fff', color: CRIM, fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>CSV</button>
          <button onClick={() => setForm({ ...EMPTY })} style={{ padding: '7px 16px', borderRadius: 9, border: 'none', background: CRIM, color: '#fff', fontSize: 11.5, fontWeight: 800, cursor: 'pointer' }}>Add item</button>
        </div>

        <div style={{ maxHeight: 440, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead><tr>{['Tag', 'Item', 'Category', 'Location', 'Custodian', 'Qty', 'Value', 'Condition', 'Status'].map(h =>
              <th key={h} style={{ position: 'sticky', top: 0, textAlign: 'left', padding: '7px 8px', background: '#F7F2EA', fontSize: 10.5, color: CRIM }}>{h}</th>)}</tr></thead>
            <tbody>
              {(data.items || []).map(i => {
                const st = STATUS[i.status] || STATUS.in_service
                return (
                  <tr key={i._id} onClick={() => openDetail(i._id)} style={{ borderTop: `1px solid ${LINE}`, cursor: 'pointer', background: openItem?._id === i._id ? '#FBF4E4' : undefined }}>
                    <td style={{ padding: '7px 8px', fontWeight: 700, color: MUT, whiteSpace: 'nowrap' }}>{i.assetTag}</td>
                    <td style={{ padding: '7px 8px', fontWeight: 700, color: INK }}>{i.name}{i.serialNumber && <div style={{ fontSize: 9.5, color: MUT, fontWeight: 500 }}>SN {i.serialNumber}</div>}</td>
                    <td style={{ padding: '7px 8px', color: MUT }}>{i.category}</td>
                    <td style={{ padding: '7px 8px', color: MUT }}>{i.location}</td>
                    <td style={{ padding: '7px 8px', color: i.custodianName ? INK : MUT }}>{i.custodianName || '\u2014'}</td>
                    <td style={{ padding: '7px 8px', fontWeight: 800, color: lowStock(i) ? '#B45309' : INK }}>
                      {i.quantity} {i.unit}{lowStock(i) && <span style={{ marginLeft: 5, fontSize: 8.5, fontWeight: 900, color: '#B45309', background: '#FEF3E2', borderRadius: 999, padding: '2px 7px' }}>LOW</span>}
                    </td>
                    <td style={{ padding: '7px 8px', color: INK }}>{KES((i.purchaseCost || 0) * (i.quantity || 0))}</td>
                    <td style={{ padding: '7px 8px' }}><span style={{ fontSize: 10, fontWeight: 800, color: COND_COLORS[i.condition] || MUT }}>{i.condition}</span></td>
                    <td style={{ padding: '7px 8px' }}><span style={{ fontSize: 9.5, fontWeight: 800, color: st.color, background: st.bg, borderRadius: 999, padding: '3px 10px', whiteSpace: 'nowrap' }}>{st.label}</span></td>
                  </tr>
                )
              })}
              {(data.items || []).length === 0 && <tr><td colSpan={9} style={{ padding: 20, color: MUT, fontSize: 12 }}>Nothing matches. Add the first item to begin the register.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail: the item and its movement trail */}
      {openItem && (
        <div style={card}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', borderBottom: `1px solid ${LINE}`, paddingBottom: 10, marginBottom: 10 }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <b style={{ fontSize: 14.5, color: INK }}>{openItem.name}</b>
              <div style={{ fontSize: 11, color: MUT }}>{openItem.assetTag} {'\u00b7'} {openItem.category} {'\u00b7'} {openItem.location} {'\u00b7'} bought {fmtD(openItem.purchaseDate)}{openItem.supplier ? ' from ' + openItem.supplier : ''}</div>
            </div>
            {openItem.kind === 'consumable' && (
              <button onClick={() => setAdjust({ id: openItem._id, delta: '', note: '' })} style={{ padding: '7px 13px', borderRadius: 9, border: `1.5px solid ${TEAL}`, background: '#fff', color: TEAL, fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>Adjust stock</button>
            )}
            <button onClick={() => setForm({ ...openItem, purchaseDate: openItem.purchaseDate ? String(openItem.purchaseDate).slice(0, 10) : '' })} style={{ padding: '7px 13px', borderRadius: 9, border: `1.5px solid ${LINE}`, background: '#fff', color: INK, fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>Edit</button>
            {openItem.status !== 'in_repair' && openItem.status !== 'retired' && <button onClick={() => setStatus(openItem._id, 'in_repair')} style={{ padding: '7px 13px', borderRadius: 9, border: `1.5px solid #F0C9A0`, background: '#fff', color: '#B45309', fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>To repair</button>}
            {openItem.status === 'in_repair' && <button onClick={() => setStatus(openItem._id, 'in_service')} style={{ padding: '7px 13px', borderRadius: 9, border: `1.5px solid #BFE3C6`, background: '#fff', color: '#15803D', fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>Back in service</button>}
            {openItem.status !== 'retired' && <button onClick={() => window.confirm('Retire ' + openItem.name + '? History is kept.') && setStatus(openItem._id, 'retired')} style={{ padding: '7px 13px', borderRadius: 9, border: `1.5px solid ${LINE}`, background: '#fff', color: MUT, fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>Retire</button>}
            <button onClick={() => setOpenItem(null)} style={{ padding: '7px 11px', borderRadius: 9, border: 'none', background: 'none', color: MUT, fontSize: 13, cursor: 'pointer' }}>{'\u2715'}</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 900, letterSpacing: '.09em', color: GOLD, textTransform: 'uppercase', marginBottom: 6 }}>Assignment</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input defaultValue={openItem.custodianName} id="inv-cust" placeholder="Custodian name (blank = returned)" style={{ ...input, flex: 1 }} />
                <button onClick={() => { const v = document.getElementById('inv-cust').value; api.patch(`/inventory/${openItem._id}`, { custodianName: v }).then(() => { load(); openDetail(openItem._id) }).catch(() => toast?.error?.('Failed.')) }}
                  style={{ padding: '8px 14px', borderRadius: 9, border: 'none', background: CRIM, color: '#fff', fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>Save</button>
              </div>
              {openItem.notes && <div style={{ fontSize: 11.5, color: MUT, marginTop: 10, lineHeight: 1.5 }}>{openItem.notes}</div>}
            </div>
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 900, letterSpacing: '.09em', color: GOLD, textTransform: 'uppercase', marginBottom: 6 }}>Movement trail</div>
              <div style={{ display: 'grid', gap: 4, maxHeight: 180, overflow: 'auto' }}>
                {(openItem.movements || []).map((m, ix) => (
                  <div key={ix} style={{ display: 'flex', gap: 8, fontSize: 11, alignItems: 'baseline' }}>
                    <span style={{ color: MUT, whiteSpace: 'nowrap' }}>{fmtD(m.at)}</span>
                    <b style={{ color: CRIM, textTransform: 'capitalize' }}>{m.action}</b>
                    <span style={{ flex: 1, color: INK }}>{m.detail}</span>
                    <span style={{ color: MUT, fontSize: 10 }}>{m.byName}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit form */}
      {form && (
        <div style={card}>
          <b style={{ fontSize: 13.5, color: INK }}>{form._id ? 'Edit item' : 'Add item'}</b>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 10, marginTop: 12 }}>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Item name" style={input} />
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={input}>
              {data.categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={form.kind} onChange={e => setForm(f => ({ ...f, kind: e.target.value }))} style={input} disabled={!!form._id}>
              <option value="asset">Asset (tracked one by one)</option>
              <option value="consumable">Consumable (tracked by stock)</option>
            </select>
            <select value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} style={input}>
              {data.locations.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <input value={form.serialNumber} onChange={e => setForm(f => ({ ...f, serialNumber: e.target.value }))} placeholder="Serial number (optional)" style={input} />
            <input value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} placeholder="Supplier (optional)" style={input} />
            <input type="number" min="0" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} placeholder="Quantity" style={input} />
            <input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} placeholder="Unit (pcs, reams, litres)" style={input} />
            {form.kind === 'consumable' && <input type="number" min="0" value={form.reorderLevel} onChange={e => setForm(f => ({ ...f, reorderLevel: e.target.value }))} placeholder="Reorder level" style={input} />}
            <input type="number" min="0" value={form.purchaseCost} onChange={e => setForm(f => ({ ...f, purchaseCost: e.target.value }))} placeholder="Unit cost (KES)" style={input} />
            <input type="date" value={form.purchaseDate || ''} onChange={e => setForm(f => ({ ...f, purchaseDate: e.target.value }))} style={input} />
            <select value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))} style={input}>
              {['New', 'Good', 'Fair', 'Needs Repair', 'Retired'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Notes (optional)"
            style={{ ...input, width: '100%', boxSizing: 'border-box', marginTop: 10, fontFamily: 'inherit', resize: 'vertical' }} />
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button onClick={save} disabled={busy} style={{ padding: '9px 20px', borderRadius: 9, border: 'none', background: CRIM, color: '#fff', fontSize: 12, fontWeight: 800, cursor: 'pointer', opacity: busy ? 0.6 : 1 }}>{form._id ? 'Save changes' : 'Register item'}</button>
            <button onClick={() => setForm(null)} style={{ padding: '9px 16px', borderRadius: 9, border: `1.5px solid ${LINE}`, background: '#fff', color: MUT, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Stock adjust */}
      {adjust && (
        <div style={card}>
          <b style={{ fontSize: 13, color: INK }}>Adjust stock</b>
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            <input type="number" value={adjust.delta} onChange={e => setAdjust(a => ({ ...a, delta: e.target.value }))} placeholder="+10 in, -3 out" style={{ ...input, width: 130 }} />
            <input value={adjust.note} onChange={e => setAdjust(a => ({ ...a, note: e.target.value }))} placeholder="Reason (issued to Karen Centre, restock...)" style={{ ...input, flex: 1, minWidth: 200 }} />
            <button onClick={doAdjust} disabled={busy} style={{ padding: '8px 18px', borderRadius: 9, border: 'none', background: TEAL, color: '#fff', fontSize: 12, fontWeight: 800, cursor: 'pointer', opacity: busy ? 0.6 : 1 }}>Apply</button>
            <button onClick={() => setAdjust(null)} style={{ padding: '8px 14px', borderRadius: 9, border: `1.5px solid ${LINE}`, background: '#fff', color: MUT, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ fontSize: 10.5, color: MUT }}>{data.method}</div>
    </div>
  )
}
