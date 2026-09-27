// ESC/POS Command Generator & Web Bluetooth API Handler

// Kode Perintah ESC/POS Sederhana
const ESC = '\x1B'
const GS = '\x1D'

const COMMANDS = {
  INIT: ESC + '@',
  ALIGN_CENTER: ESC + 'a' + '\x01',
  ALIGN_LEFT: ESC + 'a' + '\x00',
  ALIGN_RIGHT: ESC + 'a' + '\x02',
  BOLD_ON: ESC + 'E' + '\x01',
  BOLD_OFF: ESC + 'E' + '\x00',
  TEXT_DOUBLE_HEIGHT: ESC + '!' + '\x10',
  TEXT_NORMAL: ESC + '!' + '\x00',
  CUT_PAPER: GS + 'V' + '\x41' + '\x03',
  FEED_LINES: (n) => ESC + 'd' + String.fromCharCode(n)
}

let connectedDevice = null
let printerCharacteristic = null

// 1. Hubungkan ke Printer Bluetooth
export async function connectBluetoothPrinter() {
  if (!navigator.bluetooth) {
    throw new Error('Browser ini belum mendukung Web Bluetooth API. Gunakan Google Chrome/Edge terbaru.')
  }

  const device = await navigator.bluetooth.requestDevice({
    acceptAllDevices: true,
    optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb', '49535343-fe7d-4ae5-8fa9-9fafd205e455']
  })

  const server = await device.gatt.connect()
  const services = await server.getPrimaryServices()

  if (services.length === 0) {
    throw new Error('Layanan printer bluetooth tidak ditemukan pada perangkat ini.')
  }

  // Cari Karakteristik Writable untuk Mengirim Perintah Cetak
  for (const service of services) {
    const characteristics = await service.getCharacteristics()
    for (const char of characteristics) {
      if (char.properties.write || char.properties.writeWithoutResponse) {
        printerCharacteristic = char
        connectedDevice = device
        return device.name || 'Printer Thermal Bluetooth'
      }
    }
  }

  throw new Error('Karakteristik cetak printer tidak ditemukan.')
}

// 2. Format Data Struk ke Byte ESC/POS
function generateReceiptBuffer(transactionData) {
  let text = ''

  // Header Store
  text += COMMANDS.INIT
  text += COMMANDS.ALIGN_CENTER
  text += COMMANDS.BOLD_ON + COMMANDS.TEXT_DOUBLE_HEIGHT
  text += 'MEDIUM BREWSPACE\n'
  text += COMMANDS.TEXT_NORMAL + COMMANDS.BOLD_OFF
  text += 'Jl. Kopi Harapan No. 12\n'
  text += '================================\n'

  // Info Transaksi
  text += COMMANDS.ALIGN_LEFT
  text += `No   : ${transactionData.order_number || 'ORD-000'}\n`
  text += `Tgl  : ${transactionData.date || new Date().toLocaleString('id-ID')}\n`
  text += `Kasir: ${transactionData.cashier || 'Kasir'}\n`
  text += `Plgn : ${transactionData.customer || 'Umum'}\n`
  text += '--------------------------------\n'

  // Daftar Item
  const items = transactionData.items || []
  items.forEach((item) => {
    text += `${item.name}\n`
    const qtyPrice = `${item.quantity} x ${parseFloat(item.finalPrice || item.price).toLocaleString('id-ID')}`
    const subtotal = `Rp ${(item.quantity * (item.finalPrice || item.price)).toLocaleString('id-ID')}`
    const spaceCount = Math.max(1, 32 - qtyPrice.length - subtotal.length)
    text += qtyPrice + ' '.repeat(spaceCount) + subtotal + '\n'
  })

  text += '--------------------------------\n'

  // Total & Pembayaran
  text += COMMANDS.BOLD_ON
  const totalLabel = 'TOTAL :'
  const totalVal = `Rp ${parseFloat(transactionData.grandTotal || 0).toLocaleString('id-ID')}`
  const totalSpaces = Math.max(1, 32 - totalLabel.length - totalVal.length)
  text += totalLabel + ' '.repeat(totalSpaces) + totalVal + '\n'
  text += COMMANDS.BOLD_OFF

  const changeLabel = 'KEMBALI:'
  const changeVal = `Rp ${parseFloat(transactionData.change || 0).toLocaleString('id-ID')}`
  const changeSpaces = Math.max(1, 32 - changeLabel.length - changeVal.length)
  text += changeLabel + ' '.repeat(changeSpaces) + changeVal + '\n'

  text += '================================\n'
  text += COMMANDS.ALIGN_CENTER
  text += 'Terima kasih atas kunjungan Anda!\n'
  text += 'Powered by Medium Brew POS\n\n\n'
  text += COMMANDS.FEED_LINES(3)

  // Encode Text ke Uint8Array
  const encoder = new TextEncoder()
  return encoder.encode(text)
}

// 3. Kirim Data Ke Printer
export async function printDirectBluetooth(transactionData) {
  if (!printerCharacteristic) {
    await connectBluetoothPrinter()
  }

  const buffer = generateReceiptBuffer(transactionData)
  
  // Kirim data per-chunk 512 byte agar tidak overflow
  const chunkSize = 512
  for (let i = 0; i < buffer.length; i += chunkSize) {
    const chunk = buffer.slice(i, i + chunkSize)
    if (printerCharacteristic.properties.writeWithoutResponse) {
      await printerCharacteristic.writeValueWithoutResponse(chunk)
    } else {
      await printerCharacteristic.writeValueWithResponse(chunk)
    }
  }
}