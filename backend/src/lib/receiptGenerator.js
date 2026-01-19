const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class ReceiptGenerator {
  static async generateReceipt(order, customer, partner) {
    const receiptNumber = `REC-${Date.now()}-${order.orderId.split('-')[2]}`;
    const receiptPath = path.join('uploads', 'receipts', `${receiptNumber}.pdf`);
    
    // Ensure receipts directory exists
    const receiptsDir = path.dirname(receiptPath);
    if (!fs.existsSync(receiptsDir)) {
      fs.mkdirSync(receiptsDir, { recursive: true });
    }

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(receiptPath);
        doc.pipe(stream);

        // Header
        doc.fontSize(20).text('PURCHASE RECEIPT', { align: 'center' });
        doc.moveDown();
        
        // Receipt Info
        doc.fontSize(12);
        doc.text(`Receipt No: ${receiptNumber}`, 50, doc.y);
        doc.text(`Order ID: ${order.orderId}`, 350, doc.y - 12);
        doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 50, doc.y);
        doc.text(`Time: ${new Date(order.createdAt).toLocaleTimeString('en-IN')}`, 350, doc.y - 12);
        doc.moveDown();

        // Vendor Information
        doc.fontSize(14).text('VENDOR INFORMATION:', { underline: true });
        doc.fontSize(10);
        doc.text(`Business: ${partner.vendorAddress?.businessName || partner.name}`);
        if (partner.vendorAddress) {
          doc.text(`Address: ${partner.vendorAddress.street}, ${vendor.vendorAddress.city}, ${vendor.vendorAddress.state} - ${vendor.vendorAddress.zipCode}`);
          doc.text(`Contact: ${partner.vendorAddress.contactNumber || partner.phone || 'N/A'}`);
          if (partner.vendorAddress.gstNumber) {
            doc.text(`GST No: ${partner.vendorAddress.gstNumber}`);
          }
        }
        doc.moveDown();

        // Customer Information
        doc.fontSize(14).text('CUSTOMER INFORMATION:', { underline: true });
        doc.fontSize(10);
        doc.text(`Name: ${customer.name}`);
        doc.text(`Email: ${customer.email}`);
        if (order.shippingAddress) {
          doc.text(`Shipping: ${order.shippingAddress.fullName}`);
          doc.text(`Address: ${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.zipCode}`);
          doc.text(`Phone: ${order.shippingAddress.phone}`);
        }
        doc.moveDown();

        // Items Table Header
        doc.fontSize(14).text('ITEMS PURCHASED:', { underline: true });
        doc.fontSize(10);
        
        const tableTop = doc.y + 10;
        doc.text('Item', 50, tableTop);
        doc.text('Qty', 200, tableTop);
        doc.text('Original Price', 250, tableTop);
        doc.text('Discount', 330, tableTop);
        doc.text('Final Price', 400, tableTop);
        doc.text('Coins Used', 480, tableTop);
        
        // Draw line
        doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

        let currentY = tableTop + 25;
        let totalOriginal = 0;
        let totalDiscount = 0;
        let totalFinal = 0;
        let totalCoins = 0;

        // Items
        order.items.forEach((item) => {
          doc.text(item.product.title || 'Product', 50, currentY, { width: 140 });
          doc.text(item.quantity.toString(), 200, currentY);
          doc.text(`₹${item.totalOriginalPrice}`, 250, currentY);
          doc.text(`₹${item.totalDiscountAmount}`, 330, currentY);
          doc.text(`₹${item.totalFinalPrice}`, 400, currentY);
          doc.text(`${item.totalCoinsPaid} coins`, 480, currentY);
          
          totalOriginal += item.totalOriginalPrice;
          totalDiscount += item.totalDiscountAmount;
          totalFinal += item.totalFinalPrice;
          totalCoins += item.totalCoinsPaid;
          
          currentY += 20;
        });

        // Draw line before totals
        doc.moveTo(50, currentY + 5).lineTo(550, currentY + 5).stroke();
        currentY += 20;

        // Totals
        doc.fontSize(11);
        doc.text('TOTALS:', 50, currentY, { underline: true });
        currentY += 15;
        
        doc.text('Total Original Amount:', 300, currentY);
        doc.text(`₹${totalOriginal}`, 480, currentY);
        currentY += 15;
        
        doc.text('Total Discount Applied:', 300, currentY);
        doc.text(`₹${totalDiscount}`, 480, currentY);
        currentY += 15;
        
        doc.text('Final Amount Payable:', 300, currentY);
        doc.text(`₹${totalFinal}`, 480, currentY);
        currentY += 15;
        
        doc.fontSize(12).text('Total Coins Used:', 300, currentY, { underline: true });
        doc.text(`${totalCoins} coins`, 480, currentY, { underline: true });
        currentY += 20;

        // Conversion Info
        doc.fontSize(9);
        doc.text(`Conversion Rate: 1 coin = ₹${order.coinConversionRate || 1}`, 50, currentY);
        currentY += 20;

        // Payment Status
        doc.fontSize(12);
        doc.text('PAYMENT STATUS: COMPLETED', 50, currentY, { 
          fillColor: 'green',
          underline: true 
        });
        currentY += 15;
        
        doc.fillColor('black');
        doc.fontSize(10);
        doc.text('Payment Method: Coins from Wallet', 50, currentY);
        doc.text(`Transaction ID: ${order._id}`, 50, currentY + 12);

        // Footer
        doc.fontSize(8);
        doc.text('This is a computer-generated receipt. Thank you for your purchase!', 50, doc.page.height - 100, {
          align: 'center'
        });

        doc.end();

        stream.on('finish', () => {
          resolve({
            receiptNumber,
            receiptPath: receiptPath.replace('uploads/', '/uploads/'),
            receiptUrl: `/uploads/receipts/${receiptNumber}.pdf`
          });
        });

        stream.on('error', reject);

      } catch (error) {
        reject(error);
      }
    });
  }

  static generateReceiptNumber() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `REC-${new Date().getFullYear()}-${timestamp}-${random}`;
  }
}

module.exports = { ReceiptGenerator };