import ExcelJS from 'exceljs'

export async function exportToExcel(ordersData, startDate, endDate) {
  if (!ordersData || ordersData.length === 0) {
    alert('Tidak ada data penjualan untuk diekspor!')
    return
  }

  const workbook = new ExcelJS.Workbook()
  
  // Sheet 1: Ringkasan Penjualan
  const summarySheet = workbook.addWorksheet('Ringkasan Penjualan')
  summarySheet.columns = [
    { header: 'No. Order', key: 'order_number', width: 22 },
    { header: 'Tanggal & Waktu', key: 'created_at', width: 22 },
    { header: 'Pelanggan', key: 'customer', width: 18 },
    { header: 'Tipe Order', key: 'order_type', width: 14 },
    { header: 'Meja / Area', key: 'table_number', width: 16 },
    { header: 'Total Belanja (Rp)', key: 'total_amount', width: 18 },
    { header: 'Status', key: 'status', width: 14 }
  ]

  ordersData.forEach(order => {
    summarySheet.addRow({
      order_number: order.order_number || '-',
      created_at: new Date(order.created_at).toLocaleString('id-ID'),
      customer: order.customers?.name || 'Umum',
      order_type: order.order_type || 'DINE_IN',
      table_number: order.table_number || '-',
      total_amount: parseFloat(order.total_amount || 0),
      status: order.status || 'COMPLETED'
    })
  })

  // Format Header Sheet 1
  summarySheet.getRow(1).font = { bold: true }

  // Sheet 2: Rincian Item Terjual
  const itemSheet = workbook.addWorksheet('Rincian Item Terjual')
  itemSheet.columns = [
    { header: 'No. Order', key: 'order_number', width: 22 },
    { header: 'Waktu Transaksi', key: 'created_at', width: 22 },
    { header: 'Nama Produk', key: 'product_name', width: 26 },
    { header: 'Varian', key: 'variant_name', width: 14 },
    { header: 'Jumlah (Qty)', key: 'quantity', width: 12 },
    { header: 'Harga Satuan (Rp)', key: 'unit_price', width: 18 },
    { header: 'Subtotal (Rp)', key: 'subtotal', width: 18 }
  ]

  ordersData.forEach(order => {
    if (order.order_items && order.order_items.length > 0) {
      order.order_items.forEach(item => {
        itemSheet.addRow({
          order_number: order.order_number || '-',
          created_at: new Date(order.created_at).toLocaleString('id-ID'),
          product_name: item.product_variants?.products?.name || item.name || 'Produk',
          variant_name: item.product_variants?.variant_name || 'Regular',
          quantity: item.quantity || 1,
          unit_price: parseFloat(item.unit_price || 0),
          subtotal: parseFloat(item.subtotal || 0)
        })
      })
    }
  })

  // Format Header Sheet 2
  itemSheet.getRow(1).font = { bold: true }

  // Generate & Download File .xlsx
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = window.URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `Rekap_MediumBrew_${startDate}_sd_${endDate}.xlsx`
  anchor.click()
  window.URL.revokeObjectURL(url)
}