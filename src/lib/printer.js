// src/lib/printer.js
export async function printThermalReceipt(receiptData) {
  if (!('serial' in navigator)) {
    alert('Web Serial API tidak didukung di browser ini. Gunakan Google Chrome atau MS Edge terbaru.')
    window.print() // Fallback ke sistem print bawaan browser
    return
  }

  try {
    // Minta izin ke pengguna untuk memilih port printer USB/Serial
    const port = await navigator.serial.requestPort()
    await port.open({ baudRate: 9600 })

    const writer = port.writable.getWriter()
    const encoder = new TextEncoder()

    // Perintah ESC/POS standar printer thermal
    const ESC = '\x1B'
    const INIT = ESC + '@'
    const CENTER = ESC + 'a' + '\x01'
    const LEFT = ESC + 'a' + '\x00'

    let command = INIT + CENTER
    command += "MEDIUM BREWSPACE\n"
    command += "Jl. Riau No. 88, Bandung\n"
    command += "--------------------------------\n"
    command += LEFT

    receiptData.items.forEach(item => {
      command += `${item.name}\n`
      command += `${item.quantity} x ${item.price} = ${item.quantity * item.price}\n`
    })

    command += "--------------------------------\n"
    command += `TOTAL: Rp ${receiptData.grandTotal}\n\n\n\n`

    await writer.write(encoder.encode(command))
    writer.releaseLock()
    await port.close()
  } catch (err) {
    console.error('Gagal mencetak ke printer thermal:', err)
    window.print()
  }
}