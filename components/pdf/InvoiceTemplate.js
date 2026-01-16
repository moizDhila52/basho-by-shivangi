import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Styles matching your web invoice exactly
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    backgroundColor: '#FDFBF7', // Cream background
    color: '#442D1C', // Dark brown text
    fontFamily: 'Helvetica',
  },
  // Header Section
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingBottom: 20,
  },
  brandSection: {
    flexDirection: 'column',
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold', // Basho Logo style
    marginBottom: 8,
    color: '#442D1C',
  },
  companyInfo: {
    fontSize: 9,
    color: '#78716C', // Stone-500
    lineHeight: 1.4,
  },
  invoiceMeta: {
    alignItems: 'flex-end',
  },
  invoiceTitle: {
    fontSize: 24,
    color: '#D6D3D1', // Stone-300
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 10,
  },
  metaRow: {
    fontSize: 9,
    marginBottom: 4,
    color: '#442D1C',
  },
  metaLabel: {
    fontWeight: 'bold', // Bold label
    color: '#57534E', // Stone-600
  },

  // Address Section
  addressContainer: {
    flexDirection: 'row',
    marginBottom: 40,
    gap: 40, // React-PDF doesn't support gap, handled via width/margin below
  },
  addressCol: {
    width: '45%',
  },
  colTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#A8A29E', // Stone-400
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 1,
  },
  customerName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#442D1C',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 9,
    color: '#442D1C',
    marginBottom: 2,
  },

  // Table Section
  table: {
    width: '100%',
    marginBottom: 30,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingBottom: 8,
    marginBottom: 8,
  },
  th: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#57534E', // Stone-600
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F4', // Stone-50
    paddingVertical: 10,
  },
  td: {
    fontSize: 9,
    color: '#442D1C',
  },
  // Column Widths
  col1: { width: '50%' }, // Item
  col2: { width: '15%', textAlign: 'center' }, // Qty
  col3: { width: '15%', textAlign: 'right' }, // Price
  col4: { width: '20%', textAlign: 'right' }, // Amount

  // Totals Section
  totalsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 40,
  },
  totalsBox: {
    width: '40%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  totalLabel: {
    fontSize: 9,
    color: '#57534E',
  },
  totalValue: {
    fontSize: 9,
    color: '#442D1C',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingTop: 10,
    marginTop: 4,
  },
  grandTotalText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#442D1C',
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingTop: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 8,
    color: '#A8A29E', // Stone-400
    marginBottom: 4,
  },
});

export const InvoiceDocument = ({ order, type = 'standard', settings }) => {
  const isGstInvoice = type === 'gst';

  // Parse Address safely
  const address =
    typeof order.address === 'string'
      ? JSON.parse(order.address)
      : order.address || {};

  // Tax Logic
  const SELLER_STATE = 'Gujarat';
  const buyerState = address.state || '';
  const isInterState = buyerState.toLowerCase() !== SELLER_STATE.toLowerCase();

  const formatCurrency = (num) => `Rs.${Number(num || 0).toFixed(2)}`;
  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandSection}>
            <Text style={styles.logo}>Basho</Text>
            <View style={styles.companyInfo}>
              {/* 👇 DYNAMIC ADDRESS RENDERING */}
              {sellerAddress.split(',').map((line, i) => (
                <Text key={i}>{line.trim()}</Text>
              ))}
              <Text>support@basho.com</Text>

              {/* Only show Seller GSTIN if it's a Tax Invoice */}
              {isGstInvoice && (
                <Text style={{ marginTop: 4 }}>GSTIN: {sellerGstin}</Text>
              )}
            </View>
          </View>
          <View style={styles.invoiceMeta}>
            <Text style={styles.invoiceTitle}>
              {isGstInvoice ? 'Tax Invoice' : 'Invoice'}
            </Text>
            <View style={styles.metaRow}>
              <Text>
                <Text style={styles.metaLabel}>Invoice #: </Text>
                {order.orderNumber || order.id.slice(0, 8).toUpperCase()}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Text>
                <Text style={styles.metaLabel}>Date: </Text>
                {formatDate(order.createdAt)}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Text>
                <Text style={styles.metaLabel}>Status: </Text>
                {order.paymentStatus || 'Paid'}
              </Text>
            </View>
            {isGstInvoice && (
              <View style={styles.metaRow}>
                <Text>
                  <Text style={styles.metaLabel}>Place of Supply: </Text>
                  {buyerState}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Addresses */}
        <View style={styles.addressContainer}>
          <View style={styles.addressCol}>
            <Text style={styles.colTitle}>Bill To</Text>
            <Text style={styles.customerName}>{order.customerName}</Text>
            <Text style={styles.addressText}>{order.customerEmail}</Text>
            <Text style={styles.addressText}>{order.customerPhone}</Text>
            {isGstInvoice && order.customerGst && (
              <Text
                style={{
                  ...styles.addressText,
                  marginTop: 4,
                  fontWeight: 'bold',
                }}
              >
                GSTIN: {order.customerGst}
              </Text>
            )}
          </View>
          <View style={styles.addressCol}>
            <Text style={styles.colTitle}>Ship To</Text>
            <Text style={styles.customerName}>{order.customerName}</Text>
            <Text style={styles.addressText}>{address.street}</Text>
            <Text style={styles.addressText}>
              {address.city}, {address.state}
            </Text>
            <Text style={styles.addressText}>{address.pincode}</Text>
            <Text style={styles.addressText}>{address.country || 'India'}</Text>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          {/* Header */}
          <View style={styles.tableHeader}>
            <Text style={{ ...styles.th, ...styles.col1 }}>
              Item Description
            </Text>
            <Text style={{ ...styles.th, ...styles.col2 }}>Qty</Text>
            <Text style={{ ...styles.th, ...styles.col3 }}>Price</Text>
            <Text style={{ ...styles.th, ...styles.col4 }}>Amount</Text>
          </View>

          {/* Rows */}
          {order.OrderItem.map((item, index) => {
            // Basic Logic for Price Display
            const gstRate = 0.12;
            const basePrice = isGstInvoice
              ? item.price / (1 + gstRate)
              : item.price;
            const lineTotal = basePrice * item.quantity;

            return (
              <View key={index} style={styles.tableRow}>
                <View style={styles.col1}>
                  <Text style={{ ...styles.td, fontWeight: 'bold' }}>
                    {item.productName}
                  </Text>
                  <Text style={{ fontSize: 8, color: '#78716C' }}>
                    SKU: {item.productSlug}
                  </Text>
                </View>
                <Text style={{ ...styles.td, ...styles.col2 }}>
                  {item.quantity}
                </Text>
                <Text style={{ ...styles.td, ...styles.col3 }}>
                  {formatCurrency(basePrice)}
                </Text>
                <Text
                  style={{ ...styles.td, ...styles.col4, fontWeight: 'bold' }}
                >
                  {formatCurrency(lineTotal)}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Totals */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(
                  isGstInvoice ? order.subtotal / 1.12 : order.subtotal,
                )}
              </Text>
            </View>

            {/* GST Breakdown */}
            {isGstInvoice ? (
              isInterState ? (
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>IGST (12%)</Text>
                  <Text style={styles.totalValue}>
                    {formatCurrency(order.tax)}
                  </Text>
                </View>
              ) : (
                <>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>CGST (6%)</Text>
                    <Text style={styles.totalValue}>
                      {formatCurrency(order.tax / 2)}
                    </Text>
                  </View>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>SGST (6%)</Text>
                    <Text style={styles.totalValue}>
                      {formatCurrency(order.tax / 2)}
                    </Text>
                  </View>
                </>
              )
            ) : (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tax (GST)</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(order.tax)}
                </Text>
              </View>
            )}

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Shipping</Text>
              <Text style={styles.totalValue}>
                {order.shippingCost === 0
                  ? 'Free'
                  : formatCurrency(order.shippingCost)}
              </Text>
            </View>

            {order.discount > 0 && (
              <View style={styles.totalRow}>
                <Text style={{ ...styles.totalLabel, color: '#16A34A' }}>
                  Discount
                </Text>
                <Text style={{ ...styles.totalValue, color: '#16A34A' }}>
                  -{formatCurrency(order.discount)}
                </Text>
              </View>
            )}

            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalText}>Total</Text>
              <Text style={styles.grandTotalText}>
                {formatCurrency(order.total)}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Thank you for choosing Basho. We hope you cherish your clay
            treasures.
          </Text>
          <Text style={styles.footerText}>
            For any questions regarding this invoice, please contact
            support@basho.com
          </Text>
        </View>
      </Page>
    </Document>
  );
};
